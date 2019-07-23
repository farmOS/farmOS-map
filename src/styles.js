import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';

// Define the available colors and their associated RGBA values.
const colors = {
  blue: 'rgba(51,153,255,1)',
  green: 'rgba(51,153,51,1)',
  darkgreen: 'rgba(51,153,51,1)',
  grey: 'rgba(204,204,204,0.7)',
  orange: 'rgba(255,153,51,1)',
  red: 'rgba(204,0,0,1)',
  purple: 'rgba(204,51,102,1)',
  yellow: 'rgba(255,255,51,1)',
};

// Returns an OpenLayers Style for a given color.
const styles = (color) => {
  const rgba = colors[color] ? colors[color] : colors.yellow;
  const fill = new Fill({
    color: 'rgba(0,0,0,0)',
  });
  const stroke = new Stroke({
    color: rgba,
    width: 2,
  });
  return new Style({
    image: new Circle({
      fill,
      stroke,
      radius: 4,
    }),
    fill,
    stroke,
  });
};
export default styles;
