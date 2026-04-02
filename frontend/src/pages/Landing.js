import React from 'react';
import '../styles/global.css';

const LANDING_ASSETS = {
  heroImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80',
};

const LANDING_LINKS = {
  instagram: 'https://instagram.com/near_pet_foto',
  naverReservation: 'https://example.com/naver-reservation',
  kakaoReservation: 'https://open.kakao.com/o/sTvPW8li',
  nearpetReservation: '/home',
  naverBlog: 'https://example.com/naver-blog',
};

const reservationButtons = [
  {
    key: 'naverReservation',
    label: '네이버 예약하기',
    href: LANDING_LINKS.naverReservation,
    external: true,
    icon: <span className="brand-badge naver">N</span>,
  },
  {
    key: 'kakaoReservation',
    label: '카카오톡 문의하기',
    href: LANDING_LINKS.kakaoReservation,
    external: true,
    icon: <span className="brand-badge kakao">T</span>,
  },
  {
    key: 'nearpetReservation',
    label: '니어펫 사이트',
    href: LANDING_LINKS.nearpetReservation,
    external: false,
    icon: <span className="brand-badge nearpet">NP</span>,
  },
  {
    key: 'naverBlog',
    label: '네이버 블로그',
    href: LANDING_LINKS.naverBlog,
    external: true,
    icon: <span className="brand-badge blog">b</span>,
  },
];

function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-topbar">
          <span>NearPet Companion Studio</span>
          <span>Premium Pet Portraits</span>
        </div>

        <div className="landing-image-wrap">
          <img
            src={LANDING_ASSETS.heroImage}
            alt="NearPet main visual"
            className="landing-image"
          />
        </div>

        <div className="landing-card">
          <div className="landing-logo-badge">np</div>
          <h1>니어펫 포토</h1>
          <p>반려동물과 함께하는 가장 다정한 순간을 담아드립니다.</p>

          <div className="landing-socials">
            <a
              href={LANDING_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="landing-social-link"
              aria-label="인스타그램"
              title="인스타그램"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm10.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>

          <div className="landing-actions">
            {reservationButtons.map((button) =>
              button.external ? (
                <a
                  key={button.key}
                  href={button.href}
                  target="_blank"
                  rel="noreferrer"
                  className={button.key === 'nearpetReservation' ? 'landing-primary' : 'landing-secondary'}
                >
                  <span className="landing-button-icon">{button.icon}</span>
                  <span className="landing-button-label">{button.label}</span>
                </a>
              ) : (
                <a
                  key={button.key}
                  href={button.href}
                  className="landing-primary"
                >
                  <span className="landing-button-icon">{button.icon}</span>
                  <span className="landing-button-label">{button.label}</span>
                </a>
              )
            )}
          </div>

          <div className="landing-footer-copy">
            <p>@near_pet_foto | Contact: help@nearpet.co.kr</p>
            <p>© 2026 NearPet. All rights reserved.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
