// Import ol-side-panel control.
import 'ol-side-panel/dist/ol-side-panel.css';
import { SidePanel } from 'ol-side-panel';

import './sidePanel.css';

// Side panel behavior
export default {
  attach(instance) {

    // Create the SidePanel control and add it to the map.
    // Make it available at instance.sidePanel.
    /* eslint-disable-next-line no-param-reassign */
    instance.sidePanel = new SidePanel();
    instance.map.addControl(instance.sidePanel);
  },

};
