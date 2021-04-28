function lazyLoadedBehavior(name) {
  return {
    async attach(instance, options) {
      return import(/* webpackChunkName: "farmOS-map-behavior-[request]" */ `./${name}`).then((module) => {
        const behavior = module.default;
        behavior.attach(instance, options);
      });
    },
  };
}

export default {
  edit: lazyLoadedBehavior('edit'),
  google: lazyLoadedBehavior('google'),
  measure: lazyLoadedBehavior('measure'),
  rememberLayer: lazyLoadedBehavior('rememberLayer'),
  snappingGrid: lazyLoadedBehavior('snappingGrid'),
};
