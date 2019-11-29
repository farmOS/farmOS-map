// Import Edit control.
import Edit from '../../control/Edit/Edit';

/**
 * Enable the drawing controls in the map.
 */
export default function enableDraw() {

  // Create a drawing layer.
  const opts = {
    title: 'Drawing',
    group: 'Editable layers',
    color: 'orange',
  };
  const layer = this.addLayer('vector', opts);

  // Get the units from instance options.
  const units = (this.options.units === 'us') ? 'us' : 'metric';

  // Create the Edit control and add it to the map.
  // Make it available at instance.edit.
  this.edit = new Edit({ layer, units });
  this.map.addControl(this.edit);

  // Enable geometry measurements.
  // This needs to happen after the control is added to the map because it needs
  // access to the map object to add overlays.
  this.edit.measure();
}
