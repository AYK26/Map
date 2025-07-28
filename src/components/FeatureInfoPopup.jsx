import React from 'react';
import './FeatureInfoPopup.css';

const FeatureInfoPopup = ({ feature, onClose }) => {
  if (!feature) return null;

  return (
    <div className="info-popup">
      <div className="info-popup-content">
        <h3>Özellik Bilgisi</h3>
        <p><strong>İsim:</strong> {feature.get('name') || 'Bilinmiyor'}</p>
        <p><strong>Tür:</strong> {feature.getGeometry().getType()}</p>
        <button onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
};

export default FeatureInfoPopup;
