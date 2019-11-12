import Overlay from 'ol/Overlay';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { unByKey } from 'ol/Observable';
import { getArea, getLength } from 'ol/sphere';

// Store measurement overlays keyed by the ID of the feature they measure.
const measures = {};

// Store measurement listeners for changes to shapes.
const measureListeners = [];

// Remember the map, drawing layer, and system of measurement.
// See initMeasure().
let map;
let layer;
let units;

// Define conversion units and their coefficients.
const m = 1;
const km = 0.001;
const ft = 3.28084;
const mi = 0.0006213712;
const sqM = 1;
const ha = 0.0001;
const sqFt = 10.76391;
const ac = 0.0002471052;

// Maintain a counter for feature IDs.
let featureId = 0;

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
function formatLength(line) {
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
 * @return {string} Formatted area.
 */
function formatArea(polygon) {
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
 * Update a measurement, given a geometry.
 * @param {ol.Overlay} measure The measure overlay.
 * @param {ol.SimpleGeometry} geom The geomtery to measure (Polygon or
 * LineString).
 */
function updateMeasure(measure, geom) {
  let measurement;
  let coordinates;
  if (geom instanceof Polygon) {
    measurement = formatArea(geom);
    coordinates = geom.getInteriorPoint().getCoordinates();
  }
  if (geom instanceof LineString) {
    measurement = formatLength(geom);
    coordinates = geom.getLastCoordinate();
  }
  measure.setPosition(coordinates);
  const element = measure.getElement();
  element.innerHTML = measurement;
}

/**
 * Initialize measure functionality.
 * @param {ol.Map} map The map that measurements will be added to.
 * @param {ol.Layer} layer The layer that contains drawing features.
 * @param {string} units The system of measurement to use (us or metric).
 */
export function initMeasure(optMap, optLayer, optUnits) {

  // Save the map, drawing layer, and system of measurement for later use.
  map = optMap;
  layer = optLayer;
  units = optUnits;
}

/**
 * Start measuring.
 * @param {ol.Feature} feature The feature being measured.
 */
export function startMeasure(feature) {

  // Get the feature ID. If no ID is set, generate one.
  let id = feature.getId();
  if (!id) {
    id = `measureFeature${featureId}`;
    feature.setId(id);
    featureId += 1;
  }

  // If a measurement overlay does not exist for the feature, create it.
  if (!measures[id]) {
    const element = document.createElement('div');
    element.className = 'ol-tooltip ol-tooltip-measure';
    measures[id] = new Overlay({
      element,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
    });
    map.addOverlay(measures[id]);
  }

  // Listen for changes to the feature, and update its measurement.
  measureListeners[id] = feature.getGeometry().on('change', e => updateMeasure(measures[id], e.target));
}

/**
 * Stop measuring.
 */
export function stopMeasure() {

  // Remove any overlays that no longer correspond to drawn features.
  Object.keys(measures).forEach((id) => {
    if (!layer.getSource().getFeatureById(id)) {
      map.removeOverlay(measures[id]);
      delete measures[id];
    }
  });

  // Stop listening for measurement changes.
  measureListeners.forEach(listener => unByKey(listener));
}
