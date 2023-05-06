// Import formats.
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

// Import the default projection configuration
import projection from '../../projection';

// Read features from Well Known Text (WKT).
function readFeaturesWKT(wkt) {
  const isMultipart = wkt.includes('MULTIPOINT')
    || wkt.includes('MULTILINESTRING')
    || wkt.includes('MULTIPOLYGON')
    || wkt.includes('GEOMETRYCOLLECTION');
  return isMultipart
    ? new WKT({ splitCollection: true }).readFeatures(wkt, projection)
    : [new WKT().readFeature(wkt, projection)];
}

// Read features from GeoJSON.
function readFeaturesGeoJSON(geojson) {
  return (new GeoJSON()).readFeatures(geojson, projection);
}

// Read features from various formats.
export default function readFeatures(type, input) {
  if (type.toLowerCase() === 'geojson') {
    return readFeaturesGeoJSON(input);
  }
  if (type.toLowerCase() === 'wkt') {
    return readFeaturesWKT(input);
  }
  return undefined;
}
