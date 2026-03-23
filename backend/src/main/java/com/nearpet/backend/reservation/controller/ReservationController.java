package com.nearpet.backend.reservation.controller;

import com.nearpet.backend.reservation.dto.CreateReservationRequest;
import com.nearpet.backend.reservation.dto.ReservationResponse;
import com.nearpet.backend.reservation.dto.TimeSlotResponse;
import com.nearpet.backend.reservation.dto.UpdateReservationRequest;
import com.nearpet.backend.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<ReservationResponse> getReservations() {
        return reservationService.getReservations();
    }

    @GetMapping("/availability")
    public List<TimeSlotResponse> getAvailability(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return reservationService.getAvailability(date);
    }

    @PostMapping
    public ReservationResponse createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long requesterUserId,
            @RequestHeader(value = "X-Username", required = false) String requesterUsername
    ) {
        return reservationService.createReservation(request, requesterUserId, requesterUsername);
    }

    @PutMapping("/{id}")
    public ReservationResponse updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long requesterUserId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        return reservationService.updateReservation(id, request, requesterUserId, requesterRole);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReservation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long requesterUserId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        reservationService.deleteReservation(id, requesterUserId, requesterRole);
    }
}
