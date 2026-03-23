package com.nearpet.backend.reservation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @Column(name = "owner_username", length = 255)
    private String ownerUsername;

    @Column(name = "customer_name", nullable = false, length = 255)
    private String customerName;

    @Column(nullable = false, length = 255)
    private String contact;

    @Column(name = "pet_name", nullable = false, length = 255)
    private String petName;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    @Column(nullable = false, length = 1000)
    private String notes;

    protected Reservation() {
    }

    public Reservation(
            Long ownerUserId,
            String ownerUsername,
            String customerName,
            String contact,
            String petName,
            LocalDate reservationDate,
            LocalTime reservationTime,
            String notes
    ) {
        this.ownerUserId = ownerUserId;
        this.ownerUsername = ownerUsername;
        this.customerName = customerName;
        this.contact = contact;
        this.petName = petName;
        this.reservationDate = reservationDate;
        this.reservationTime = reservationTime;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getContact() {
        return contact;
    }

    public String getPetName() {
        return petName;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public LocalTime getReservationTime() {
        return reservationTime;
    }

    public String getNotes() {
        return notes;
    }

    public void update(
            String customerName,
            String contact,
            String petName,
            LocalDate reservationDate,
            LocalTime reservationTime,
            String notes
    ) {
        this.customerName = customerName;
        this.contact = contact;
        this.petName = petName;
        this.reservationDate = reservationDate;
        this.reservationTime = reservationTime;
        this.notes = notes;
    }
}
