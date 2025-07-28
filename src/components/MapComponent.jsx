import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Draw, Modify } from 'ol/interaction';
import Translate from 'ol/interaction/Translate';
import Collection from 'ol/Collection';
import './MapComponent.css';

const MapComponent = forwardRef(({ geometryType, onDrawEnd, features = [], onFeatureSelect, editMode = false, selectedFeature = null, onFeatureGeometryChange, translateMode = false }, ref) => {
  const mapRef = useRef();
  const mapRefInstance = useRef(null); // Harita nesnesi
  const vectorSourceRef = useRef(new VectorSource()); // Tek bir vector source
  const drawRef = useRef(null); // Çizim interaction referansı
  const modifyRef = useRef(null);
  const translateRef = useRef(null);

  // Expose removeFeature to parent
  useImperativeHandle(ref, () => ({
    removeFeature: (feature) => {
      vectorSourceRef.current.removeFeature(feature);
    },
    getMapInstance: () => mapRefInstance.current,
    zoomToFeature: (feature) => {
      if (!feature || !mapRefInstance.current) return;
      const geometry = feature.getGeometry();
      if (!geometry) return;
      const view = mapRefInstance.current.getView();
      if (geometry.getType() === 'Point') {
        view.animate({ center: geometry.getCoordinates(), zoom: 16, duration: 500 });
      } else {
        // LineString veya Polygon için extent'e zoom
        const extent = geometry.getExtent();
        view.fit(extent, { duration: 500, maxZoom: 16, padding: [40, 40, 40, 40] });
      }
    }
  }), []);

  // Haritayı sadece 1 kere oluştur
  useEffect(() => {
    mapRefInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSourceRef.current }),
      ],
      view: new View({
        center: fromLonLat([35, 39]),
        zoom: 6,
      }),
    });

    // Feature tıklama event'i
    const map = mapRefInstance.current;
    function handleSingleClick(evt) {
      if (!map) return;
      // Eğer çizim (drawing) aktifse, tıklama ile feature seçme ve popup açma devre dışı
      if (geometryType) return;
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        if (onFeatureSelect) onFeatureSelect(feature);
        found = true;
        return true; // sadece ilk feature
      });
      if (!found && onFeatureSelect) onFeatureSelect(null);
    }
    map.on('singleclick', handleSingleClick);

    return () => {
      if (mapRefInstance.current) {
        mapRefInstance.current.setTarget(null);
        mapRefInstance.current.un('singleclick', handleSingleClick);
      }
    };
  }, [onFeatureSelect]);

  // geometryType değişince çizim interaction'ını güncelle
  useEffect(() => {
    if (!mapRefInstance.current) return;

    // Önceki çizimi kaldır
    if (drawRef.current) {
      mapRefInstance.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (geometryType) {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: geometryType,
        maxPoints: geometryType === 'LineString' ? 2 : undefined,
      });

      draw.on('drawend', (evt) => {
        onDrawEnd(evt.feature);
        mapRefInstance.current.removeInteraction(draw);
        drawRef.current = null;
      });

      mapRefInstance.current.addInteraction(draw);
      drawRef.current = draw;
    }
  }, [geometryType, onDrawEnd]);

  // features değişince vector source'u güncelle
  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    vectorSource.clear();

    features.forEach((feature) => {
      vectorSource.addFeature(feature);
    });
  }, [features]);

  // Edit mode'da seçili feature için Modify interaction ekle
  useEffect(() => {
    if (!mapRefInstance.current) return;
    // Önce tüm interaction'ları kaldır
    if (modifyRef.current) {
      mapRefInstance.current.removeInteraction(modifyRef.current);
      modifyRef.current = null;
    }
    if (translateRef.current) {
      mapRefInstance.current.removeInteraction(translateRef.current);
      translateRef.current = null;
    }
    // Sürükleme modu
    if (translateMode && selectedFeature) {
      const translate = new Translate({
        features: new Collection([selectedFeature])
      });
      translate.on('translateend', (evt) => {
        if (onFeatureGeometryChange) {
          onFeatureGeometryChange(selectedFeature.getGeometry());
        }
      });
      mapRefInstance.current.addInteraction(translate);
      translateRef.current = translate;
    } else if (editMode && selectedFeature) {
      const modify = new Modify({
        source: vectorSourceRef.current,
        features: new Collection([selectedFeature])
      });
      modify.on('modifyend', (evt) => {
        if (onFeatureGeometryChange) {
          onFeatureGeometryChange(selectedFeature.getGeometry());
        }
      });
      mapRefInstance.current.addInteraction(modify);
      modifyRef.current = modify;
    }
    // Temizlik
    return () => {
      if (modifyRef.current && mapRefInstance.current) {
        mapRefInstance.current.removeInteraction(modifyRef.current);
        modifyRef.current = null;
      }
      if (translateRef.current && mapRefInstance.current) {
        mapRefInstance.current.removeInteraction(translateRef.current);
        translateRef.current = null;
      }
    };
  }, [editMode, translateMode, selectedFeature, onFeatureGeometryChange]);

  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    />
  );
});

export default MapComponent;
