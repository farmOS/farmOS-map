import { transformExtent } from 'ol/proj';

// Export OpenLayers transform functions
export { transform, transformExtent } from 'ol/proj';

/**
 * Returns the map's current view extent in the specified projection coordinates.
 * @param {import('ol/proj').ProjectionLike} source Source projection-like.
 *     Defaults to 'EPSG:3857'.
 * @param {import('ol/proj').ProjectionLike} destination Destination projection-like.
 *     Defaults to 'EPSG:4326'.
 * @return {import('ol/extent').Extent} The transformed extent.
 */
export function getCurrentViewExtentCoordinates(source = 'EPSG:3857', destination = 'EPSG:4326') {
  const extent = this.map.getView().calculateExtent(this.map.getSize());
  return transformExtent(extent, source, destination);
}
