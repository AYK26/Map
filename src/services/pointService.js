import { apiFetch } from './api';
import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';

const ENDPOINT = '/api/point';

export async function getPoints() {
  const json = await apiFetch(ENDPOINT);
  const wktFormat = new WKT();
  return (json.data || [])
    .filter(item => (item.wkt && item.wkt.trim() !== '') || (item.pointX && item.pointY))
    .map(item => {
      try {
        let geometry;
        if (item.wkt) {
          geometry = wktFormat.readGeometry(item.wkt, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        } else if (item.pointX && item.pointY) {
          geometry = wktFormat.readGeometry(`POINT(${item.pointX} ${item.pointY})`, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        }
        const feature = new Feature(geometry);
        feature.set('name', item.name);
        feature.set('id', item.id);
        return feature;
      } catch (e) {
        console.warn('Geçersiz Point:', item, e);
        return null;
      }
    })
    .filter(Boolean);
}

export async function addPoint(feature) {
  const wktFormat = new WKT();
  const wkt = wktFormat.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
  const name = feature.get('name');
  const dto = { name, wkt };
  return apiFetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updatePoint(id, feature) {
  const wktFormat = new WKT();
  const wkt = wktFormat.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
  const name = feature.get('name');
  const dto = { name, wkt };
  return apiFetch(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deletePoint(id) {
  return apiFetch(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
} 