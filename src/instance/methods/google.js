// Import Google Maps.
import 'olgm/olgm.css';
import OLGoogleMaps from 'olgm/OLGoogleMaps';
import GoogleLayer from 'olgm/layer/Google';
import { defaults as defaultGoogleInteractions } from 'olgm/interaction';

// Add CSS override to fix font family/size issue described here:
// https://github.com/farmOS/farmOS-map/issues/8#issuecomment-568076505
import './google.css';

// Enable Google Maps.
// Note that this assumes the Google Maps API JavaScript was loaded onto the
// page with a valid API key. See README.md.
export default function enableGoogleMaps() {

  // Define the Google layers that we will add.
  const googleLayers = [
    {
      title: 'Google Hybrid',
      mapTypeId: 'hybrid',
    },
    {
      title: 'Google Satellite',
      mapTypeId: 'satellite',
    },
    {
      title: 'Google Terrain',
      mapTypeId: 'terrain',
    },
    {
      title: 'Google Roadmap',
      mapTypeId: 'roadmap',
    },
  ];

  // Find the "Base layers" layer group.
  const group = this.getLayerByName('Base layers');

  // Build all the layers and add them to the group.
  for (let i = 0; i < googleLayers.length; i += 1) {
    const layer = new GoogleLayer({
      title: googleLayers[i].title,
      type: 'base',
      visible: false,
      mapTypeId: googleLayers[i].mapTypeId,
    });
    group.getLayers().insertAt(0, layer);
  }

  // Add interactions.
  const interactions = this.map.getInteractions();
  interactions.extend(defaultGoogleInteractions());

  // Constrain the resolution of the map view because Google Maps API does not
  // support fractional zoom levels.
  // See: https://issuetracker.google.com/issues/35828923
  this.map.getView().setConstrainResolution(true);

  // Activate Google Maps.
  const olGM = new OLGoogleMaps({ map: this.map });
  const gmap = olGM.getGoogleMapsMap();
  olGM.activate();

  // Disable 45° Imagery.
  gmap.setTilt(0);
}
