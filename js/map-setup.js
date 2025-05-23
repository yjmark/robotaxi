function setupMap() {
  const map = new mapboxgl.Map({
    container: 'map',
    
  //  style: 'mapbox://styles/mapbox/navigation-night-v1',
  //  style: 'mapbox://styles/mapbox/dark-v11',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-122.44255660062589, 37.76040996838519], 
    maxZoom: 17,
    minZoom: 1,
    zoom: 11,
  });

  // Na
  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'bottom-right');
  map.addControl(new mapboxgl.ScaleControl());

  return map;
}

export { setupMap };
