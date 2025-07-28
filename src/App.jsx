import React, { useState, useRef, useEffect, useCallback } from 'react';
import ExpendedSidebar from './components/ExpendedSidebar';
import FeatureInfoPopup from './components/FeatureInfoPopup';
import MapComponent from './components/MapComponent';
import FeaturePopup from './components/FeaturePopup';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import { getPoints, addPoint, updatePoint, deletePoint } from './services/pointService';
import { getLines, addLine, updateLine, deleteLine } from './services/lineService';
import { getPolygons, addPolygon, updatePolygon, deletePolygon } from './services/polygonService';
import WKT from 'ol/format/WKT';

const App = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [drawingType, setDrawingType] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState(null); // Feature just drawn
  // Feature states for each type
  const [pointFeatures, setPointFeatures] = useState([]);
  const [lineFeatures, setLineFeatures] = useState([]);
  const [polygonFeatures, setPolygonFeatures] = useState([]);

  useEffect(() => {
    getPoints().then(setPointFeatures);
    getLines().then(setLineFeatures);
    getPolygons().then(setPolygonFeatures);
  }, []);

  // ESC tuşu ile draw modunu iptal et
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && drawingType) {
        cancelDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawingType]);

  const [showTypes, setShowTypes] = useState(false);
  const [checkedTypes, setCheckedTypes] = useState({ point: false, line: false, polygon: false });
  const [listedTypeData, setListedTypeData] = useState(null);
  const [listedTypeName, setListedTypeName] = useState(null);
  const mapRef = useRef();
  const [typeData, setTypeData] = useState({}); // ExpendedSidebar'a prop olarak verilecek
  const [popupPosition, setPopupPosition] = useState({ left: 20, top: 40 });
  const [editMode, setEditMode] = useState(false); // Düzenleme popup'ı için
  const [translateMode, setTranslateMode] = useState(false); // Sürükleme modu
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  // Start drawing of a geometry type
  const handleStartDrawing = (type) => {
    setDrawingType(type);
  };

  // Cancel drawing mode
  const cancelDrawing = () => {
    setDrawingType(null);
    setPendingFeature(null);
  };

  // When drawing ends, show naming popup
  const handleDrawEnd = (feature) => {
    setPendingFeature(feature);
    setDrawingType(null); // Stop drawing mode
  };

  // Save feature with name
  const handleSaveFeature = async ({ name }) => {
    if (pendingFeature) {
      pendingFeature.set('name', name);
      const type = pendingFeature.getGeometry().getType().toLowerCase();
      try {
        if (type === 'point') {
          await addPoint(pendingFeature);
          setPointFeatures(prev => [...prev, pendingFeature]);
        } else if (type === 'linestring' || type === 'line') {
          await addLine(pendingFeature);
          setLineFeatures(prev => [...prev, pendingFeature]);
        } else if (type === 'polygon') {
          await addPolygon(pendingFeature);
          setPolygonFeatures(prev => [...prev, pendingFeature]);
        }
        setPendingFeature(null);
        showToast('Başarıyla eklendi');
      } catch (err) {
        console.error('Failed to save feature:', err);
        showToast('Ekleme başarısız');
      }
    }
  };

  // Cancel naming popup and remove feature from map
  const handleCancelFeature = () => {
    if (pendingFeature && mapRef.current) {
      mapRef.current.removeFeature(pendingFeature);
    }
    setPendingFeature(null);
  };

  // Fetch and show features for a type
  const handleTypeToggle = async (type) => {
    type = type.toLowerCase();
    setCheckedTypes(prev => {
      const newChecked = { ...prev, [type]: !prev[type] };
      if (!prev[type]) {
        // Eğer şimdi işaretlendiyse, ilgili verileri getir
        let fetchFn;
        if (type === 'point') fetchFn = getPoints;
        else if (type === 'line') fetchFn = getLines;
        else if (type === 'polygon') fetchFn = getPolygons;
        if (fetchFn) {
          fetchFn()
            .then(fetched => {
              if (type === 'point') setPointFeatures(fetched);
              else if (type === 'line') setLineFeatures(fetched);
              else if (type === 'polygon') setPolygonFeatures(fetched);
            })
            .catch(err => {
              console.error('Failed to fetch features:', err);
              if (type === 'point') setPointFeatures([]);
              else if (type === 'line') setLineFeatures([]);
              else if (type === 'polygon') setPolygonFeatures([]);
            });
        }
      } else {
        // Eğer işaret kaldırıldıysa, ilgili verileri temizle
        if (type === 'point') setPointFeatures([]);
        else if (type === 'line') setLineFeatures([]);
        else if (type === 'polygon') setPolygonFeatures([]);
      }
      return newChecked;
    });
  };

  const handleListTypeClick = async (type, onlyReturnData = false) => {
    let fetchFn;
    if (type === 'point') fetchFn = getPoints;
    else if (type === 'line') fetchFn = getLines;
    else if (type === 'polygon') fetchFn = getPolygons;
    if (fetchFn) {
      try {
        const features = await fetchFn();
        const wktFormat = new WKT();
        const data = features.map(f => ({
          id: f.get('id'),
          name: f.get('name'),
          wkt: wktFormat.writeGeometry(f.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'))
        }));
        console.log('handleListTypeClick', type, data);
        if (onlyReturnData) return data;
        setListedTypeData(data);
        setListedTypeName(type);
      } catch (err) {
        console.error('handleListTypeClick error', type, err);
        if (onlyReturnData) return [{ error: err.message }];
        setListedTypeData([{ error: err.message }]);
        setListedTypeName(type);
      }
    } else {
      console.warn('handleListTypeClick: fetchFn yok', type);
    }
  };

  // Listele kutusunda silme
  const handleDeleteFeature = async (type, item) => {
    try {
      if (type === 'point') {
        await deletePoint(item.id);
      } else if (type === 'line') {
        await deleteLine(item.id);
      } else if (type === 'polygon') {
        await deletePolygon(item.id);
      }
      setTypeData(prev => ({
        ...prev,
        [type]: prev[type] ? prev[type].filter(f => f.id !== item.id) : []
      }));
      showToast('Başarıyla silindi');
    } catch (err) {
      alert('Silme başarısız: ' + err.message);
      showToast('Silme başarısız');
    }
  };

  // Listele kutusunda güncelleme
  const handleEditFeature = async (type, item) => {
    // Feature'ı bul veya oluştur
    let featureToEdit = null;
    if (item.wkt) {
      const WKT = (await import('ol/format/WKT')).default;
      const Feature = (await import('ol/Feature')).default;
      const wktFormat = new WKT();
      featureToEdit = new Feature(wktFormat.readGeometry(item.wkt, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }));
      featureToEdit.set('name', item.name);
      featureToEdit.set('id', item.id);
    } else {
      featureToEdit = item;
    }
    // Feature haritada yoksa eklemeden önce aynı id'li feature'ı sil
    const id = featureToEdit.get('id');
    if (type === 'point') {
      setPointFeatures(prev => {
        const filtered = prev.filter(f => f.get('id') !== id);
        if (!filtered.some(f => f.get('id') === id)) {
          return [...filtered, featureToEdit];
        }
        return filtered;
      });
    } else if (type === 'line') {
      setLineFeatures(prev => {
        const filtered = prev.filter(f => f.get('id') !== id);
        if (!filtered.some(f => f.get('id') === id)) {
          return [...filtered, featureToEdit];
        }
        return filtered;
      });
    } else if (type === 'polygon') {
      setPolygonFeatures(prev => {
        const filtered = prev.filter(f => f.get('id') !== id);
        if (!filtered.some(f => f.get('id') === id)) {
          return [...filtered, featureToEdit];
        }
        return filtered;
      });
    }
    // Feature'a zoom yap
    if (mapRef.current && mapRef.current.zoomToFeature) {
      mapRef.current.zoomToFeature(featureToEdit);
    }
    // Popup'ı edit modda aç
    setSelectedFeature(featureToEdit);
    setEditMode(true);
    showToast('Düzenleme modunda');
  };

  // Combine all features for the map - only show checked types
  const features = [
    ...(checkedTypes.point ? pointFeatures : []),
    ...(checkedTypes.line ? lineFeatures : []),
    ...(checkedTypes.polygon ? polygonFeatures : []),
  ];

  // selectedFeature'ın id'si ile features array'indeki referansı bul
  const selectedFeatureRef = selectedFeature
    ? features.find(f => f.get('id') === selectedFeature.get('id')) || selectedFeature
    : null;

  // Haritada feature seçildiğinde popup'ı uygun konuma yerleştir
  const handleFeatureSelect = useCallback((feature) => {
    // Eğer draw modu aktifse ve bir şey seçildiyse iptal et
    if (drawingType) {
      cancelDrawing();
    }
    setSelectedFeature(feature);
    if (feature && mapRef.current && mapRef.current.getMapInstance) {
      const map = mapRef.current.getMapInstance();
      if (map && feature.getGeometry) {
        const geometry = feature.getGeometry();
        let coord;
        if (geometry.getType() === 'Point') {
          coord = geometry.getCoordinates();
        } else if (geometry.getType() === 'LineString') {
          const coords = geometry.getCoordinates();
          coord = coords[Math.floor(coords.length / 2)];
        } else if (geometry.getType() === 'Polygon') {
          const coords = geometry.getCoordinates()[0];
          coord = coords[Math.floor(coords.length / 2)];
        }
        if (coord) {
          const pixel = map.getPixelFromCoordinate(coord);
          const mapContainer = mapRef.current?.mapRef?.current;
          const mapRect = mapContainer ? mapContainer.getBoundingClientRect() : { left: 0, top: 0 };
          setPopupPosition({
            left: pixel[0] + mapRect.left - 250,
            top: pixel[1] + mapRect.top
          });
        } else {
          setPopupPosition({ left: 20, top: 40 });
        }
      } else {
        setPopupPosition({ left: 20, top: 40 });
      }
    } else {
      setPopupPosition({ left: 20, top: 40 });
    }
  }, [drawingType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {/* Sağdaki ince sidebar */}
      <Sidebar onOpen={() => {
        setSidebarOpen(true);
        cancelDrawing();
      }} onAddFeature={handleStartDrawing} />
      {/* Geri kalan alanı kaplayan harita ve overlayler */}
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Search Bar positioned at top center */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '100%',
          maxWidth: '500px',
          padding: '0 20px'
        }}>
          <SearchBar
            onFeatureSelect={handleFeatureSelect}
            pointFeatures={pointFeatures}
            lineFeatures={lineFeatures}
            polygonFeatures={polygonFeatures}
          />
        </div>
        {/* MapComponent fills the area absolutely */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}>
          <MapComponent
            ref={mapRef}
            onFeatureSelect={handleFeatureSelect}
            geometryType={drawingType}
            onDrawEnd={handleDrawEnd}
            features={features}
            editMode={editMode && !translateMode}
            selectedFeature={selectedFeatureRef}
            onFeatureGeometryChange={(newGeometry) => {
              if (selectedFeatureRef) {
                selectedFeatureRef.setGeometry(newGeometry.clone());
                setSelectedFeature(selectedFeatureRef.clone ? selectedFeatureRef.clone() : { ...selectedFeatureRef });
              }
            }}
            translateMode={translateMode}
          />
          {selectedFeature && (
            <FeatureInfoPopup
              feature={selectedFeatureRef}
              onClose={() => { setSelectedFeature(null); setEditMode(false); setTranslateMode(false); }}
              onDelete={async () => {
                const type = selectedFeature.getGeometry().getType().toLowerCase();
                const id = selectedFeature.get('id');
                try {
                  if (type === 'point') {
                    await deletePoint(id);
                    setPointFeatures(prev => prev.filter(f => f.get('id') !== id));
                  } else if (type === 'line' || type === 'linestring') {
                    await deleteLine(id);
                    setLineFeatures(prev => prev.filter(f => f.get('id') !== id));
                  } else if (type === 'polygon') {
                    await deletePolygon(id);
                    setPolygonFeatures(prev => prev.filter(f => f.get('id') !== id));
                  }
                  setSelectedFeature(null);
                  setEditMode(false);
                  setTranslateMode(false);
                  showToast('Başarıyla silindi');
                } catch (err) {
                  console.error('Failed to delete feature:', err);
                  showToast('Silme başarısız');
                }
              }}
              onUpdate={async (updatedName, updatedCoords) => {
                const type = selectedFeature.getGeometry().getType().toLowerCase();
                const id = selectedFeature.get('id');
                selectedFeature.set('name', updatedName);
                // Koordinatlar zaten FeatureInfoPopup tarafından güncellendi
                try {
                  if (type === 'point') {
                    await updatePoint(id, selectedFeature);
                    setPointFeatures(prev => prev.map(f => f.get('id') === id ? selectedFeature : f));
                  } else if (type === 'line' || type === 'linestring') {
                    await updateLine(id, selectedFeature);
                    setLineFeatures(prev => prev.map(f => f.get('id') === id ? selectedFeature : f));
                  } else if (type === 'polygon') {
                    await updatePolygon(id, selectedFeature);
                    setPolygonFeatures(prev => prev.map(f => f.get('id') === id ? selectedFeature : f));
                  }
                  setSelectedFeature(null);
                  setEditMode(false);
                  setTranslateMode(false);
                  showToast('Başarıyla güncellendi');
                } catch (err) {
                  console.error('Failed to update feature:', err);
                  showToast('Güncelleme başarısız');
                }
              }}
              left={popupPosition.left}
              top={popupPosition.top}
              editMode={editMode}
              translateMode={translateMode}
              onTranslateMode={setTranslateMode}
            />
          )}
          {pendingFeature && (
            <FeaturePopup
              onSave={handleSaveFeature}
              onCancel={handleCancelFeature}
              drawingType={drawingType}
            />
          )}
          {sidebarOpen && (
            <div style={{ position: 'absolute', top: 0, right: 48, zIndex: 2000, height: '100vh' }}>
              <ExpendedSidebar
                showTypes={showTypes}
                onToggleShowTypes={() => setShowTypes(v => !v)}
                checkedTypes={checkedTypes}
                onTypeToggle={handleTypeToggle}
                types={['point', 'line', 'polygon']}
                onListTypeClick={handleListTypeClick}
                listedTypeData={listedTypeData}
                listedTypeName={listedTypeName}
                onEditFeature={handleEditFeature}
                onDeleteFeature={handleDeleteFeature}
                typeData={typeData}
                setTypeData={setTypeData}
              />
              <button
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  left: 8, 
                  zIndex: 2001, 
                  background: '#eee', 
                  color: '#111', 
                  border: 'none', 
                  fontSize: 24, 
                  width: 32, 
                  height: 32, 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  setSidebarOpen(false);
                  cancelDrawing();
                }}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <Toast
          message={toast.message}
          visible={toast.visible}
          onClose={() => setToast(t => ({ ...t, visible: false }))}
        />
      </div>
    </div>
  );
};

export default App;
