import React, { useEffect, useState } from 'react';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

function Home() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const data = await request('/photos');
        const featuredPhotos = data
          .filter((photo) => photo.featured)
          .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
        setPhotos(featuredPhotos.slice(0, 6));
      } catch (error) {
        console.error(error);
      }
    }

    loadPhotos();
  }, []);

  return (
    <div className="home-container">
      <header className="hero">
        <h1>NearPet</h1>
        <p className="subtitle">반려동물과 당신의 소중한 시간을 담습니다.</p>
      </header>

      <section className="gallery">
        {photos.map((photo) => (
          <div
            className="item nearpet-post-card"
            key={photo.id}
            onClick={() => navigate('/gallery')}
          >
            <img src={photo.imageUrl} alt={photo.description || '강아지 스냅'} />
          </div>
        ))}
      </section>

      <footer>
        <p>@near_pet_foto | Contact: help@nearpet.co.kr</p>
        <p>© 2026 NearPet. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
