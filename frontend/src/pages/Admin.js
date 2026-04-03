import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import { request } from '../api';

function Admin() {
  const [reservations, setReservations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [reservationForm, setReservationForm] = useState(null);
  const [photoEditForm, setPhotoEditForm] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    imageUrl: '',
    description: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    notificationEmail: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedFeaturedId, setDraggedFeaturedId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const pointerTargetRef = useRef(null);

  function showSuccess(messageText) {
    setMessage('');
    alert(messageText);
  }

  function showError(messageText) {
    setError('');
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
      showError(loadError.message);
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

  function handlePhotoEditFormChange(event) {
    const { name, value } = event.target;
    setPhotoEditForm((current) => ({
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

  function handleFileSelect(fileList) {
    const nextFiles = Array.from(fileList || []).filter(Boolean);
    if (!nextFiles.length) {
      return;
    }

    setSelectedFiles(nextFiles);
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
      alert('대표 이미지는 최대 6장입니다.');
      return;
    }

    try {
      await updateFeaturedPhotos(nextFeaturedIds);
      showSuccess(isFeatured ? '대표 이미지가 해제되었습니다.' : '대표 이미지로 고정되었습니다.');
    } catch (updateError) {
      showError(updateError.message);
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
      showError(updateError.message);
    } finally {
      setDraggedFeaturedId(null);
    }
  }

  function beginFeaturedHandleDrag(photoId, event) {
    if (!featuredPhotos.some((photo) => photo.id === photoId)) {
      return;
    }

    setDraggedFeaturedId(photoId);
    pointerTargetRef.current = photoId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function trackFeaturedHandleDrag(event) {
    if (!draggedFeaturedId) {
      return;
    }

    const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
    const targetCard = hoveredElement?.closest?.('[data-featured-id]');
    const nextTarget = targetCard ? Number(targetCard.getAttribute('data-featured-id')) : null;
    pointerTargetRef.current = Number.isNaN(nextTarget) ? null : nextTarget;
  }

  async function endFeaturedHandleDrag(event) {
    if (!draggedFeaturedId) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const targetId = pointerTargetRef.current;
    pointerTargetRef.current = null;

    if (!targetId || targetId === draggedFeaturedId) {
      setDraggedFeaturedId(null);
      return;
    }

    await reorderFeatured(targetId);
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
      showError(settingsError.message);
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
      showError(updateError.message);
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
      showError(deleteError.message);
    }
  }

  async function handlePhotoSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
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
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccess('사진이 추가되었습니다.');
      await loadDashboard();
    } catch (photoError) {
      showError(photoError.message);
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
      showError(deleteError.message);
    }
  }

  function startPhotoEdit(photo) {
    const imageUrls = photo.imageUrls || [photo.imageUrl];
    setPhotoEditForm({
      id: photo.id,
      description: photo.description || '',
      coverImageUrl: photo.imageUrl,
      images: imageUrls.map((imageUrl, index) => ({
        key: imageUrl,
        url: imageUrl,
        isNew: false,
      })),
    });
    setError('');
  }

  function closePhotoEdit() {
    if (photoEditForm?.images) {
      photoEditForm.images
        .filter((image) => image.isNew && image.previewUrl)
        .forEach((image) => URL.revokeObjectURL(image.previewUrl));
    }
    setPhotoEditForm(null);
  }

  function handlePhotoEditImageAdd(fileList) {
    const nextFiles = Array.from(fileList || []).filter(Boolean);
    if (!nextFiles.length) {
      return;
    }

    setPhotoEditForm((current) => {
      if (!current) {
        return current;
      }

      const nextImages = nextFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          key: `new-${crypto.randomUUID()}`,
          url: previewUrl,
          previewUrl,
          file,
          isNew: true,
        };
      });

      return {
        ...current,
        images: [...current.images, ...nextImages],
      };
    });
  }

  function removePhotoEditImage(targetKey) {
    setPhotoEditForm((current) => {
      if (!current) {
        return current;
      }

      const targetImage = current.images.find((image) => image.key === targetKey);
      if (targetImage?.isNew && targetImage.previewUrl) {
        URL.revokeObjectURL(targetImage.previewUrl);
      }

      const nextImages = current.images.filter((image) => image.key !== targetKey);
      const nextCoverImageUrl = current.coverImageUrl === targetImage?.url
        ? (nextImages[0]?.url || '')
        : current.coverImageUrl;

      return {
        ...current,
        images: nextImages,
        coverImageUrl: nextCoverImageUrl,
      };
    });
  }

  function movePhotoEditImage(targetKey, direction) {
    setPhotoEditForm((current) => {
      if (!current) {
        return current;
      }

      const nextImages = [...current.images];
      const currentIndex = nextImages.findIndex((image) => image.key === targetKey);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= nextImages.length) {
        return current;
      }

      [nextImages[currentIndex], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[currentIndex]];
      return {
        ...current,
        images: nextImages,
      };
    });
  }

  async function handlePhotoUpdate(event) {
    event.preventDefault();
    if (!photoEditForm) {
      return;
    }

    setError('');

    try {
      const formData = new FormData();
      const newImages = photoEditForm.images.filter((image) => image.isNew);

      formData.append('description', photoEditForm.description);
      const coverImage = photoEditForm.images.find((image) => image.url === photoEditForm.coverImageUrl);
      formData.append('coverImageKey', coverImage?.key || '');
      formData.append('imageOrder', JSON.stringify(photoEditForm.images.map((image) => image.key)));
      newImages.forEach((image) => {
        formData.append('newImageKeys', image.key);
        formData.append('files', image.file);
      });

      await request(`/photos/${photoEditForm.id}`, {
        method: 'PUT',
        body: formData,
      });
      closePhotoEdit();
      showSuccess('사진 게시글이 수정되었습니다.');
      await loadDashboard();
    } catch (updateError) {
      showError(updateError.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>예약 관리와 갤러리 사진 관리를 한 곳에서 진행할 수 있습니다.</p>
      </div>

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
                handleFileSelect(event.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden-file-input"
                onChange={(event) => handleFileSelect(event.target.files)}
              />
              <strong>사진 파일 여러 장 드래그 또는 클릭</strong>
              <p>jpg, png, webp 파일 업로드 가능</p>
              {selectedFiles.length > 0 && (
                <span>{selectedFiles.length}개 파일 선택됨</span>
              )}
            </div>

            <div className="divider"><span>또는</span></div>
            <input
              name="imageUrl"
              value={photoForm.imageUrl}
              onChange={handlePhotoFormChange}
              placeholder="사진 URL"
              disabled={selectedFiles.length > 0}
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
                className={`admin-photo-card ${photo.featured ? 'featured' : ''} ${draggedFeaturedId === photo.id ? 'sorting' : ''}`}
                key={photo.id}
                data-featured-id={photo.featured ? photo.id : undefined}
              >
                {photo.featured && (
                  <button
                    type="button"
                    className="drag-handle"
                    title="대표 이미지 순서 변경"
                    aria-label="대표 이미지 순서 변경"
                    onPointerDown={(event) => beginFeaturedHandleDrag(photo.id, event)}
                    onPointerMove={trackFeaturedHandleDrag}
                    onPointerUp={endFeaturedHandleDrag}
                    onPointerCancel={() => {
                      pointerTargetRef.current = null;
                      setDraggedFeaturedId(null);
                    }}
                  >
                    =
                  </button>
                )}
                <button
                  type="button"
                  className={`pin-btn ${photo.featured ? 'active' : ''}`}
                  onClick={() => toggleFeatured(photo.id)}
                  title="대표 이미지 고정"
                >
                  {photo.featured ? '📌' : '📍'}
                </button>
                <img src={photo.imageUrl} alt={photo.description || '반려동물 사진'} />
                {photo.hasMultipleImages && <span className="multi-image-badge">◫</span>}
                <p>{photo.description || '설명 없음'}</p>
                {photo.featured && (
                  <span className="featured-badge">Home #{(photo.featuredOrder ?? 0) + 1}</span>
                )}
                <div className="admin-actions">
                  <button type="button" onClick={() => startPhotoEdit(photo)}>
                    수정
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handlePhotoDelete(photo.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>

      {photoEditForm && (
        <div className="admin-modal-backdrop" onClick={closePhotoEdit} role="presentation">
          <form
            className="admin-modal admin-form"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handlePhotoUpdate}
          >
            <div className="admin-modal-header">
              <h3>사진 게시글 수정</h3>
              <button type="button" className="admin-modal-close" onClick={closePhotoEdit}>
                ×
              </button>
            </div>

            <textarea
              name="description"
              value={photoEditForm.description}
              onChange={handlePhotoEditFormChange}
              rows="3"
              placeholder="사진 설명"
            />

            <div className="cover-picker">
              <strong>게시글 이미지 편집</strong>
              <div className="cover-picker-grid">
                {photoEditForm.images.map((image, index) => (
                  <div
                    key={image.key}
                    className={`cover-picker-item ${photoEditForm.coverImageUrl === image.url ? 'selected' : ''}`}
                  >
                    <div className="cover-picker-image-frame">
                      <img src={image.url} alt="게시글 이미지 편집 후보" />
                    </div>
                    <div className="cover-picker-toolbar">
                      <input
                        type="radio"
                        name="coverImageUrl"
                        value={image.url}
                        checked={photoEditForm.coverImageUrl === image.url}
                        onChange={handlePhotoEditFormChange}
                        className="cover-picker-radio-input"
                      />
                      <div className="cover-picker-toolbar-top">
                        {photoEditForm.coverImageUrl === image.url && (
                          <span className="cover-picker-selected-badge">대표</span>
                        )}
                        <button
                          type="button"
                          className="cover-picker-cover-button"
                          onClick={() => setPhotoEditForm((current) => ({
                            ...current,
                            coverImageUrl: image.url,
                          }))}
                          disabled={photoEditForm.coverImageUrl === image.url}
                        >
                          {photoEditForm.coverImageUrl === image.url ? '대표 이미지' : '대표로 설정'}
                        </button>
                      </div>
                      <div className="cover-picker-order-actions">
                        <button type="button" onClick={() => movePhotoEditImage(image.key, 'up')} disabled={index === 0}>
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePhotoEditImage(image.key, 'down')}
                          disabled={index === photoEditForm.images.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => removePhotoEditImage(image.key)}
                          disabled={photoEditForm.images.length === 1}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="drop-zone compact"
              onClick={() => editFileInputRef.current?.click()}
            >
              <input
                ref={editFileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden-file-input"
                onChange={(event) => {
                  handlePhotoEditImageAdd(event.target.files);
                  event.target.value = '';
                }}
              />
              <strong>새 이미지 추가</strong>
              <p>여러 장을 추가한 뒤 대표 이미지와 순서를 다시 정할 수 있습니다.</p>
            </div>

            <div className="admin-actions">
              <button type="submit">저장</button>
              <button type="button" onClick={closePhotoEdit}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Admin;
