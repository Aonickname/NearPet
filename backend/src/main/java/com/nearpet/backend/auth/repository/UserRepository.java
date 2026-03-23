package com.nearpet.backend.auth.repository;

import com.nearpet.backend.auth.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    boolean existsByUsername(String username);

    Optional<AppUser> findByUsername(String username);
}
