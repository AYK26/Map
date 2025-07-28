import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onOpen, onAddFeature }) => (
  <div className="sidebar-slim">
    <button className="sidebar-hamburger" onClick={onOpen} aria-label="Open sidebar">
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </button>
    <div className="sidebar-actions">
      <button className="sidebar-action-btn" title="Nokta Ekle" onClick={() => onAddFeature('Point')}>•</button>
      <button className="sidebar-action-btn" title="Çizgi Ekle" onClick={() => onAddFeature('LineString')}>─</button>
      <button className="sidebar-action-btn" title="Poligon Ekle" onClick={() => onAddFeature('Polygon')}>▱</button>
    </div>
  </div>
);

export default Sidebar;
