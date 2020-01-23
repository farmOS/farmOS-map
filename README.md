# farmOS Map

[![Licence](https://img.shields.io/badge/Licence-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0/)
[![Release](https://img.shields.io/github/release/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/releases)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/commits)
[![Twitter](https://img.shields.io/twitter/follow/farmOSorg.svg?label=%40farmOSorg&style=flat)](https://twitter.com/farmOSorg)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Map is an [OpenLayers](https://openlayers.org/) map for farmOS.

For more information on farmOS, visit [farmOS.org](https://farmOS.org).

## Usage

1. Create an HTML element with an ID, eg: `<div id="farm-map"></div>`
2. Call the map creation method with the element ID: `farmOS.map.create('farm-map');`
3. (optional) Add behaviors - see below.

### Creating a Map

The simplest way to create a map is to call the `create` method with an HTML
element's ID. This will render a map with all the OpenLayers and farmOS defaults.

You can also call it with an options object, as its second parameter, with
properties to configure map defaults.

Available properties include:

- `units` - The system of measurement to use. Should be either `metric` or `us`.
  Defaults to `metric`.
- `controls` - See below.
- `interactions` - See below.

The `controls` and `interactions` properties provide options for customizing
which OpenLayers controls and interactions are enabled by default in the map. If
a property is set to `false`, none of its corresponding default controls or
interactions will be applied to the map. If the property is assigned to an array
of OpenLayers controls or interactions, the defaults will be discarded and those
controls or interactions will be used in their place. If the property is an
object, it is assumed that it is `options` that will be passed into the
`defaultControls()` or `defaultInteractions()` functions that return OpenLayers
defaults. If the property is assigned to a callback function, that function will
be called and passed the default controls or interactions. It must return a an
array of OL controls/interactions, which will be attached to the map in the
place of the defaults.

For example:

```js
// Calling .create() with just an id renders a map with the farmOS defaults.
const id = 'myMap';
farmOS.map.create(id);

// Passing an options object with units set to "us".
const opts = { units: 'us' };
farmOS.map.create(id, opts);

// An options object with interactions set to false will cancel the interaction
// defaults.
const opts1 = { interactions: false };
farmOS.map.create(id, opts1);

// An options object with an array of controls to replace the defaults.
const opts2 = {
  controls: [
    new MyControl(),
  ],
};
farmOS.map.create(id, opts2);

// An options object with a options for default interactions.
// See: https://openlayers.org/en/latest/apidoc/module-ol_interaction.html
const opts3 = {
  interactions: {
    // Require focus for mouseScrollZoom and dragPan interactions.
    // tabindex needs to be set on the map element for this to work.
    onFocusOnly: true,
  },
};
farmOS.map.create(id, opts3);

// An options object with a function which alters the control defaults.
const opts4 = {
  controls: (defaults) => defaults.filter(def => (
    def.constructor.name === 'Attribution'
    )).concat([
      new MyControl1(),
      new MyControl2(),
    ]),
};
farmOS.map.create(id, opts4);
```

### Tearing down a map

It may be desirable to tear down a map instance when you no longer need it so
that it can be garbage collected. To do so, you need to provide the instance's
target id, and pass it to the `destroy` method:

```js
farmOS.map.destroy('my-map');
```

### Adding layers

To add vector or tile layers to the map, you can call the `addLayer` method. It
takes a layer type as its first parameter, and a configuration object as its
second parameter. The configuration parameter's properties may vary depending on
the type of layer being added.

The order of layers in the map and layer switcher is determined by the order in
which they are added to the map. Layers will be added to the top of the stack
(appearing higher in the layer switcher), unless they are in the `Base layers`
group, in which case they will be added to the bottom of the base layers list.

```js
// Adding a Well Known Text layer
const wkt = "POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))";
const wktOpts = {
  title: 'my-polygon', // defaults to 'wkt'
  wkt, // REQUIRED!
  color: 'orange', // defaults to 'orange'
  visible: true, // defaults to true
};
const wktLayer = myMap.addLayer('wkt', wktOpts);

// Adding a GeoJSON layer
const geoJsonOpts = {
  title: 'geojson', // defaults to 'geojson'
  url: '/farm/areas/geojson/all', // REQUIRED!
  color: 'grey', // defaults to 'orange'
  visible: true, // defaults to true
}
const geoJSONLayer = myMap.addLayer('geojson', geoJsonOpts);

// Adding a WMS layer.
const wmsOpts = {
  title: 'soil-survey', // defaults to 'wms'
  url: 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms', // REQUIRED!
  params: {
    LAYERS: 'MapunitPoly',
    VERSION: '1.1.1',
  },
  visible: true, // defaults to true
  base: false // defaults to false
};
const wmsLayer = myMap.addLayer('wms', wmsOpts);

// Adding an XYZ layer.
const xyzOpts = {
  title: 'mapbox', // defaults to 'xyz'
  url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=[APIKEY]', // REQUIRED!
  visible: true, // defaults to true
  base: false // defaults to false
};
const xyzLayer = myMap.addLayer('xyz', xyzOpts);

// Adding a vector layer.
const vectorOpts = {
  title: 'Drawing',
  color: 'orange',
};
const vectorLayer = myMap.addLayer('vector', vectorOpts);

// Add a cluster layer.
// This expects a GeoJSON URL containing centroid points for clustering.
const clusterOpts = {
  title: 'Animal Cluster', // defaults to 'cluster'
  url: '/farm/assets/geojson/cluster/animal', // REQUIRED!
  visible: true, // defaults to true
};
const clusterLayer = myMap.addLayer('cluster', clusterOpts);
```

The method returns a reference to the newly created layer for later use.

#### Layer groups

Layers can optionally be placed inside layer groups. Simply provide a `group`
option with the title of the group you would like to add the layer to. If the
group does not exist, it will be created automatically.

```js
// Add a GeoJSON layer inside a layer group called "Assets"
const opts = {
  title: 'Animals',
  url: '/farm/assets/geojson/animal/full',
  color: 'red',
  group: 'Assets',
};
const layer = myMap.addLayer('geojson', opts);
```

### Controlling the zoom level

There are two methods for controlling the zoom level. The first, `zoomToVectors`,
automatically zooms to the bounding box of all vector source layers. It takes no
arguments. The second, `zoomToLayer` will zoom to a particular vector layer,
provided you pass a reference to that layer.

For example:

```js
// Zoom to all vector layers
myMap.zoomToVectors();

// Create a layer then zoom to that layer.
const opts = {
  title: 'Animals',
  url: '/farm/assets/geojson/animal/full',
  color: 'red',
};
const layer = myMap.addLayer('geojson', opts);
myMap.zoomToLayer(layer);
```

### Popups

You can add a popup to a map instance by providing a callback function that
returns the popup content and passing it to `instance.addPopup()`. For example:

```js
var popup = instance.addPopup(function (event) {
  return '<div><h2>Coordinates</h2><p>' + event.coordinate + '</p></div>';
});
```

A `farmOS-map.popup` observable event is dispatched when the popup is displayed.
You can use this to perform additional actions. For example:

```js
popup.on('farmOS-map.popup', function (event) {
  console.log('Event: farmOS-map.popup');
});
```

### Drawing controls

Call the `enableDraw()` method on the instance returned by `farmOS.map.create()`
to enable drawing controls. This will add buttons for drawing polygons, lines,
and points. Features can be selected, modified, moved, and deleted.

This will add the Edit control to the map instance as `instance.edit`.

```js
const myMap = farmOS.map.create("map");
myMap.enableDraw();
```

A new drawing layer will be automatically created and added to the map, unless you provide a vector layer as an option:

```js
const drawingLayer = myMap.addLayer('wkt', wktString);
myMap.enableDraw({ layer: drawingLayer });
```

#### Exporting WKT / GeoJSON

There are some methods on the Edit control for exporting
geometries in Well Known Text (WKT) and GeoJSON format:

- `getWKT` / `getGeoJSON` - returns a string containing all the features on the
  drawing layer.
- `wktOn` / `geoJSONOn` - add event listeners for particular editing
  interactions. See example below:

```js
const myMap = farmOS.map.create("map", { drawing: true });
myMap.edit.wktOn("featurechange", (wkt) => console.log(wkt));
```

The first parameter needs to be one of the supported event types, which
correspond closely to the event types provide on OpenLayers' different editing
interactions (see the chart below). The second parameter is a callback, which
will be called whenever the event fires. The callback gets a string of WKT /
GeoJSON passed in as its argument.

| Event Type         | Timing            | Includes        | OL Interaction  |
| :------------------| :---------------- | :-------------- | :-------------- |
| `featurechange`&ast; | after any feature change occurs | all features in the drawing layer | n/a |
| `delete`&ast; | after a feature is deleted | all remaining features in the drawing layer | n/a |
| `drawstart` | before drawing begins | all features in the drawing layer |[Draw](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw.html) |
| `drawend` | after drawing stops | all features in the drawing layer| [Draw](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw.html) |
| `modifystart` | before modifying begins | all features in the drawing layer | [Modify](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify.html)    |
| `modifyend` | after modifications stop | all features in the drawing layer | [Modify](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify.html) |
| `select` | whenever the selected feature changes | only the selected feature | [Select](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Select.html) |
| `translatestart` | before translation begins | all features in the drawing layer |[Translate](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Translate.html) |
| `translating` | every mouse move while translating | all features in the drawing layer |[Translate](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Translate.html) |
| `translateend` | after translation stops | all features in the drawing layer |[Translate](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Translate.html) |

&ast; Note that `featurechange` and `delete` are custom event types provided by
farmOS-map (not by OpenLayers).

The `featurechange` event is a shortcut that automatically assigns the callback
to all events that fire when features are changed in the drawing layer,
including `drawend`, `modifyend`, `translating`, `translateend`, and `delete`.
This is useful if all you want to do is get WKT / GeoJSON whenever features
change.

The `delete` event fires when the "Delete selected features" button is clicked.

### Adding behaviors

Behaviors allow you to make modifications to a map in a modular way, by defining
JavaScript functions that will run automatically when a map during map creation,
or any time afterwards.

One way you can add your own behaviors is by creating a JavaScript file (eg:
`myMapCustomizations.js`), and including it after `farmOS-map.js` in your page.

Your JavaScript file should extend the global `farmOS.map.behaviors` variable
with a uniquely named object containing an `attach()` method.

For example:

```js
(function () {
  farmOS.map.behaviors.myMapCustomizations = {
    attach: function (instance) {

      // Get the element ID.
      var element_id = instance.target;

      // Add a GeoJSON layer to the map with an ID of 'my-map';
      if (element_id == 'my-map') {
        var opts = {
          title: 'My Layer',
          url: 'my/custom/geo.json',
          color: 'yellow',
        };
        instance.addLayer('geojson', opts);
      }
    }
  };
}());
```

One of the benefits of allowing behaviors to be added to a map when it is
created is that it allows other applications to modify maps in a modular way.
In farmOS/Drupal, for example, maps can be built in a contextually-aware way,
enabling/disabling features (eg: drawing controls) depending on where the map is
being used in the UI. This can be accomplished simply by adding behavior
JavaScript files to pages via hooks in farmOS/Drupal modules.

It can also be used for quick testing of the farmOS-map library. Simply create
a behavior JavaScript file in the `static` directory, include it after
`farmOS-map.js` in `static/index.html`, and run `npm run dev` to see your
behavior in the development server.

Behaviors can also be applied to a map after it has been loaded. To do this,
simply run `instance.attachBehavior(myBehavior)` with a behavior object that has
an `attach(instance)` method. For example (given a map `instance`):

```js
const myBehavior = {
  attach(instance) {
    // Run my behavior logic on the instance.
  },
};

instance.attachBehavior(myBehavior);
```

## Development

`npm install` - Install JavaScript dependencies in `./node_modules` and create
`package-lock.json`.

`npm run dev` - Start a Webpack development server at https://localhost:8080
which will live-update as code is changed during development.

`npm run build` - Generate the final `farmOS-map.js` file for distribution,
along with an `index.html` file that loads it, inside the `build` directory.

## Maintainers

 * Michael Stenta (m.stenta) - https://github.com/mstenta

This project has been sponsored by:

 * [Farmier](https://farmier.com)
 * [Globetrotter Foundation](http://globetrotterfoundation.org)
