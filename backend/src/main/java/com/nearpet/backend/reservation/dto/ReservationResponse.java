package com.nearpet.backend.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
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
