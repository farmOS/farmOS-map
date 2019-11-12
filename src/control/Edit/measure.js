import Overlay from 'ol/Overlay';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { unByKey } from 'ol/Observable';
import { getArea, getLength } from 'ol/sphere';

// Store measurement overlays keyed by the ID of the feature they measure.
const measures = {};

// Store measurement listeners for changes to shapes.
const measureListeners = [];

// Maintain a counter for feature IDs.
let featureId = 0;

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
function formatLength(line) {
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
function formatArea(polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = `${Math.round(area / 1000000 * 100)} km<sup>2</sup>`;
  } else {
    output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
  }
  return output;
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
 * Start measuring.
 * @param {ol.Map} map The map to add overlay to.
 * @param {ol.Feature} feature The feature being measured.
 */
export function startMeasure(map, feature) {

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
 * If both map and layer parameters are set, any overlays that no longer
 * correspond to a feature in the layer will be removed.
 * @param {ol.Map} map The map to remove overlays from.
 * @param {ol.Layer|bool} layer The layer to remove overlays from.
 */
export function stopMeasure(map = false, layer = false) {

  // Remove any overlays that no longer correspond to drawn features.
  if (layer) {
    Object.keys(measures).forEach((id) => {
      if (!layer.getSource().getFeatureById(id)) {
        map.removeOverlay(measures[id]);
        delete measures[id];
      }
    });
  }

  // Stop listening for measurement changes.
  measureListeners.forEach(listener => unByKey(listener));
}
