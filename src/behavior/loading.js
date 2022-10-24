import './loading.css';

// Loading behavior.
export default {
  attach(instance) {
    instance.map.on('loadstart', () => {
      instance.map.getViewport().classList.add('loading-spinner');
    });
    instance.map.on('loadend', () => {
      instance.map.getViewport().classList.remove('loading-spinner');
    });
  },
};
