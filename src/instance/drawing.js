import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import Edit from '../control/Edit';
import styles from '../styles';

// Add drawing features.
export default function addDrawingControls(map) {

  // Create the drawing layer.
  const layer = new VectorLayer({
    title: 'Drawing',
    group: 'Editable layers',
    source: new VectorSource(),
    style: styles.orange,
  });
  map.addLayer(layer);

  // Add the Edit control.
  const edit = new Edit({ layer });
  map.addControl(edit);

  // Return the control.
  return edit;
}
