import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reservation.css';
import { request } from '../api';

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

function createMonthDates(baseDate) {
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const dates = [];

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const current = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
    dates.push(current.toISOString().split('T')[0]);
  }

  return dates;
}

function maskName(name) {
  if (!name) {
    return '';
  }

  if (name.length <= 1) {
    return '*';
  }

  return `${name[0]}${'*'.repeat(name.length - 1)}`;
}

function maskContact(contact) {
  if (!contact) {
    return '';
  }

  const trimmedContact = contact.trim();

  if (trimmedContact.includes('@')) {
    const [localPart, domain = ''] = trimmedContact.split('@');
    const visibleLocal = localPart.slice(0, 4);
    return `${visibleLocal}${'*'.repeat(Math.max(4, localPart.length - visibleLocal.length))}@${domain}`;
  }

  const digits = trimmedContact.replace(/\D/g, '');
  if (digits.length >= 10) {
    const middle = digits.length === 10 ? digits.slice(3, 6) : digits.slice(3, 7);
    return `${digits.slice(0, 3)}-${middle}-****`;
  }

  return `${trimmedContact.slice(0, Math.min(4, trimmedContact.length))}****`;
}

function Reservation({ user }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayString = today.toISOString().split('T')[0];
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    contact: '',
    petName: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleDates = useMemo(() => createMonthDates(viewMonth), [viewMonth]);

  async function fetchReservations() {
    const data = await request('/reservations');
    setReservations(data);
  }

  async function fetchAvailability(date) {
    const data = await request(`/reservations/availability?date=${date}`);
    setAvailability(data);
  }

  useEffect(() => {
    async function loadReservations() {
      setLoading(true);
      setError('');

      try {
        await fetchReservations();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setFormData((current) => ({
        ...current,
        customerName: current.customerName || user.name,
      }));
    }
  }, [user]);

  useEffect(() => {
    async function loadAvailability() {
      try {
        await fetchAvailability(selectedDate);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      customerName: user?.name || '',
      contact: '',
      petName: '',
      notes: '',
    });
    setSelectedTime('');
    setEditingReservationId(null);
  }

  function startEditReservation(reservation) {
    const reservationDate = new Date(reservation.reservationDate);
    setEditingReservationId(reservation.id);
    setViewMonth(new Date(reservationDate.getFullYear(), reservationDate.getMonth(), 1));
    setSelectedDate(reservation.reservationDate);
    setSelectedTime(reservation.reservationTime.slice(0, 5));
    setFormData({
      customerName: reservation.customerName,
      contact: reservation.contact || '',
      petName: reservation.petName,
      notes: reservation.notes || '',
    });
  }

  function moveMonth(offset) {
    const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + offset, 1);
    setViewMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toISOString().split('T')[0]);
    setSelectedTime('');
  }

  async function handleDeleteReservation(id) {
    setMessage('');
    setError('');

    try {
      await request(`/reservations/${id}`, {
        method: 'DELETE',
      });
      setMessage('예약이 삭제되었습니다.');
      if (editingReservationId === id) {
        resetForm();
      }
      await Promise.all([fetchReservations(), fetchAvailability(selectedDate)]);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!user) {
      alert('로그인 후 이용해주세요!');
      navigate('/login');
      return;
    }

    if (!selectedTime) {
      setError('예약 시간을 선택해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
      };

      if (editingReservationId) {
        await request(`/reservations/${editingReservationId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('예약이 수정되었습니다.');
      } else {
        await request('/reservations', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('예약이 완료되었습니다.');
      }

      await Promise.all([
        fetchReservations(),
        fetchAvailability(selectedDate),
      ]);

      resetForm();
    } catch (submitError) {
      if (submitError.status === 401) {
        alert('로그인 후 이용해주세요!');
        navigate('/login');
      } else {
        setError(submitError.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="reservation-page">
      <h1 className="serif-title">Book a Session</h1>
      <p className="reservation-subtitle">
        당신의 반려동물과 함께하는 특별한 기록
      </p>

      <div className="reservation-container">
        <div className="calendar-section">
          <h3 className="section-title">
            Select Date
            <span>{formatDateLabel(selectedDate)}</span>
          </h3>

          <div className="month-nav">
            <button type="button" onClick={() => moveMonth(-1)}>
              {'<'}
            </button>
            <h4>{formatMonthLabel(viewMonth)}</h4>
            <button type="button" onClick={() => moveMonth(1)}>
              {'>'}
            </button>
          </div>

          <div className="date-list">
            {visibleDates.map((date) => (
              <button
                key={date}
                type="button"
                className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
              >
                {formatDateLabel(date)}
              </button>
            ))}
          </div>

          <h3 className="section-title second">Current Reservations</h3>
          <div className="reservation-list">
            {loading && <p className="status-text">예약 목록을 불러오는 중입니다.</p>}
            {!loading && reservations.length === 0 && (
              <p className="status-text">아직 등록된 예약이 없습니다.</p>
            )}
            {reservations.map((reservation) => {
              const isOwner = user?.id === reservation.ownerUserId;
              const isAdmin = user?.role === 'ADMIN';

              return (
                <div key={reservation.id} className="reservation-item">
                  <strong>
                    {maskName(reservation.customerName)} / {reservation.petName}
                  </strong>
                  <p>
                    {reservation.reservationDate} {reservation.reservationTime}
                  </p>
                  <p>{maskContact(reservation.contact)}</p>
                  <span>{reservation.notes || '요청 사항 없음'}</span>
                  {(isOwner || isAdmin) && (
                    <div className="reservation-actions">
                      {isOwner && (
                        <button type="button" onClick={() => startEditReservation(reservation)}>
                          수정
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteReservation(reservation.id)}>
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="details-section">
          <h3 className="section-title">
            {editingReservationId ? 'Edit Reservation' : 'Select Time'}
            <span>
              {availability.filter((slot) => slot.available).length} slots
            </span>
          </h3>

          <p className="details-copy">
            {formatDateLabel(selectedDate)} 기준 예약 가능한 시간입니다.
          </p>

          <div className="time-slots">
            {availability.map((slot) => (
              <button
                key={slot.time}
                type="button"
                className={`time-btn ${selectedTime === slot.time.slice(0, 5) ? 'selected' : ''}`}
                disabled={!slot.available && selectedTime !== slot.time.slice(0, 5)}
                onClick={() => setSelectedTime(slot.time.slice(0, 5))}
              >
                {slot.time.slice(0, 5)} {slot.available ? '' : '(Full)'}
              </button>
            ))}
          </div>

          <form className="reservation-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="customerName"
              placeholder="보호자 이름"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contact"
              placeholder="전화번호 or 이메일 주소"
              value={formData.contact}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="petName"
              placeholder="반려동물 이름"
              value={formData.petName}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="notes"
              placeholder="요청 사항"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
            />
            <button className="final-btn" type="submit" disabled={submitting}>
              {submitting
                ? 'PROCESSING...'
                : editingReservationId
                  ? 'UPDATE RESERVATION'
                  : 'CONFIRM RESERVATION'}
            </button>
            {editingReservationId && (
              <button className="secondary-reservation-btn" type="button" onClick={resetForm}>
                CANCEL EDIT
              </button>
            )}
          </form>

          {message && <p className="status-text success">{message}</p>}
          {error && <p className="status-text error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Reservation;
