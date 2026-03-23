package com.nearpet.backend.reservation.service;

import com.nearpet.backend.admin.service.AdminSettingsService;
import com.nearpet.backend.reservation.model.Reservation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

@Service
public class ReservationNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(ReservationNotificationService.class);

    private final JavaMailSender mailSender;
    private final AdminSettingsService adminSettingsService;
    private final String fromEmail;

    public ReservationNotificationService(
            JavaMailSender mailSender,
            AdminSettingsService adminSettingsService,
            @Value("${app.mail.from:}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.adminSettingsService = adminSettingsService;
        this.fromEmail = fromEmail;
    }

    public void sendReservationCreatedEmail(Reservation reservation) {
        String recipient = adminSettingsService.getNotificationEmailValue();
        if (recipient == null || recipient.isBlank()) {
            logger.info("Reservation email skipped: notification email is not configured.");
            return;
        }

        if (mailSender instanceof JavaMailSenderImpl sender && (sender.getHost() == null || sender.getHost().isBlank())) {
            logger.info("Reservation email skipped: SMTP host is not configured.");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }
        message.setTo(recipient);
        message.setSubject("[NearPet] 새 예약이 등록되었습니다.");
        message.setText("""
                새로운 예약이 등록되었습니다.

                보호자 이름: %s
                연락처: %s
                반려동물 이름: %s
                예약 날짜: %s
                예약 시간: %s
                요청 사항: %s
                예약자 아이디: %s
                """.formatted(
                reservation.getCustomerName(),
                reservation.getContact(),
                reservation.getPetName(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getNotes() == null || reservation.getNotes().isBlank() ? "없음" : reservation.getNotes(),
                reservation.getOwnerUsername()
        ));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            logger.warn("Failed to send reservation email: {}", exception.getMessage());
        }
    }
}
