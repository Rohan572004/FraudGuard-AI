import React, { useState, useEffect } from 'react';
import { login, register } from './api';
import { ShieldCheck, UserPlus, LogIn, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  
  // Track password requirements
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  // Run validation whenever password changes
  useEffect(() => {
    const p = formData.password;
    setValidations({
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*]/.test(p)
    });
  }, [formData.password]);

  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !allValid) {
      alert("Please meet all password requirements!");
      return;
    }
    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);
        const { data } = await login(params);
        localStorage.setItem('token', data.access_token);
        onAuthSuccess();
      } else {
        await register(formData);
        alert("Account created! Login to continue.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Auth failed!");
    }
  };

  const ValidationItem = ({ isMet, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isMet ? '#166534' : '#94a3b8', margin: '2px 0' }}>
      {isMet ? <CheckCircle2 size={14} color="#22c55e" /> : <Circle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <ShieldCheck size={40} color="#2563eb" style={{ margin: '0 auto' }} />
          <h2 style={{ margin: '10px 0 0 0' }}>{isLogin ? 'Welcome Back' : 'Secure Sign Up'}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={inputWrapper}>
            <User size={18} style={iconStyle} />
            <input placeholder="Username" style={inputStyle} onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>

          {!isLogin && (
            <div style={inputWrapper}>
              <Mail size={18} style={iconStyle} />
              <input placeholder="Email" type="email" style={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
          )}

          <div style={inputWrapper}>
            <Lock size={18} style={iconStyle} />
            <input 
              placeholder="Password" 
              type={showPassword ? "text" : "password"} 
              style={inputStyle} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
            {/* Visibility Toggle Button */}
            <div onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* Real-time Validation UI (Only shows during Registration) */}
          {!isLogin && formData.password.length > 0 && (
            <div style={validationBox}>
              <ValidationItem isMet={validations.length} text="8+ Characters" />
              <ValidationItem isMet={validations.upper} text="1 Uppercase Letter" />
              <ValidationItem isMet={validations.lower} text="1 Lowercase Letter" />
              <ValidationItem isMet={validations.number} text="1 Number" />
              <ValidationItem isMet={validations.special} text="1 Special Character (!@#$)" />
            </div>
          )}

          <button type="submit" disabled={!isLogin && !allValid} style={{...buttonStyle, opacity: (!isLogin && !allValid) ? 0.6 : 1}}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p onClick={() => { setIsLogin(!isLogin); setFormData({username:'', email:'', password:''}); }} style={toggleLink}>
          {isLogin ? "New here? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

// Styling (Keep your existing styles but add these)
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' };
const cardStyle = { background: '#fff', padding: '35px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '380px', border: '1px solid #e2e8f0' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle = { position: 'absolute', left: '12px', color: '#94a3b8' };
const eyeIconStyle = { position: 'absolute', right: '12px', color: '#94a3b8', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const validationBox = { background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '-5px' };
const buttonStyle = { padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const toggleLink = { textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#64748b', fontSize: '13px' };

export default Auth;