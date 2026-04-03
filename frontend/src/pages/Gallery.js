import React, { useEffect, useState } from 'react';
import { request } from '../api';

function Gallery() {
  const [photos, setPhotos] = useState([]);

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

  return (
    <div className="gallery-page nearpet-gallery-page">
      <h1 className="nearpet-gallery-title">NearPet Full Gallery</h1>
      <div className="gallery nearpet-gallery-grid">
        {photos.map((photo) => (
          <div className="item" key={photo.id}>
            <img
              src={photo.imageUrl}
              alt={photo.description || '강아지 사진'}
              className="nearpet-gallery-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
