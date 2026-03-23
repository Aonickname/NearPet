package com.nearpet.backend.admin.repository;

import com.nearpet.backend.admin.model.AdminSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingsRepository extends JpaRepository<AdminSettings, Long> {
}
