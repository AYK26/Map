import WKT from 'ol/format/WKT';

export function featureToWKT(feature) {
  const wktFormat = new WKT();
  return wktFormat.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
}

export function wktToFeature(wkt, name) {
  const wktFormat = new WKT();
  const feature = new ol.Feature(wktFormat.readGeometry(wkt, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }));
  feature.set('name', name);
  return feature;
} 