# farmOS Map

[![Licence](https://img.shields.io/badge/Licence-MIT-blue.svg)](https://opensource.org/licenses/MIT/)
[![Release](https://img.shields.io/github/release/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/releases)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/commits)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Map is an [OpenLayers](https://openlayers.org/) map for farmOS.

For more information on farmOS, visit [farmOS.org](https://farmOS.org).

## Installation

### Via HTML `<script>` Tag

1. Host the `.js` and `.css` files from the `dist/` directory of this package somehow.
2. Include `farmOS-map.js` and `farmOS-map.css` in the page. e.g.:
  ```html
<link rel="stylesheet" href="./farmOS-map.css" type="text/css">
<script src="./farmOS-map.js"></script>
```
3. Create an HTML element with an ID, eg: `<div id="farm-map"></div>`
4. Call the map creation method with the element ID: `farmOS.map.create('farm-map');`
5. (optional) Add behaviors - see below.

### Via Package Managers

farmOS-map can be installed via `npm-cli`, `yarn` or other package managers from the npm registry:

```sh
npm install @farmos.org/farmos-map@2
```

For additional configuration, see [Working with farmOS-map in an NPM/Webpack Project](#working-with-farmos-map-in-an-npmwebpack-project).

## Usage

### Creating a Map

The simplest way to create a map is to call the `create` method with an HTML
element's ID. This will render a map with all the OpenLayers and farmOS defaults.

You can also call it with an options object, as its second parameter, with
properties to configure map defaults.

Available properties include:

- `units` - The system of measurement to use. Should be either `metric` or `us`.
  Defaults to `metric`.
- `layerSwitcher` - An object with options for the `LayerSwitcher` control.
  See the `ol-layerswitcher` [documentation](https://github.com/walkermatt/ol-layerswitcher#layerswitcher).
- `controls` - See below.
- `interactions` - See below.

The `controls` and `interactions` properties provide options for customizing
which OpenLayers controls and interactions are enabled by default in the map.
These properties can be set in four different ways:
1. If a property is set to `false`, none of its corresponding default controls or
interactions will be applied to the map.
2. If the property is assigned to an array
of OpenLayers controls or interactions, the defaults will be discarded and those
controls or interactions will be used in their place.
3. If the property is an object, it is assumed that it is `options` that will be
passed into the `defaultControls()` or `defaultInteractions()` functions that
return OpenLayers defaults. Refence OpenLayers documentation for default options:
    - [Default controls](https://openlayers.org/en/latest/apidoc/module-ol_control_defaults.html)
    - [Default interactions](https://openlayers.org/en/latest/apidoc/module-ol_interaction_defaults.html)
4. If the property is assigned to a callback function, that function will
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
(appearing higher in the layer switcher).

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

// Adding a GeoJSON layer from URL.
const geoJsonUrlOpts = {
  title: 'geojson', // defaults to 'geojson'
  url: '/farm/areas/geojson/all', // REQUIRED! (either this or `geojson` object)
  color: 'grey', // defaults to 'orange'
  visible: true, // defaults to true
}
const geoJSONURLLayer = myMap.addLayer('geojson', geoJsonUrlOpts);

// Adding a GeoJSON layer from object.
const geoJsonObjectOpts = {
  title: 'geojson', // defaults to 'geojson'
  geojson: {
    type: 'Polygon',
    coordinates: [
      [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
    ]
  }, // REQUIRED! (either this or `url`)
  color: 'grey', // defaults to 'orange'
  visible: true, // defaults to true
}
const geoJSONStringLayer = myMap.addLayer('geojson', geoJsonObjectOpts);

// Adding a WMS layer.
const wmsOpts = {
  title: 'soil-survey', // defaults to 'wms'
  url: 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms', // REQUIRED!
  params: {
    LAYERS: 'MapunitPoly',
    VERSION: '1.1.1',
  },
  visible: true, // defaults to true
  base: false, // defaults to false
  crossOrigin: null, // defaults to null
};
const wmsLayer = myMap.addLayer('wms', wmsOpts);

// Adding a Google Map Tiles layer. This requires registering a Google Developer
// account and creating your own Map Tiles API key. See the following
// documentation on creating and restricting API keys.
// "Google strongly recommends that you restrict your API keys by limiting their
// usage to those only APIs needed for your application. Restricting API keys
// adds security to your application by protecting it from unwarranted requests."
// https://developers.google.com/maps/documentation/tile/get-api-key
const googleMapOpts = {
  title: 'Google Satellite',
  key: 'AIzaSyBEB1xUvz8LG_XexTVKv5ghXEPaCzF9eng', // replace with your API key.
  mapType: 'satellite',
  visible: true, // defaults to true
  base: true, // defaults to false
}
const googleMapLayer = myMap.addLayer('google', googleMapOpts);

// Adding a ArcGIS MapServer tile layer.
const arcGISTileOpts = {
  title: 'StateCityHighway_USA', // defaults to 'arcgis-tile'
  url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer', // REQUIRED!
  visible: true, // defaults to true
  base: false, // defaults to false
  crossOrigin: null, // defaults to null
};
const arcGISTileLayer = myMap.addLayer('arcgis-tile', arcGISTileOpts);

// Adding an XYZ layer.
const xyzOpts = {
  title: 'mapbox', // defaults to 'xyz'
  url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=[APIKEY]', // REQUIRED!
  visible: true, // defaults to true
  base: false, // defaults to false
  crossOrigin: null, // defaults to null
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

All raster layer types have an optional `crossOrigin` option that sets the
`crossorigin` attribute for loaded images. You must provide a `crossOrigin`
value if you want to allow access to pixel data with the canvas renderer.
This is required for the `snapshot` behavior to save images from the canvas.
See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
for more detail.

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

Layer groups that are created automatically will be created with default
settings. If you need more control over layer groups, they can be added to
the map by using the `addLayer` method with the `group` layer type. Layer
groups can be nested in other layer groups by providing the `group` option.
To ensure other layers are included in your layer group make sure to add it
to the map before other layers that should be included.

The `ol-layerswitcher` [examples](https://github.com/walkermatt/ol-layerswitcher#examples)
that demonstrate all of the available layer group options.

```js
// Adding a Layer Group
const groupOpts = {
  title: 'Child group', // required
  fold: false, // defaults to false
  combine: false, // defaults to false
  group: 'Parent', // include in the "Parent" layer group
}
const layerGroup = myMap.addLayer('group', groupOpts);

// Adding a vector layer to the 'Child group'
const vectorOpts = {
  title: 'Drawing',
  color: 'orange',
  group: 'Child group'
};
const vectorLayer = myMap.addLayer('vector', vectorOpts);
```

#### Layer styles

By default all vector layers are styled with the stroke of a given `color`.
Available colors:

```js
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
```

Custom colors can be used by providing a `color` option with the desired color value. A color string parser is included
to handle hex, rgb and other formats.
See [color-parse](https://github.com/colorjs/color-parse/tree/master#parsed-strings) for information about supported formats.

```js
// Add a GeoJSON layer with a custom color inside a layer group called "Assets"
const opts = {
  title: 'Animals',
  url: '/farm/assets/geojson/animal/full',
  color: '#FF0000',
  group: 'Assets',
};
const layer = myMap.addLayer('geojson', opts);
```

For more complex styles, the `styleFunction` option allows styles to be
defined based on a `feature` and `resolution`
([StyleFunction docs.](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleFunction)) 
In addition to the `feature` and `resolution`, farmOS-map calls `styleFunction`
with an additional `style` parameter. This parameter makes all of the 
`ol.style` classes available to other JavaScript modules without requiring
them to bundle `ol.style` themselves.

This makes it possible to style farmOS areas based on properties included in 
their GeoJSON. Cluster layers use a pre-defined style function, but it can be 
overridden using the same `styleFunction` parameter.

An [example `styleFunction`](https://gist.github.com/paul121/d8a7e7441df39b15a02042175c9805fe)
that uses both the resolution and a feature's `id` property.

**NOTE:** For performance it is important to implement a style cache when 
using a custom `styleFunction` ([example](http://openlayersbook.github.io/ch06-styling-vector-layers/example-06.html))

#### Attribution

Layer attribution can be added by passing an `attribution` option to the
`addLayer()` method.

```js
// Adding an XYZ layer with attribution.
const xyzOpts = {
  title: 'Custom XYZ layer',
  url: 'https://my.xyzlayers.com/custom/{z}/{x}/{y}.png',
  attribution: '<a href="https://my.xyzlayers.com">© My.XYZLayers.com</a>',
  base: true,
};
const xyzLayer = myMap.addLayer('xyz', xyzOpts);
```

### Reading Features

A `readFeatures` method is provided to enable reading geometry features from
various formats like GeoJSON and WKT. It takes a format as its first parameter,
and the input data as its second parameter.

For example:

```js
// Reading features from GeoJSON.
const geojson = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
    ]
  },
  properties: {
    name: "Property Boundary"
  }
};
const features = myMap.readFeatures('geojson', geojson);
features[0].get('name') === 'Property Boundary'

// Reading features from Well-Known Text (WKT).
const wkt = "POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))";
const features = myMap.readFeatures('wkt', wkt);
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

Call the `addBehavior('edit')` method on the instance returned by
`farmOS.map.create()` to enable drawing controls. This will add buttons for
drawing polygons, lines, and points. Features can be selected, modified, moved,
and deleted.

This will add the Edit control to the map instance as `instance.edit`.

```js
const myMap = farmOS.map.create("map");
myMap.addBehavior('edit');
```

A new drawing layer will be automatically created and added to the map, unless
you provide a vector layer as an option:

```js
const drawingLayer = myMap.addLayer('vector');
myMap.addBehavior('edit', { layer: drawingLayer });
```

### Measurements

Call the `addBehavior('measure', { layer })` method on the instance returned by
`farmOS.map.create()` to enable length/area measurements of features in a given
layer. This will add tooltips to all features in the layer.

The map instance's configured system of measurement will be used. Lines will be
measured in kilometers (meters for <0.25 km lengths) or miles (square feet for
<0.25 mi lengths). Polygons will be measured in hectares (square meters for
<0.25 ha areas) or acres (square feet for <0.25 ac areas).

If the `edit` behavior is attached, then measurements will be created with new
shapes as they are drawn, modified, and moved.

```js
const myMap = farmOS.map.create("map");
const drawingLayer = myMap.addLayer('vector');
myMap.addBehavior('edit', { layer: drawingLayer });
myMap.addBehavior('measure', { layer: drawingLayer });
```

### Side Panel Control

Call `addBehavior('sidePanel')` on the instance returned by
`farmOS.map.create()` to enable a tabbed side panel.

This will add the SidePanel control to the map instance as `instance.sidePanel`.
Other behaviors can then define panes and add widgets to those panes using the
[ol-side-panel API](https://symbioquine.github.io/ol-side-panel/latest/docs/index.html).

```js
myMap.addBehavior("sidePanel").then(() => {
  const settingsPane = myMap.sidePanel.definePane({
    paneId: 'settings',
    name: 'Settings',
    icon: '⚙',
    weight: 101,
  });

  const scaleLineSettingDiv = el('div', {}, scaleLineSettingDiv => {
    el('input', {type: "checkbox", id: "showScaleLine", name: "showScaleLine", checked: true}, scaleLineCheckbox => {

      scaleLineCheckbox.addEventListener('change', () => {
        document.querySelectorAll(".ol-scale-line").forEach(elem => {
          if (scaleLineCheckbox.checked) {
            elem.style.display = '';
          } else {
            elem.style.display = 'none';
          }
        })
      });

      scaleLineSettingDiv.appendChild(scaleLineCheckbox);
    });
    el('label', {'for': 'showScaleLine'}, scaleLineCheckboxLabel => {
      scaleLineCheckboxLabel.innerHTML = 'Show Scale Line';
      scaleLineSettingDiv.appendChild(scaleLineCheckboxLabel);
    });
  });

  settingsPane.addWidgetElement(scaleLineSettingDiv);

});

// Helper to make defining elements easier
const el = (tagName, attrs, fn) => {
  const e = document.createElement(tagName);
  Object.entries(attrs || {}).forEach(([key, value]) => e.setAttribute(key, value));
  if (fn) fn(e);
  return e;
};
```

![image](https://user-images.githubusercontent.com/30754460/123672842-a3800400-d7f4-11eb-9697-5e19929b6d2d.png)

### Layer Switcher in the Side Panel

Call `addBehavior('layerSwitcherInSidePanel')` on the instance returned by
`farmOS.map.create()` to move the layer switcher control into a tab of the side
panel. This behavior has no effect if the side panel behavior is not enabled.

![image](https://user-images.githubusercontent.com/30754460/123668575-1470ed00-d7f0-11eb-983a-27941772d54b.png)

### Snapping Grid Controls

Call `addBehavior('snappingGrid')` on the instance returned by
`farmOS.map.create()` to enable a dynamic snapping grid which can be used to draw
regular geometries given an origin, rotation, and grid cell dimensions.

![snapping_grid_demo](https://user-images.githubusercontent.com/30754460/88995756-5cb22300-d2a0-11ea-88a1-50edac1c0168.gif)

#### Exporting WKT / GeoJSON

There are some methods on the Edit control for exporting
geometries in Well Known Text (WKT) and GeoJSON format:

- `getWKT` / `getGeoJSON` - returns a string containing all the features on the
  drawing layer.
- `wktOn` / `geoJSONOn` - add event listeners for particular editing
  interactions. See example below:

```js
const myMap = farmOS.map.create("map");
myMap.addBehavior("edit").then(() => {
  myMap.edit.wktOn("featurechange", (wkt) => console.log(wkt));
});
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
JavaScript functions that will run automatically during map creation, or any
time afterwards.

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
a behavior JavaScript file in the `examples/simple-html-consumer/static` directory,
include it after `farmOS-map.js` in `static/index.html`, and run `npm run dev` to
see your behavior in the development server.

Behaviors that are added to `farmOS.map.behaviors` can also have an optional
`weight` property. This weight will be used to sort them before they are
attached to the map instance. Lighter weighted behaviors will be attached before
heavier ones.

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

#### Async Behaviors

Behaviors can attach themselves asynchronously leveraging [Javascript's Promise system](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
In fact, all the behaviors which come with farmOS-map load only when needed.

```js
const myBehavior = {
  attach(instance) {
    console.log("Starting slow behavior attachement...");
    return new Promise(resolve => {
      setTimeout(function() {
        instance.myTardyProperty = "world!";
        resolve();
      }, 2000);
    });
  },
};

instance.attachBehavior(myBehavior).then(() => {
  console.log("Hello " + instance.myTardyProperty);
});
```

The most common way this might be important is with the edit behavior. Since the `edit` property
of the map instance isn't populated until the edit behavior has loaded, it is necessary to access
it within a `.then()` statement;

```js
instance.addBehavior("edit").then(() => {
  instance.edit.wktOn("featurechange", console.log);
});
```

Behaviors which are added to `farmOS.map.behaviors` are also attached to the map aynchronously. This
means that a map instance may not be fully initialized when it is returned by `farmOS.map.create`.
Instead the property `instance.defaultBehaviorsAttached` is a promise that can be used to detect when
all the behaviors from `farmOS.map.behaviors` have finished being attached to the map.

## Advanced Integration

### Accent color

The farmOS-map accent color can be changed with the `--farmos-map-accent-color` custom CSS property.

```css
#farm-map {
  --farmos-map-accent-color: #336633;
}
```

### Working with farmOS-map in an NPM/Webpack Project

Some integration scenarios require farmOS-map to be modeled as a dependency - i.e. so static analysis can
validate/document class/method references. In these cases, installation is usually performed
[via a package manager](#via-package-managers) like `npm-cli` or `yarn`.

Then farmOS-map can be accessed using an `import` statement.

```js
import { MapInstanceManager, projection } from '@farmos.org/farmos-map';
```

Finally, it is recommended to externalize farmOS-map such that it is not actually bundled by Webpack.

**webpack.config.js:**

```js
module.exports = {
  ...
  externals: {
    '@farmos.org/farmos-map': 'farmOS.map',
  },
};
```

With this configuration, build-time tools have access to the full farmOS-map package but at runtime
farmOS-map will be accessed at `window.farmOS.map`. Naturally, this requires that the `farmOS-map.js`
and `farmOS-map.css` files are already included in the page as described in the [Usage instructions](#usage)
above.

### Webpack chunk loading

farmOS-map is bundled using Webpack's [Automatic Public Path](https://webpack.js.org/guides/public-path/#automatic-publicpath)
configuration to automatically determine the public path used for chunk loading.
This configuration works most of the time but advanced integrations may need to
specify a public path for consistent chunk loading [on the fly](https://webpack.js.org/guides/public-path/#on-the-fly).

The public path can be specified by setting `window.farmosMapPublicPath` before
the `farmOS-map.js` entrypoint is loaded in the DOM. For example:

```html
<script type="text/javascript">
  window.farmosMapPublicPath = '/libraries/farmOS-map';
</script>
<script src="./farmOS-map.js"></script>
```

## Upgrading from farmOS-map 1.x to 2.x

### For Authors of Custom Behaviors

Read and understand the documentation on [Async Behaviors](#async-behaviors) above.

**Required Change:** Ensure code which depends on side-effects of another behavior's `attach` method is updated to wait until
that has asynchronously completed.

**Before:**

```js
myMap.addBehavior("edit");
myMap.edit.wktOn("featurechange", console.log);
```

**After:**

```js
myMap.addBehavior("edit").then(() => {
  myMap.edit.wktOn("featurechange", console.log);
});
```

### For Custom Front-end Integrations

In addition to the change described in the previous section, upgrading to farmOS-map 2.x may also require
changes when integrated into custom Front-end applications.

**Required Change:** When packaging farmOS-map in a custom front-end, it is now important that all the files from the
`dist/` directory are served along with `farmOS-map.js`. farmOS-map 1.x was a single JS file named `farmOS-map.js` which
included all behavior implementations and even the OpenLayers/farmOS-map CSS. Now with 2.x, farmOS-map is distributed
as a collection of JS/CSS files which must be available in the same relative http directory.

**Before:**

```sh
cp some-path-to/farmOS-map/dist/farmOS-map.js my-app/resources/
```

**After:**

```sh
cp some-path-to/farmOS-map/dist/farmOS-map* my-app/resources/
```

**Required Change:** When including farmOS-map in a custom front-end, it is now necessary to include both `farmOS-map.js`
and `farmOS-map.css` in the path, not just `farmOS-map.js`.

```html
<script src="./farmOS-map.js"></script>
```

**After:**

```html
<link rel="stylesheet" href="./farmOS-map.css" type="text/css">
<script src="./farmOS-map.js"></script>
```

**Required Change:** Ensure code which calls `farmOS.map.create` does not assume behaviors from `farmOS.map.behaviors`
will be attached synchronously by the time `farmOS.map.create` returns. Any such code must be changed to wait
until the promise `instance.defaultBehaviorsAttached` is fulfilled.

**Before:**

```js
farmOS.map.behaviors.myBehavior = {
  attach(instance) {
    instance.myExampleProperty = "world!";
  },
};

const myMap = farmOS.map.create("map");

console.log("Hello " + myMap.myExampleProperty);
```

**After:**

```js
farmOS.map.behaviors.myBehavior = {
  attach(instance) {
    instance.myExampleProperty = "world!";
  },
};

const myMap = farmOS.map.create("map");

myMap.defaultBehaviorsAttached.then(() => {
  console.log("Hello " + myMap.myExampleProperty);
});
```


## Development

`nvm use` - Use nvm to configure Node.js version.

`npm install` - Install JavaScript dependencies in `./node_modules` and create
`package-lock.json`.

`npm run dev` - Start a Webpack development server at https://localhost:8080
which will live-update as code is changed during development.

`npm run build` - Generate the final `farmOS-map.js` file for distribution,
along with an `index.html` file that loads it, inside the `dist` directory.

## Maintainers

 * Michael Stenta (m.stenta) - https://github.com/mstenta

This project has been sponsored by:

 * [Farmier](https://farmier.com)
 * [Globetrotter Foundation](http://globetrotterfoundation.org)
 * [OpenTEAM](https://openteam.community)
 * [Foundation for Food and Agriculture Research](https://foundationfar.org)
 * [Wolfe's Neck Center for Agriculture and the Environment](https://www.wolfesneck.org)
