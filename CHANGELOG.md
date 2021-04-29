# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Check in diff of `package.json`/`package-lock.json` from moving to NPM v7
- Update ssri dependency.
- Externalize OpenLayers dependency
- Update key Webpack build dependencies to take advantage of new features
- Update eslint to allow import() within code
- Remove redundant `defaults.behaviors` in favor of existing `farmOS.map.behaviors` mechanism for specifying the default behaviors
- Make instance behavior methods `async`
- Lazily load behaviors as separate Webpack chunks
- Avoid referencing named behaviors via window.farmOS.map since this breaks when farmOS-map is bundled e.g. in FieldKit
- Honor weights in async behavior attaching and expose `instance.defaultBehaviorsAttached`

## [v1.4.2] - 2021-04-02

### Changed

- Import ol-layerswitcher css from dist.
- SVG cleanup #105
- Make geocoder size and positioning more consistent. #107
- Update all dependencies.

### Fixed

- Fix CHANGELOG links in releases #106
- Set a max-height to scroll the layer switcher when needed. #100

## [v1.4.1] - 2021-02-09

### Added

- Add `.npmignore`. Do not ignore `/dist/`.

### Changed

- Publish GitHub release with a link to `CHANGELOG.md`.

## [v1.4.0] - 2021-02-08

### Added

- Add support for customizing layer groups #91
- Publish to NPM #64
- Create a CHANGELOG.md following keepachangelog.com convention.

### Changed

- Switch to NPM release of ol-grid #86
- Update link to google maps api key documentation. #92
- Update LICENSE from GPLv2 to MIT #96
- Update all dependencies.
- Build into `dist` directory instead of `build`.
- Use `@farmos.org/farmos-olgm` fork of `ol3-google-maps`. See #99

## [v1.3.0] - 2020-08-11

This release includes the following changes:

- Integrate a snapping grid into farmOS-map #85

## [v1.2.0] - 2020-07-29

This release includes the following changes:

- Add GeoJSON layer from object, instead of URL #76 #77
- Add support for style functions #72 #78
- Expose `tileSize` parameter for XYZ layers. #83
- Update OpenLayers and other dependencies.

## [v1.1.0] - 2020-04-16

This release includes the following changes:

- Publish with a Google Maps key that only works on farmOS GitHub Pages.
- Layer attribution #73
- Add MapBox watermark and attribution.
- Convert layer visibility to a string before saving it to localStorage with JSON.stringify(). See #65
- Test localStorage layer visibility is a boolean after parsing it with JSON.parse(), in case some browsers convert it to boolean automatically in localStorage.getItem(). See #65
- Explicitly check to see if localStorage.getItem() is not null before syncing it to OpenLayers. See #65

## [v1.0.1] - 2020-04-10

This release includes the following changes:

- Provide an 'arcgis-tile' layer type #67
- Fix TypeError: this.snapInteraction is undefined #69
- Add a GitHub action for packaging releases #45

## [v1.0.0] - 2020-02-25

This is the first official stable release of farmOS-map.js! 🎉

For information about everything that was done leading up to this, see the v1.0.0 milestone: https://github.com/farmOS/farmOS-map/milestone/1

Changes from v0.9.5 include:

- Enable high accuracy in the Geolocate control.
- Update OpenLayers to 6.2.1.
- Use SVG icons instead of Unicode characters for drawing and geolocate control buttons #41

## [v0.9.5] - 2020-02-21

This release changes the license of the project to GPLv2, so that it is compatible with Drupal.org packaging requirements.

See: https://www.drupal.org/project/drupalorg_whitelist/issues/3114971

## [v0.9.4] - 2020-02-15

This release includes the following changes:

- Base layers will be added to the top of the group, instead of the bottom.

## [v0.9.3] - 2020-02-08

This release includes:

- Move `forEachLayer.js` to `src/utils`.
- Move `formatArea()` and `formatLength()` functions to `src/utils/measure.js`.
- Create a `measureGeometry()` function that works with `Polygon` and `LineString` geometries.
- Add `measureGeometry()` as an instance method.
- Update all dependencies.

## [v0.9.2] - 2020-02-07

This release includes:

- Don't let OLGoogleMaps manage tile or image layers.

## [v0.9.1] - 2020-02-03

This release includes:

- Sort `farmOS.behaviors.map` by an optional weight property. See https://github.com/farmOS/farmOS-map/issues/56#issuecomment-581552493

## [v0.9.0] - 2020-01-30

This release includes:

- Add layer(s): Google Maps #8

## [v0.8.0] - 2020-01-30

This release includes breaking changes:

- Use `addBehavior('draw')` instead of `enableDraw()` method.

Other updates include:

- Split features when importing `GEOMETRYCOLLECTION`  in WKT.
- Remove `constrainResolution` option from zoom methods so it can be set globally elsewhere.
- Provide instance method for getting a layer by name (recursing into groups): `getLayerByName()`
- Add base layers to the bottom of the group.
- Fix https://github.com/walkermatt/ol-layerswitcher/issues/259 in layer switcher.
- Collapse Base Layers group by default.
- Set a `maxZoom` of 20 in `zoomToVectors()` and `zoomToLayer()`.
- Add an `attachBehavior()` method to instances.
- Add an `addBehavior()` method to instances to allow adding a behavior by name from `src/behavior`.
- Allow vector layer to be added without any options.
- Default layer colors to orange.
- Allow options to be passed in to behavior attach functions.
- Convert `enableDraw()` method to a new 'edit' behavior.
- Default interaction listener format to GeoJSON.
- Allow 'disable' event listeners to be run when disableAll() fires.
- Pass the event object into event listener callbacks as a second parameter.
- Refactor measure logic into a behavior.

## [v0.7.0] - 2019-12-12

This release includes breaking changes:

- Use `enableDraw()` method instead of `drawing: true` initialization option. #50
- Remove setWKT and setGeoJSON methods.

Other updates include:

- Add support for cluster layers #37
- Allow rotating map and show North arrow #39
- Change button color scheme to match farmOS #43
- Accept an optional layer param for enableDraw.
- Save instance initialization options to the instance so they are available for later use.
-  Replace OL core function for transforming from EPSG:3857 to EPSG:4326 to fix longitudes that have crossed the international date line. Fixes #49.

## [v0.6.0] - 2019-11-13

This release includes:

- Add Snap interaction #24
- Allow options to be passed into defaultControls() and defaultInteractions() - Fixes #48
- Refactor a bunch of Edit control code
- Snap to all vector layer features in the map #24
- Add GeoJSON methods to Edit control #46
- Measure lines and polygons in the drawing layer #47

## [v0.5.0] - 2019-10-31

This release includes:

- Update OpenLayers to 6.1.0.
- Make system of measurement (metric/us) configurable #13
- Drawing controls: next steps #40
- Require focus to use scroll zoom #44
- Disable all edit interactions when escape key is pressed #42
- Remember visibility state of base layers with localStorage #21
- Add example behavior which adds a MapBox Satellite base layer.
- In wktOn(), if event is "change", add interaction listeners for all event types that result in feature changes.
- Update ol-geocoder to 4.0.0 to fix https://github.com/jonataswalker/ol-geocoder/issues/199
- Add a forEachLayer() method for recursively iterating through layer groups.
- Reorganize instance code and methods.

## [v0.4.0] - 2019-10-31

This release includes:

- Add control: geolocate (GPS pinpoint) #6
- Provide a method for adding an XYZ layer.
- Allow WMS and XYZ layers to be set as base layers for the layerswitcher.
- Add controls for drawing points, lines, and polygons #18

## [v0.3.0] - 2019-09-18

This release includes:
- Ability to create layer groups #35
- Ability to add popups to the map #17
- Provide GeoJSON loader function to prevent 403's. (See https://github.com/farmOS/farmOS-map/pull/34)
- Make options optional in createInstance().
- Add GPLv3 LICENSE file.
- Multiple fixes/additions to README.md.

## [v0.2.0] - 2019-08-12

This release
- Unifies the `add*Layer` method calls into a single `addLayer` method;
- Expands the options for configuring controls and interactions when calling the `create` method;
- Changes some zoom behavior and adds a `zoomToLayer` method.

I _think_ that's just about everything. :slightly_smiling_face:

## [v0.1.0] - 2019-07-16

## [v0.0.5] - 2019-07-16

## [v0.0.4] - 2019-07-14

## [v0.0.3] - 2019-07-12

## [v0.0.2] - 2019-07-11

## [v0.0.1] - 2019-07-11

Initial commit.

[Unreleased]: https://github.com/farmOS/farmOS-map/compare/v1.4.2...HEAD
[v1.4.2]: https://github.com/farmOS/farmOS-map/compare/v1.4.1...v1.4.2
[v1.4.1]: https://github.com/farmOS/farmOS-map/compare/v1.4.0...v1.4.1
[v1.4.0]: https://github.com/farmOS/farmOS-map/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/farmOS/farmOS-map/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/farmOS/farmOS-map/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/farmOS/farmOS-map/compare/v1.0.1...v1.1.0
[v1.0.1]: https://github.com/farmOS/farmOS-map/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/farmOS/farmOS-map/compare/v0.9.5...v1.0.0
[v0.9.5]: https://github.com/farmOS/farmOS-map/compare/v0.9.4...v0.9.5
[v0.9.4]: https://github.com/farmOS/farmOS-map/compare/v0.9.3...v0.9.4
[v0.9.3]: https://github.com/farmOS/farmOS-map/compare/v0.9.2...v0.9.3
[v0.9.2]: https://github.com/farmOS/farmOS-map/compare/v0.9.1...v0.9.2
[v0.9.1]: https://github.com/farmOS/farmOS-map/compare/v0.9.0...v0.9.1
[v0.9.0]: https://github.com/farmOS/farmOS-map/compare/v0.8.0...v0.9.0
[v0.8.0]: https://github.com/farmOS/farmOS-map/compare/v0.7.0...v0.8.0
[v0.7.0]: https://github.com/farmOS/farmOS-map/compare/v0.6.0...v0.7.0
[v0.6.0]: https://github.com/farmOS/farmOS-map/compare/v0.5.0...v0.6.0
[v0.5.0]: https://github.com/farmOS/farmOS-map/compare/v0.4.0...v0.5.0
[v0.4.0]: https://github.com/farmOS/farmOS-map/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/farmOS/farmOS-map/compare/v0.3.0...v0.3.0
[v0.2.0]: https://github.com/farmOS/farmOS-map/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/farmOS/farmOS-map/compare/v0.0.5...v0.1.0
[v0.0.5]: https://github.com/farmOS/farmOS-map/compare/v0.0.4...v0.0.5
[v0.0.4]: https://github.com/farmOS/farmOS-map/compare/v0.0.3...v0.0.4
[v0.0.3]: https://github.com/farmOS/farmOS-map/compare/v0.0.2...v0.0.3
[v0.0.2]: https://github.com/farmOS/farmOS-map/compare/v0.0.1...v0.0.2
[v0.0.1]: https://github.com/farmOS/farmOS-map/commit/14bf276
