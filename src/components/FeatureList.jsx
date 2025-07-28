import React, { useState, useEffect } from 'react';
import './FeatureList.css';

const FeatureList = ({
  onClose,
  points,
  lines,
  polygons,
  onFetch,
  onList,
  onEdit,
  onDelete,
  selectedTypes,
  setSelectedTypes,
  listedType,
  setListedType
}) => {
  const handleCheckboxChange = (type) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const renderList = (items, type) => {
    return items.map((item) => (
      <div className="list-item" key={item.id}>
        <h4>{item.name}</h4>
        <p>Kategori: {item.categoryName || 'Yok'}</p>
        <p>Koordinatlar: {item.coordinates}</p>
        <div className="list-buttons">
          <button onClick={() => onEdit(type, item)}>Düzenle</button>
          <button onClick={() => onDelete(type, item.id)}>Sil</button>
        </div>
      </div>
    ));
  };

  return (
    <div className="list-panel">
      <button className="close-button" onClick={onClose}>×</button>

      <div className="fetch-section">
        <button className="fetch-button" onClick={onFetch}>
          Getir <span>▼</span>
        </button>

        <div className="checkboxes">
          {['point', 'line', 'polygon'].map(type => (
            <label key={type}>
              <input
                type="checkbox"
                checked={selectedTypes[type]}
                onChange={() => handleCheckboxChange(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="list-section">
        <button className="list-button">Listele ▼</button>
        <div className="list-types">
          {['point', 'line', 'polygon'].map(type => (
            <button
              key={type}
              onClick={() => setListedType(type)}
              className={listedType === type ? 'active' : ''}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="geometry-list">
        {listedType === 'point' && renderList(points, 'point')}
        {listedType === 'line' && renderList(lines, 'line')}
        {listedType === 'polygon' && renderList(polygons, 'polygon')}
      </div>
    </div>
  );
};

export default FeatureList;
