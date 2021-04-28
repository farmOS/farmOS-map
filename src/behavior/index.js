function lazyLoadedBehavior(name) {
  return {
    async attach(instance, options) {
      return import(/* webpackChunkName: "farmOS-map-[request]" */ `./${name}`).then((module) => {
        const behavior = module.default;
        behavior.attach(instance, options);
      });
    },
  };
}

export default {
  rememberLayer: lazyLoadedBehavior('rememberLayer'),
  edit: lazyLoadedBehavior('edit'),
  google: lazyLoadedBehavior('google'),
  measure: lazyLoadedBehavior('measure'),
  snappingGrid: lazyLoadedBehavior('snappingGrid'),
};
