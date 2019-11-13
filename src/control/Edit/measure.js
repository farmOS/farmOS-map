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
 * Get the feature ID. If no ID is set, generate one.
 * @param {ol.Feature} feature The feature.
 */
function getFeatureId(feature) {
  let id = feature.getId();
  if (!id) {
    id = `measureFeature${featureId}`;
    feature.setId(id);
    featureId += 1;
  }
  return id;
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
 * Create a measurement overlay for a feature.
 * @param {ol.Feature} feature The feature to create a measurement for.
 */
function createMeasure(feature) {
  const id = getFeatureId(feature);
  const element = document.createElement('div');
  element.className = 'ol-tooltip ol-tooltip-measure';
  measures[id] = new Overlay({
    element,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(measures[id]);
  updateMeasure(measures[id], feature.getGeometry());
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

  // If the drawing layer contains any features, add measurements for each.
  layer.getSource().getFeatures().forEach((feature) => {
    createMeasure(feature);
  });
}

/**
 * Start measuring.
 * @param {ol.Feature} feature The feature being measured.
 */
export function startMeasure(feature) {

  // Get the feature ID.
  const id = getFeatureId(feature);

  // If a measurement overlay does not exist for the feature, create it.
  if (!measures[id]) {
    createMeasure(feature);
  }

  // Listen for changes to the feature, and update its measurement.
  measureListeners[id] = feature.getGeometry().on('change', e => updateMeasure(measures[id], e.target));
}

/**
 * Stop measuring.
 * @param {ol.Feature|bool} feature Optionally provide a feature which will be
 * included in the cleanup comparison code. This is used when the `drawend`
 * event fires, because the new feature is not yet added to the source layer.
 */
export function stopMeasure(feature = false) {

  // Stop listening for measurement changes.
  measureListeners.forEach(listener => unByKey(listener));

  // Remove any overlays that no longer correspond to drawn features.
  Object.keys(measures).forEach((id) => {

    // If a feature with this ID exists in the source, skip it.
    if (layer.getSource().getFeatureById(id)) {
      return;
    }

    // If a feature was passed into this function, and its ID matches, skip it.
    if (feature && feature.getId() === id) {
      return;
    }

    // Remove the overlay.
    map.removeOverlay(measures[id]);
    delete measures[id];
  });
}
