import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from './firebase.js'; // 당신의 firebase 초기화 파일

async function loadFirestoreData() {
  const crashRef = collection(db, "av_crash_data");
  const snapshot = await getDocs(crashRef);

  const geojson = {
    type: "FeatureCollection",
    features: [],
  };

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.geometry || !data.geometry.coordinates) return; // 좌표 없는 경우 생략

    geojson.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [data.geometry.longitude, data.geometry.latitude]
      },
      properties: {
        ...data //???
      }
    });
  });

  return geojson;
  console.log("GeoJSON Data:", geojsonData);
}

async function addLayers(map) {
  const geojsonData = await loadFirestoreData();

  // Add Source Layer
  map.addSource('crashes', {
    'type': 'geojson',
// 'data': './data/layers/AVcrash3.geojson',
    'data': geojsonData,
    cluster: true,
    clusterMaxZoom: 14, // clustering max zoom level
    clusterRadius: 50   // cluster radius (pixels)
  });

  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  
  const layers = [
    {
      id: 'clusters',
      type: 'circle',
      source: 'crashes',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',   // 0-9 incidents
          10, '#f1f075', // 10-29 incidents
          30, '#f28cb1'  // 30 incidents or more 
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,
          10, 20,
          30, 25
        ]
      }
    },
    {
      id: 'cluster-count',
      type: 'symbol',
      source: 'crashes',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    },
    {
      id: 'unclustered-point',
      type: 'circle',
      source: 'crashes',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    },
  ];

  // Add All Layers to the Map
  layers.forEach((layer) => {
    map.addLayer(layer);
  });

}
export { addLayers };
