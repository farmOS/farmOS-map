import Snapshot from '../control/Snapshot/Snapshot';

export default {
  attach(instance) {

    // Create the Snapshot control and add it to the map.
    const control = new Snapshot();
    instance.map.addControl(control);
  },
};
