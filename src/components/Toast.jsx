import React, { useEffect } from 'react';

const Toast = ({ message, visible, duration = 2500, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      left: 24,
      bottom: 24,
      background: 'rgba(40,40,40,0.95)',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      zIndex: 9999,
      fontSize: 16,
      minWidth: 120,
      textAlign: 'center',
      opacity: 0.97,
      pointerEvents: 'none',
      transition: 'opacity 0.2s',
    }}>
      {message}
    </div>
  );
};

export default Toast; 