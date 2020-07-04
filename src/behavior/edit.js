// Import Edit control.
import Edit from '../control/Edit/Edit';

// Import SnappingGrid control.
import SnappingGrid from '../control/SnappingGrid/SnappingGrid';

// Import replaceToEPSG4326().
import replaceToEPSG4326 from '../projection/replaceToEPSG4326';

// Edit control behavior.
export default {
  attach(instance, { layer } = {}) {

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
    const drawingLayer = layer || instance.addLayer('vector', opts);

    // Get the units from instance options.
    const units = (instance.options.units === 'us') ? 'us' : 'metric';

    // Create the SnappingGrid control and add it to the map
    /* eslint-disable-next-line no-param-reassign */
    instance.snappingGrid = new SnappingGrid({ units });
    instance.map.addControl(instance.snappingGrid);

    // Create the Edit control and add it to the map.
    // Make it available at instance.edit.
    /* eslint-disable-next-line no-param-reassign */
    instance.edit = new Edit({
      layer: drawingLayer,
      units,
      snappingGridFeature: instance.snappingGrid.getGridFeature(),
    });

    instance.map.addControl(instance.edit);
  },
};
