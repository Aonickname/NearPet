package com.nearpet.backend.reservation.dto;

import java.time.LocalTime;

public record TimeSlotResponse(
        LocalTime time,
        boolean available
) {
}
