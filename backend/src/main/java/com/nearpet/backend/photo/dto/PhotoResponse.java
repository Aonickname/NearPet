package com.nearpet.backend.photo.dto;

public record PhotoResponse(
        Long id,
        String imageUrl,
        String description,
        boolean featured,
        Integer featuredOrder
) {
}
