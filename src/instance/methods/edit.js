// Import Edit control.
import Edit from '../../control/Edit/Edit';

// Import replaceToEPSG4326().
import replaceToEPSG4326 from '../../projection/replaceToEPSG4326';

/**
 * Enable the drawing controls in the map.
 */
export default function enableDraw({ layer } = {}) {

  /**
   * Replace the OpenLayers core toEPSG4326() function.
   * @see https://github.com/farmOS/farmOS-map/issues/49
   */
  replaceToEPSG4326();

  // Create a drawing layer.
  const opts = {
    title: 'Drawing',
    group: 'Editable layers',
    color: 'orange',
  };
  const drawingLayer = layer || this.addLayer('vector', opts);

  // Get the units from instance options.
  const units = (this.options.units === 'us') ? 'us' : 'metric';

  // Create the Edit control and add it to the map.
  // Make it available at instance.edit.
  this.edit = new Edit({ layer: drawingLayer, units });
  this.map.addControl(this.edit);

  // Enable geometry measurements.
  // This needs to happen after the control is added to the map because it needs
  // access to the map object to add overlays.
  this.edit.measure();
}
