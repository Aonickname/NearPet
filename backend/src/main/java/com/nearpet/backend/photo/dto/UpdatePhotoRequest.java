package com.nearpet.backend.photo.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePhotoRequest(
        String description,
        @NotBlank(message = "대표 이미지 URL은 필수입니다.")
        String coverImageUrl
) {
}
