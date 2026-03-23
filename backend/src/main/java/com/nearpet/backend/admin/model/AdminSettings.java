package com.nearpet.backend.admin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_settings")
public class AdminSettings {

    @Id
    private Long id;

    @Column(name = "notification_email", nullable = false, length = 255)
    private String notificationEmail;

    protected AdminSettings() {
    }

    public AdminSettings(Long id, String notificationEmail) {
        this.id = id;
        this.notificationEmail = notificationEmail;
    }

    public Long getId() {
        return id;
    }

    public String getNotificationEmail() {
        return notificationEmail;
    }

    public void updateNotificationEmail(String notificationEmail) {
        this.notificationEmail = notificationEmail;
    }
}
