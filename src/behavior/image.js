import Image from '../control/Image/Image';

export default {
  attach(instance) {

    // Create the Image control and add it to the map.
    const control = new Image();
    instance.map.addControl(control);
  },
};
