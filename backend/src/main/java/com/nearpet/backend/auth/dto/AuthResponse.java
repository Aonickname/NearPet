package com.nearpet.backend.auth.dto;

public record AuthResponse(
        Long id,
        String username,
        String name,
        String role
) {
}
