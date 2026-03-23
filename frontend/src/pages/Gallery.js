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
    <div
      className="gallery-page"
      style={{ padding: '100px 8%', backgroundColor: '#0a0a0a' }}
    >
      <h1
        style={{ color: 'white', textAlign: 'center', marginBottom: '50px' }}
      >
        NearPet Full Gallery
      </h1>
      <div
        className="gallery"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px',
        }}
      >
        {photos.map((photo) => (
          <div className="item" key={photo.id}>
            <img
              src={photo.imageUrl}
              alt={photo.description || '강아지 사진'}
              style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
