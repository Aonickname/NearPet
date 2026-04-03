import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import { request } from '../api';

function Admin() {
  const [reservations, setReservations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [reservationForm, setReservationForm] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    imageUrl: '',
    description: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    notificationEmail: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [draggedFeaturedId, setDraggedFeaturedId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function showSuccess(messageText) {
    setMessage('');
    alert(messageText);
  }

  async function loadDashboard() {
    try {
      const [reservationData, photoData, settingsData] = await Promise.all([
        request('/reservations'),
        request('/photos'),
        request('/admin/settings'),
      ]);

      setReservations(reservationData);
      setPhotos(photoData);
      setSettingsForm({
        notificationEmail: settingsData?.notificationEmail || '',
      });
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const featuredPhotos = photos
    .filter((photo) => photo.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));

  function handleReservationFormChange(event) {
    const { name, value } = event.target;
    setReservationForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePhotoFormChange(event) {
    const { name, value } = event.target;
    setPhotoForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSettingsChange(event) {
    const { name, value } = event.target;
    setSettingsForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileSelect(file) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setPhotoForm((current) => ({
      ...current,
      imageUrl: '',
    }));
  }

  async function updateFeaturedPhotos(photoIds) {
    const updatedPhotos = await request('/photos/featured', {
      method: 'PUT',
      body: JSON.stringify({ photoIds }),
    });
    setPhotos(updatedPhotos);
  }

  async function toggleFeatured(photoId) {
    setMessage('');
    setError('');

    const isFeatured = featuredPhotos.some((photo) => photo.id === photoId);
    const nextFeaturedIds = isFeatured
      ? featuredPhotos.filter((photo) => photo.id !== photoId).map((photo) => photo.id)
      : [...featuredPhotos.map((photo) => photo.id), photoId];

    if (!isFeatured && featuredPhotos.length >= 6) {
      setError('대표 이미지는 최대 6장입니다.');
      return;
    }

    try {
      await updateFeaturedPhotos(nextFeaturedIds);
      showSuccess(isFeatured ? '대표 이미지가 해제되었습니다.' : '대표 이미지로 고정되었습니다.');
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function reorderFeatured(targetId) {
    if (!draggedFeaturedId || draggedFeaturedId === targetId) {
      return;
    }

    const orderedIds = featuredPhotos.map((photo) => photo.id);
    const draggedIndex = orderedIds.indexOf(draggedFeaturedId);
    const targetIndex = orderedIds.indexOf(targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }

    orderedIds.splice(targetIndex, 0, orderedIds.splice(draggedIndex, 1)[0]);

    try {
      await updateFeaturedPhotos(orderedIds);
      showSuccess('대표 이미지 순서가 변경되었습니다.');
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setDraggedFeaturedId(null);
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const updatedSettings = await request('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm),
      });
      setSettingsForm({
        notificationEmail: updatedSettings.notificationEmail || '',
      });
      showSuccess('알림 이메일이 저장되었습니다.');
    } catch (settingsError) {
      setError(settingsError.message);
    }
  }

  function startReservationEdit(reservation) {
    setReservationForm({
      id: reservation.id,
      customerName: reservation.customerName,
      petName: reservation.petName,
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime.slice(0, 5),
      notes: reservation.notes || '',
    });
    setMessage('');
    setError('');
  }

  async function handleReservationUpdate(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await request(`/reservations/${reservationForm.id}`, {
        method: 'PUT',
        body: JSON.stringify(reservationForm),
      });

      setReservationForm(null);
      showSuccess('예약 정보가 수정되었습니다.');
      await loadDashboard();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function handleReservationDelete(id) {
    setMessage('');
    setError('');

    try {
      await request(`/reservations/${id}`, {
        method: 'DELETE',
      });
      showSuccess('예약이 삭제되었습니다.');
      if (reservationForm?.id === id) {
        setReservationForm(null);
      }
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handlePhotoSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('description', photoForm.description);

        await request('/photos/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        await request('/photos', {
          method: 'POST',
          body: JSON.stringify(photoForm),
        });
      }

      setPhotoForm({ imageUrl: '', description: '' });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccess('사진이 추가되었습니다.');
      await loadDashboard();
    } catch (photoError) {
      setError(photoError.message);
    }
  }

  async function handlePhotoDelete(id) {
    setMessage('');
    setError('');

    try {
      await request(`/photos/${id}`, {
        method: 'DELETE',
      });
      showSuccess('사진이 삭제되었습니다.');
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>예약 관리와 갤러리 사진 관리를 한 곳에서 진행할 수 있습니다.</p>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div className="admin-layout">
        <section className="admin-panel">
          <h2>예약 관리</h2>
          <div className="admin-list">
            {reservations.map((reservation) => (
              <div className="admin-card" key={reservation.id}>
                <strong>
                  {reservation.customerName} / {reservation.petName}
                </strong>
                <p>
                  {reservation.reservationDate} {reservation.reservationTime}
                </p>
                <p>{reservation.contact || '연락처 없음'}</p>
                <p>{reservation.notes || '요청 사항 없음'}</p>
                <div className="admin-actions">
                  <button type="button" onClick={() => startReservationEdit(reservation)}>
                    수정
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleReservationDelete(reservation.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {reservationForm && (
            <form className="admin-form" onSubmit={handleReservationUpdate}>
              <h3>예약 수정</h3>
              <input
                name="customerName"
                value={reservationForm.customerName}
                onChange={handleReservationFormChange}
                placeholder="보호자 이름"
                required
              />
              <input
                name="contact"
                value={reservationForm.contact || ''}
                onChange={handleReservationFormChange}
                placeholder="전화번호 or 이메일 주소"
                required
              />
              <input
                name="petName"
                value={reservationForm.petName}
                onChange={handleReservationFormChange}
                placeholder="반려동물 이름"
                required
              />
              <input
                type="date"
                name="reservationDate"
                value={reservationForm.reservationDate}
                onChange={handleReservationFormChange}
                required
              />
              <input
                type="time"
                name="reservationTime"
                value={reservationForm.reservationTime}
                onChange={handleReservationFormChange}
                required
              />
              <textarea
                name="notes"
                value={reservationForm.notes}
                onChange={handleReservationFormChange}
                rows="3"
                placeholder="요청 사항"
              />
              <div className="admin-actions">
                <button type="submit">저장</button>
                <button type="button" onClick={() => setReservationForm(null)}>
                  취소
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="admin-panel">
          <h2>관리자 알림 설정</h2>
          <form className="admin-form" onSubmit={handleSettingsSubmit}>
            <input
              type="email"
              name="notificationEmail"
              value={settingsForm.notificationEmail}
              onChange={handleSettingsChange}
              placeholder="예약 알림을 받을 이메일"
            />
            <button type="submit">이메일 저장</button>
          </form>

          <h2 className="panel-spaced-title">갤러리 사진 관리</h2>
          <form className="admin-form" onSubmit={handlePhotoSubmit}>
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFileSelect(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden-file-input"
                onChange={(event) => handleFileSelect(event.target.files?.[0])}
              />
              <strong>사진 파일 드래그 또는 클릭</strong>
              <p>jpg, png, webp 파일 업로드 가능</p>
              {selectedFile && <span>{selectedFile.name}</span>}
            </div>

            <div className="divider"><span>또는</span></div>
            <input
              name="imageUrl"
              value={photoForm.imageUrl}
              onChange={handlePhotoFormChange}
              placeholder="사진 URL"
              disabled={Boolean(selectedFile)}
            />
            <input
              name="description"
              value={photoForm.description}
              onChange={handlePhotoFormChange}
              placeholder="사진 설명"
            />
            <button type="submit">사진 추가</button>
          </form>

          <div className="featured-guide">
            <strong>대표 이미지</strong>
            <p>핀으로 최대 6장까지 고정하고, 고정된 이미지는 드래그로 순서를 바꿀 수 있습니다.</p>
          </div>

          <div className="admin-photo-grid">
            {photos.map((photo) => (
              <div
                className={`admin-photo-card ${photo.featured ? 'featured' : ''}`}
                key={photo.id}
                draggable={photo.featured}
                onDragStart={() => setDraggedFeaturedId(photo.id)}
                onDragOver={(event) => photo.featured && event.preventDefault()}
                onDrop={() => photo.featured && reorderFeatured(photo.id)}
              >
                <button
                  type="button"
                  className={`pin-btn ${photo.featured ? 'active' : ''}`}
                  onClick={() => toggleFeatured(photo.id)}
                  title="대표 이미지 고정"
                >
                  {photo.featured ? '📌' : '📍'}
                </button>
                <img src={photo.imageUrl} alt={photo.description || '반려동물 사진'} />
                <p>{photo.description || '설명 없음'}</p>
                {photo.featured && (
                  <span className="featured-badge">Home #{(photo.featuredOrder ?? 0) + 1}</span>
                )}
                <button
                  type="button"
                  className="danger"
                  onClick={() => handlePhotoDelete(photo.id)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
