import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { request } from '../api';

function Signup({ setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const user = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
        }),
      });

      setUser(user);
      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (signupError) {
      setError(signupError.message);
    }
  }

  return (
    <div className="login-container">
      <div className="bg-blur-circle"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Create Account</h2>
          <p>니어펫 예약과 갤러리 이용을 위해 계정을 만들어주세요.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>ID</label>
            <input
              type="text"
              name="username"
              placeholder="4자 이상 아이디"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="6자 이상 비밀번호"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="primary-btn">
            Sign Up
          </button>
          {error && <p className="form-feedback error-text">{error}</p>}
        </form>

        <div className="login-footer">
          <span>이미 계정이 있으신가요?</span>
          <button className="text-btn" type="button" onClick={() => navigate('/login')}>
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
