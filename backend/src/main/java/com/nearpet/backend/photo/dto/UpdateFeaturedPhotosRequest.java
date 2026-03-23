package com.nearpet.backend.photo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateFeaturedPhotosRequest(
        @NotNull(message = "대표 이미지 목록은 필수입니다.")
        @Size(max = 6, message = "대표 이미지는 최대 6장까지 선택할 수 있습니다.")
        List<Long> photoIds
) {
}
