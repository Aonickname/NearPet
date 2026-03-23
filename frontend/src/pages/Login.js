import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { request } from '../api';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      setUser(user);
      alert(`${user.name}님, 환영합니다.`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-blur-circle"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>반려동물과의 소중한 기록, 니어펫입니다.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>ID</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn">
            Login
          </button>
          {error && <p className="form-feedback error-text">{error}</p>}
        </form>

        <div className="login-footer">
          <span>계정이 없으신가요?</span>
          <button className="text-btn" type="button" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>

        <p className="login-hint">기본 관리자 계정: `admin` / `admin1234`</p>
      </div>
    </div>
  );
}

export default Login;
