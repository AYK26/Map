import React, { useState } from 'react';
import './FeaturePopup.css';

const FeaturePopup = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <div className="feature-popup">
      <input
        type="text"
        placeholder="Ad giriniz"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="popup-buttons">
        <button onClick={handleSave}>Kaydet</button>
        <button onClick={onCancel}>İptal</button>
      </div>
    </div>
  );
};

export default FeaturePopup;
