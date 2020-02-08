import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { getArea, getLength } from 'ol/sphere';

// Define conversion units and their coefficients.
const m = 1;
const km = 0.001;
const ft = 3.28084;
const mi = 0.0006213712;
const sqM = 1;
const ha = 0.0001;
const sqFt = 10.76391;
const ac = 0.0002471052;

/**
 * Format length output.
 * @param {LineString} line The line.
 * @param {string} units The system of measurement (metric or us).
 * @return {string} The formatted length.
 */
export function formatLength(line, units = 'metric') {
  const length = getLength(line);
  switch (units) {
    case 'metric':
      if (length * km > 0.25) {
        return `${(length * km).toFixed(2)} km`;
      }
      return `${(length * m).toFixed(0)} m`;
    case 'us':
      if (length * mi > 0.25) {
        return `${(length * mi).toFixed(2)} mi`;
      }
      return `${(length * ft).toFixed(0)} ft`;
    default:
      return '';
  }
}

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @param {string} units The system of measurement (metric or us).
 * @return {string} Formatted area.
 */
export function formatArea(polygon, units = 'metric') {
  const area = getArea(polygon);
  switch (units) {
    case 'metric':
      if (area * ha > 0.25) {
        return `${(area * ha).toFixed(2)} ha`;
      }
      return `${(area * sqM).toFixed(0)} m<sup>2</sup>`;
    case 'us':
      if (area * ac > 0.25) {
        return `${(area * ac).toFixed(2)} ac`;
      }
      return `${(area * sqFt).toFixed(0)} ft<sup>2</sup>`;
    default:
      return '';
  }
}

/**
 * Measure a geometry.
 * @param {ol.SimpleGeometry} geom The geomtery to measure (Polygon or
 * LineString).
 * @param {string} units The system of measurement (metric or us).
 * @return {string} Formatted area.
 */
export function measureGeometry(geom, units = 'metric') {
  let measurement;
  if (geom instanceof Polygon) {
    measurement = formatArea(geom, units);
  }
  else if (geom instanceof LineString) {
    measurement = formatLength(geom, units);
  }
  else {
    measurement = '';
  }
  return measurement;
}
