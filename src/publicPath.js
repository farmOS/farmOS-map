// Allow the public path to be set for Webpack chunk loading.
if (typeof window.farmosMapPublicPath !== 'undefined') {
  // eslint-disable-next-line camelcase, no-undef
  __webpack_public_path__ = window.farmosMapPublicPath;
}
