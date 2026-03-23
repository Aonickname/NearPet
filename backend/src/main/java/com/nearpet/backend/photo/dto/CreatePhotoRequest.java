package com.nearpet.backend.photo.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePhotoRequest(
        @NotBlank(message = "사진 URL은 필수입니다.")
        String imageUrl,
        String description
) {
}
