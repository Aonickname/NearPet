package com.nearpet.backend.reservation.repository;

import com.nearpet.backend.reservation.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
