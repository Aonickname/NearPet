package com.nearpet.backend.reservation.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearpet.backend.global.ForbiddenOperationException;
import com.nearpet.backend.global.ResourceNotFoundException;
import com.nearpet.backend.global.UnauthorizedException;
import com.nearpet.backend.reservation.dto.CreateReservationRequest;
import com.nearpet.backend.reservation.dto.ReservationResponse;
import com.nearpet.backend.reservation.dto.TimeSlotResponse;
import com.nearpet.backend.reservation.dto.UpdateReservationRequest;
import com.nearpet.backend.reservation.exception.ReservationConflictException;
import com.nearpet.backend.reservation.model.Reservation;
import com.nearpet.backend.reservation.repository.ReservationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    private static final List<LocalTime> AVAILABLE_TIMES = List.of(
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            LocalTime.of(13, 0),
            LocalTime.of(14, 0),
            LocalTime.of(15, 0),
            LocalTime.of(16, 0)
    );

    private final ObjectMapper objectMapper;
    private final ReservationRepository reservationRepository;
    private final Path legacyStoragePath;
    private final ReservationNotificationService reservationNotificationService;

    public ReservationService(
            ObjectMapper objectMapper,
            ReservationRepository reservationRepository,
            @Value("${app.storage.reservations-file:data/reservations.json}") String storageFile,
            ReservationNotificationService reservationNotificationService
    ) {
        this.objectMapper = objectMapper;
        this.reservationRepository = reservationRepository;
        this.legacyStoragePath = Path.of(storageFile);
        this.reservationNotificationService = reservationNotificationService;
    }

    @PostConstruct
    void initialize() {
        try {
            if (legacyStoragePath.getParent() != null) {
                Files.createDirectories(legacyStoragePath.getParent());
            }
        } catch (IOException exception) {
            throw new IllegalStateException("예약 저장소를 초기화하지 못했습니다.", exception);
        }

        if (reservationRepository.count() == 0) {
            importLegacyReservationsOrSeedDefault();
        }
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservations() {
        return reservationRepository.findAll().stream()
                .sorted(Comparator
                        .comparing(Reservation::getReservationDate)
                        .thenComparing(Reservation::getReservationTime))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getAvailability(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findAll();
        return AVAILABLE_TIMES.stream()
                .map(time -> new TimeSlotResponse(time, isAvailable(reservations, date, time, null)))
                .toList();
    }

    public ReservationResponse createReservation(
            CreateReservationRequest request,
            Long requesterUserId,
            String requesterUsername
    ) {
        ensureAuthenticated(requesterUserId, requesterUsername);
        validateTimeSlot(request.reservationTime());

        List<Reservation> reservations = reservationRepository.findAll();
        if (!isAvailable(reservations, request.reservationDate(), request.reservationTime(), null)) {
            throw new ReservationConflictException("이미 예약된 시간입니다.");
        }

        Reservation reservation = reservationRepository.save(new Reservation(
                requesterUserId,
                requesterUsername,
                request.customerName().trim(),
                request.contact().trim(),
                request.petName().trim(),
                request.reservationDate(),
                request.reservationTime(),
                normalizeNotes(request.notes())
        ));

        reservationNotificationService.sendReservationCreatedEmail(reservation);
        return toResponse(reservation);
    }

    public ReservationResponse updateReservation(
            Long id,
            UpdateReservationRequest request,
            Long requesterUserId,
            String requesterRole
    ) {
        ensureAuthenticated(requesterUserId, null);
        validateTimeSlot(request.reservationTime());

        Reservation existing = findById(id);
        ensureReservationOwnerOrAdmin(existing, requesterUserId, requesterRole);

        List<Reservation> reservations = reservationRepository.findAll();
        if (!isAvailable(reservations, request.reservationDate(), request.reservationTime(), id)) {
            throw new ReservationConflictException("이미 예약된 시간입니다.");
        }

        existing.update(
                request.customerName().trim(),
                request.contact().trim(),
                request.petName().trim(),
                request.reservationDate(),
                request.reservationTime(),
                normalizeNotes(request.notes())
        );

        reservationRepository.save(existing);
        return toResponse(existing);
    }

    public void deleteReservation(Long id, Long requesterUserId, String requesterRole) {
        ensureAuthenticated(requesterUserId, null);
        Reservation existing = findById(id);

        boolean isOwner = existing.getOwnerUserId() != null && existing.getOwnerUserId().equals(requesterUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);

        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("본인 예약만 삭제할 수 있습니다.");
        }

        reservationRepository.delete(existing);
    }

    private void ensureAuthenticated(Long requesterUserId, String requesterUsername) {
        if (requesterUserId == null) {
            throw new UnauthorizedException("로그인 후 이용해주세요!");
        }

        if (requesterUsername != null && requesterUsername.isBlank()) {
            throw new UnauthorizedException("로그인 정보가 올바르지 않습니다.");
        }
    }

    private void ensureReservationOwnerOrAdmin(Reservation reservation, Long requesterUserId, String requesterRole) {
        boolean isOwner = reservation.getOwnerUserId() != null && reservation.getOwnerUserId().equals(requesterUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);
        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("본인 예약만 수정할 수 있습니다.");
        }
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("예약 정보를 찾을 수 없습니다."));
    }

    private boolean isAvailable(List<Reservation> reservations, LocalDate date, LocalTime time, Long excludeId) {
        return reservations.stream()
                .filter(reservation -> excludeId == null || !reservation.getId().equals(excludeId))
                .noneMatch(reservation ->
                        reservation.getReservationDate().equals(date)
                                && reservation.getReservationTime().equals(time));
    }

    private void validateTimeSlot(LocalTime time) {
        if (!AVAILABLE_TIMES.contains(time)) {
            throw new IllegalArgumentException("예약 가능한 시간대가 아닙니다.");
        }
    }

    private void importLegacyReservationsOrSeedDefault() {
        if (Files.exists(legacyStoragePath)) {
            try (InputStream inputStream = Files.newInputStream(legacyStoragePath)) {
                List<LegacyReservation> loadedReservations = objectMapper.readValue(inputStream, new TypeReference<>() {
                });
                List<Reservation> importedReservations = loadedReservations.stream()
                        .map(reservation -> new Reservation(
                                reservation.ownerUserId(),
                                reservation.ownerUsername(),
                                reservation.customerName(),
                                reservation.contact(),
                                reservation.petName(),
                                reservation.reservationDate(),
                                reservation.reservationTime(),
                                normalizeNotes(reservation.notes())
                        ))
                        .toList();
                reservationRepository.saveAll(importedReservations);
                return;
            } catch (IOException exception) {
                throw new IllegalStateException("기존 예약 데이터를 불러오지 못했습니다.", exception);
            }
        }

        reservationRepository.save(new Reservation(
                1L,
                "admin",
                "김보호",
                "010-1234-5678",
                "보리",
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                "첫 방문, 낯을 조금 가려요."
        ));
    }

    private String normalizeNotes(String notes) {
        return notes == null ? "" : notes.trim();
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getOwnerUserId(),
                reservation.getOwnerUsername(),
                reservation.getCustomerName(),
                reservation.getContact(),
                reservation.getPetName(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getNotes()
        );
    }

    private record LegacyReservation(
            Long id,
            Long ownerUserId,
            String ownerUsername,
            String customerName,
            String contact,
            String petName,
            LocalDate reservationDate,
            LocalTime reservationTime,
            String notes
    ) {
    }
}
