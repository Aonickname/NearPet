package com.nearpet.backend.admin.dto;

import jakarta.validation.constraints.Email;

public record AdminSettingsRequest(
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String notificationEmail
) {
}
