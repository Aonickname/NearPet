package com.nearpet.backend.auth.service;

import com.nearpet.backend.auth.dto.AuthResponse;
import com.nearpet.backend.auth.dto.LoginRequest;
import com.nearpet.backend.auth.dto.SignupRequest;
import com.nearpet.backend.auth.model.AppUser;
import com.nearpet.backend.auth.model.UserRole;
import com.nearpet.backend.auth.repository.UserRepository;
import com.nearpet.backend.global.UnauthorizedException;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    void seedAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new AppUser(
                    "admin",
                    passwordEncoder.encode("admin1234"),
                    "관리자",
                    UserRole.ADMIN
            ));
        }
    }

    public AuthResponse signup(SignupRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        AppUser user = userRepository.save(new AppUser(
                username,
                passwordEncoder.encode(request.password()),
                request.name().trim(),
                UserRole.USER
        ));

        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다."));

        boolean matches = passwordEncoder.matches(request.password(), user.getPassword());
        boolean legacyMatches = !user.getPassword().startsWith("$2") && user.getPassword().equals(request.password());

        if (!matches && !legacyMatches) {
            throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        if (legacyMatches) {
            user.updatePassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole().name()
        );
    }
}
