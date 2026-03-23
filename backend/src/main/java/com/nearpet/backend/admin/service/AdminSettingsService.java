package com.nearpet.backend.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearpet.backend.admin.dto.AdminSettingsResponse;
import com.nearpet.backend.admin.model.AdminSettings;
import com.nearpet.backend.admin.repository.AdminSettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Transactional
public class AdminSettingsService {

    private static final long DEFAULT_SETTINGS_ID = 1L;

    private final ObjectMapper objectMapper;
    private final AdminSettingsRepository adminSettingsRepository;
    private final Path legacyStoragePath;

    public AdminSettingsService(
            ObjectMapper objectMapper,
            AdminSettingsRepository adminSettingsRepository,
            @Value("${app.storage.admin-settings-file:data/admin-settings.json}") String storageFile
    ) {
        this.objectMapper = objectMapper;
        this.adminSettingsRepository = adminSettingsRepository;
        this.legacyStoragePath = Path.of(storageFile);
    }

    @PostConstruct
    void initialize() {
        try {
            if (legacyStoragePath.getParent() != null) {
                Files.createDirectories(legacyStoragePath.getParent());
            }
        } catch (IOException exception) {
            throw new IllegalStateException("관리자 설정 저장소를 초기화하지 못했습니다.", exception);
        }

        if (adminSettingsRepository.count() == 0) {
            importLegacySettingsOrSeedDefault();
        }
    }

    @Transactional(readOnly = true)
    public AdminSettingsResponse getSettings() {
        AdminSettings settings = getOrCreateSettings();
        return new AdminSettingsResponse(settings.getNotificationEmail());
    }

    public AdminSettingsResponse updateNotificationEmail(String notificationEmail) {
        AdminSettings settings = getOrCreateSettings();
        settings.updateNotificationEmail(notificationEmail == null ? "" : notificationEmail.trim());
        adminSettingsRepository.save(settings);
        return getSettings();
    }

    @Transactional(readOnly = true)
    public String getNotificationEmailValue() {
        return getOrCreateSettings().getNotificationEmail();
    }

    private AdminSettings getOrCreateSettings() {
        return adminSettingsRepository.findById(DEFAULT_SETTINGS_ID)
                .orElseGet(() -> adminSettingsRepository.save(new AdminSettings(DEFAULT_SETTINGS_ID, "")));
    }

    private void importLegacySettingsOrSeedDefault() {
        if (Files.exists(legacyStoragePath)) {
            try {
                LegacyAdminSettings legacy = objectMapper.readValue(legacyStoragePath.toFile(), LegacyAdminSettings.class);
                adminSettingsRepository.save(new AdminSettings(DEFAULT_SETTINGS_ID, normalizeEmail(legacy.notificationEmail())));
                return;
            } catch (IOException exception) {
                throw new IllegalStateException("기존 관리자 설정을 불러오지 못했습니다.", exception);
            }
        }

        adminSettingsRepository.save(new AdminSettings(DEFAULT_SETTINGS_ID, ""));
    }

    private String normalizeEmail(String notificationEmail) {
        return notificationEmail == null ? "" : notificationEmail.trim();
    }

    private record LegacyAdminSettings(String notificationEmail) {
    }
}
