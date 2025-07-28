import React, { useState } from 'react';

const ExpendedSidebar = ({
  showTypes,
  onToggleShowTypes,
  checkedTypes = {},
  onTypeToggle,
  types = ['point', 'line', 'polygon'],
  onListTypeClick,
  listedTypeData,
  listedTypeName,
  onEditFeature,
  onDeleteFeature,
  typeData,
  setTypeData
}) => {
  const [showListButtons, setShowListButtons] = useState(false);
  const [openTypes, setOpenTypes] = useState([]); // birden fazla açık olabilir
  const [loadingType, setLoadingType] = useState(null);
  const [errorType, setErrorType] = useState(null);

  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState({});
  const [itemsPerPage] = useState(10); // Sayfa başına 10 öğe

  const handleListTypeClick = async (type) => {
    if (openTypes.includes(type)) {
      setOpenTypes(openTypes.filter(t => t !== type));
      setCurrentPage(prev => ({ ...prev, [type]: 1 })); // Sayfa 1'e dön
      return;
    } else {
      setOpenTypes([...openTypes, type]);
      setCurrentPage(prev => ({ ...prev, [type]: 1 })); // Yeni açıldığında sayfa 1
    }
    setErrorType(null);
    if (!typeData[type]) {
      setLoadingType(type);
      try {
        if (onListTypeClick) {
          const data = await onListTypeClick(type, true);
          setTypeData(prev => ({ ...prev, [type]: data }));
        }
      } catch (err) {
        setErrorType(type);
      } finally {
        setLoadingType(null);
      }
    }
  };

  // Sayfalama fonksiyonları
  const getCurrentPageData = (type) => {
    const data = typeData[type] || [];
    const page = currentPage[type] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (type) => {
    const data = typeData[type] || [];
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (type, newPage) => {
    setCurrentPage(prev => ({ ...prev, [type]: newPage }));
  };

  const renderPagination = (type) => {
    const totalPages = getTotalPages(type);
    const currentPageNum = currentPage[type] || 1;
    
    if (totalPages <= 1) return null;

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 8, 
        marginTop: 12,
        padding: '8px 0',
        borderTop: '1px solid #eee'
      }}>
        <button
          style={{
            background: currentPageNum > 1 ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: currentPageNum > 1 ? 'pointer' : 'not-allowed',
            fontSize: 12
          }}
          onClick={() => handlePageChange(type, currentPageNum - 1)}
          disabled={currentPageNum <= 1}
        >
          ← Önceki
        </button>
        
        <span style={{ fontSize: 12, color: '#666' }}>
          Sayfa {currentPageNum} / {totalPages}
        </span>
        
        <button
          style={{
            background: currentPageNum < totalPages ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: currentPageNum < totalPages ? 'pointer' : 'not-allowed',
            fontSize: 12
          }}
          onClick={() => handlePageChange(type, currentPageNum + 1)}
          disabled={currentPageNum >= totalPages}
        >
          Sonraki →
        </button>
      </div>
    );
  };

  return (
    <div style={{ width: 200, background: '#eee', padding: 16, height: '100vh', position: 'relative', color: '#111' }}>
      <div style={{ height: 40 }} />
      <button 
        style={{
          width: '100%',
          background: '#ddd',
          border: 'none',
          padding: '8px 0',
          fontWeight: 'bold',
          fontSize: 16,
          marginBottom: 8,
          cursor: 'pointer',
          color: '#111'
        }}
        onClick={onToggleShowTypes}
      >
        Getir
      </button>
      {showTypes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, color: '#111' }}>
          {types.map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 15, color: '#111' }}>
              <span
                onClick={() => onTypeToggle(type)}
                style={{
                  width: 18,
                  height: 18,
                  border: '1.5px solid #888',
                  borderRadius: 3,
                  marginRight: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  fontSize: 15,
                  userSelect: 'none',
                  color: '#111'
                }}
              >
                {checkedTypes[type] ? '✓' : ''}
              </span>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      )}
      <button
        style={{
          width: '100%',
          background: '#bbb',
          border: 'none',
          padding: '8px 0',
          fontWeight: 'bold',
          fontSize: 16,
          marginBottom: 8,
          cursor: 'pointer',
          color: '#111'
        }}
        onClick={() => setShowListButtons(v => !v)}
      >
        Listele
      </button>
      {showListButtons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          {types.map(type => (
            <div key={type}>
              <button
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '2px solid #646cff',
                  color: '#111',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 'bold',
                  borderRadius: 5,
                  boxShadow: '0 1px 4px rgba(100,108,255,0.08)',
                  transition: 'background 0.2s, color 0.2s',
                  marginBottom: 2
                }}
                onClick={() => handleListTypeClick(type)}
              >
                {type === 'point' && '🟢 Point'}
                {type === 'line' && '🔵 Line'}
                {type === 'polygon' && '🟣 Polygon'}
              </button>
              {openTypes.includes(type) && (
                <div style={{ marginTop: 8, background: '#fafafa', border: '1px solid #ccc', padding: 8, maxHeight: 300, overflowY: 'auto', fontSize: 13, color: '#111' }}>
                  {loadingType === type && <div>Yükleniyor...</div>}
                  {errorType === type && <div style={{ color: 'red' }}>Veri alınamadı!</div>}
                  {typeData[type] && !loadingType && !errorType && (
                    <>
                      <b>{type.charAt(0).toUpperCase() + type.slice(1)} Listesi:</b>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
                        Toplam: {typeData[type].length} öğe
                      </div>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {getCurrentPageData(type).map((item, idx) => (
                          <li key={item.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 8, paddingBottom: 8 }}>
                            <div><b>İsim:</b> {item.name}</div>
                            {item.wkt && <div><b>WKT:</b> {item.wkt}</div>}
                            {item.pointX && item.pointY && <div><b>Koordinat:</b> {item.pointX}, {item.pointY}</div>}
                            {item.wkt && !item.pointX && !item.pointY && (
                              <div style={{ fontSize: 12, color: '#555' }}><i>Koordinat WKT'den alınabilir</i></div>
                            )}
                            <div style={{ marginTop: 4 }}>
                              <button style={{ marginRight: 8, background: '#ffd700', color: '#222', border: 'none', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }} onClick={() => onEditFeature && onEditFeature(type, item)}>Düzenle</button>
                              <button style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }} onClick={() => onDeleteFeature && onDeleteFeature(type, item)}>Sil</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {renderPagination(type)}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpendedSidebar;
