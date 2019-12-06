import { get as getProjection } from 'ol/proj';
import { toEPSG4326 } from 'ol/proj/epsg3857';
import { add as addTransform, remove as removeTransform } from 'ol/proj/transforms';

/**
 * Transformation from EPSG:3857 to EPSG:4326.
 *
 * This is a replacement for the OpenLayers toEPSG4326() function.
 * Ours will delegate to the original, but also fix longitudes that have gone
 * out of bounds from crossing the international date line.
 *
 * @see https://github.com/openlayers/openlayers/issues/3899
 *
 * @param {Array<number>} input Input array of coordinate values.
 * @param {Array<number>=} optOutput Output array of coordinate values.
 * @param {number=} optDimension Dimension (default is `2`).
 * @return {Array<number>} Output array of coordinate values.
 */
export function fixToEPSG4326(input, optOutput, optDimension) {
  const output = toEPSG4326(input, optOutput, optDimension);
  const { length } = output;
  const dimension = optDimension > 1 ? optDimension : 2;
  for (let i = 0; i < length; i += dimension) {
    output[i] %= 360;
    if (output[i] < -180) {
      output[i] += 360;
    }
    if (output[i] > 180) {
      output[i] -= 360;
    }
  }
  return output;
}

/**
 * Replace the function for transforming from EPSG:3857 to EPSG:4326 with ours.
 */
export default function replaceToEPSG4326() {
  const epsg3857 = getProjection('EPSG:3857');
  const epsg4326 = getProjection('EPSG:4326');
  removeTransform(epsg3857, epsg4326);
  addTransform(epsg3857, epsg4326, fixToEPSG4326);
}
