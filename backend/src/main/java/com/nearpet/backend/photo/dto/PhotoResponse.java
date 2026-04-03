package com.nearpet.backend.photo.dto;

import java.util.List;

public record PhotoResponse(
        Long id,
        String imageUrl,
        List<String> imageUrls,
        String description,
        boolean hasMultipleImages,
        boolean featured,
        Integer featuredOrder
) {
}
