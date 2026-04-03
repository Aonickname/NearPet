import React, { useEffect, useState } from 'react';
import { request } from '../api';

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const data = await request('/photos');
        setPhotos(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPhotos();
  }, []);

  function openPhotoPost(photo) {
    setSelectedPhoto(photo);
    setSelectedImageIndex(0);
  }

  function closePhotoPost() {
    setSelectedPhoto(null);
    setSelectedImageIndex(0);
  }

  function showPrevImage() {
    if (!selectedPhoto) {
      return;
    }

    setSelectedImageIndex((current) =>
      current === 0 ? selectedPhoto.imageUrls.length - 1 : current - 1
    );
  }

  function showNextImage() {
    if (!selectedPhoto) {
      return;
    }

    setSelectedImageIndex((current) =>
      current === selectedPhoto.imageUrls.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="gallery-page nearpet-gallery-page">
      <h1 className="nearpet-gallery-title">NearPet Full Gallery</h1>
      <div className="gallery nearpet-gallery-grid">
        {photos.map((photo) => (
          <button
            type="button"
            className="item nearpet-gallery-post"
            key={photo.id}
            onClick={() => openPhotoPost(photo)}
          >
            <img
              src={photo.imageUrl}
              alt={photo.description || '강아지 사진'}
              className="nearpet-gallery-image"
            />
            {photo.hasMultipleImages && <span className="multi-image-indicator">◫</span>}
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div className="gallery-modal-backdrop" onClick={closePhotoPost} role="presentation">
          <div
            className="gallery-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closePhotoPost}
              aria-label="게시글 닫기"
            >
              ×
            </button>

            <div className="gallery-modal-image-wrap">
              <img
                src={selectedPhoto.imageUrls[selectedImageIndex]}
                alt={selectedPhoto.description || '반려동물 게시글'}
                className="gallery-modal-image"
              />

              {selectedPhoto.imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-modal-nav prev"
                    onClick={showPrevImage}
                    aria-label="이전 사진"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-modal-nav next"
                    onClick={showNextImage}
                    aria-label="다음 사진"
                  >
                    ›
                  </button>
                  <div className="gallery-modal-dots">
                    {selectedPhoto.imageUrls.map((imageUrl, index) => (
                      <button
                        type="button"
                        key={`${selectedPhoto.id}-${imageUrl}`}
                        className={`gallery-modal-dot ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`${index + 1}번째 사진 보기`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="gallery-modal-caption">
              <strong>NearPet</strong>
              <p>{selectedPhoto.description || '설명이 없습니다.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
