package com.nearpet.backend.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateReservationRequest(
        @NotBlank(message = "보호자 이름은 필수입니다.")
        String customerName,

        @NotBlank(message = "연락처는 필수입니다.")
        String contact,

        @NotBlank(message = "반려동물 이름은 필수입니다.")
        String petName,

        @NotNull(message = "예약 날짜는 필수입니다.")
        LocalDate reservationDate,

        @NotNull(message = "예약 시간은 필수입니다.")
        LocalTime reservationTime,

        String notes
) {
}
