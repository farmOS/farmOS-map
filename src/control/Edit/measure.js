import { getArea, getLength } from 'ol/sphere';

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
export function formatLength(line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = `${Math.round(length / 1000 * 100) / 100} km`;
  } else {
    output = `${Math.round(length * 100) / 100} m`;
  }
  return output;
}

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
export function formatArea(polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = `${Math.round(area / 1000000 * 100)} km<sup>2</sup>`;
  } else {
    output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
  }
  return output;
}
