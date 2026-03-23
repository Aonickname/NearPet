package com.nearpet.backend.admin.controller;

import com.nearpet.backend.admin.dto.AdminSettingsRequest;
import com.nearpet.backend.admin.dto.AdminSettingsResponse;
import com.nearpet.backend.admin.service.AdminSettingsService;
import com.nearpet.backend.global.ForbiddenOperationException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    public AdminSettingsController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public AdminSettingsResponse getSettings(@RequestHeader(value = "X-User-Role", required = false) String requesterRole) {
        ensureAdmin(requesterRole);
        return adminSettingsService.getSettings();
    }

    @PutMapping
    public AdminSettingsResponse updateSettings(
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @Valid @RequestBody AdminSettingsRequest request
    ) {
        ensureAdmin(requesterRole);
        return adminSettingsService.updateNotificationEmail(request.notificationEmail());
    }

    private void ensureAdmin(String requesterRole) {
        if (!"ADMIN".equalsIgnoreCase(requesterRole)) {
            throw new ForbiddenOperationException("관리자만 설정을 변경할 수 있습니다.");
        }
    }
}
