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
    //if (!data.geometry || !data.geometry.coordinates) return; // 좌표 없는 경우 생략
    if (!data.geometry || !data.geometry.longitude || !data.geometry.latitude) return;
    coordinates: [
      parseFloat(data.geometry.longitude),
      parseFloat(data.geometry.latitude)
    ]
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
    clusterMaxZoom: 13, // clustering max zoom level
    clusterRadius: 50   // cluster radius (pixels)
  });

  map.addSource('cbg-layer', {
    'type': 'geojson',
    'data': './data/layers/cbg_data.geojson'
  });

  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  const properties = [
    { key: "Population", layerId: "population-layer", color: "#e55e5e" },
    { key: "MedHHInc", layerId: "medhhinc-layer", color: "#5eade5" },
    // 여기에 더 추가
  ];

  const propertiesPct = [
    { key: "Whites", layerId: "whites-layer" },
    { key: "Black", layerId: "black-layer" },
    { key: "Asian", layerId: "asian-layer" },
    { key: "Native_Ame", layerId: "native_ame-layer" },
    { key: "Public", layerId: "public-layer" },
    { key: "Commercial", layerId: "commercial-layer" },
    { key: "Industrial", layerId: "industrial-layer" },
    { key: "Residential", layerId: "residential-layer" },
    { key: "Mixed Use", layerId: "mixed-use-layer" }
  ];

  const propertiesPct1 = [
    

    // 여기에 더 추가
  ];

  properties.forEach(({ key, layerId, color }) => {
    map.addLayer({
      id: layerId,
      type: "fill",
      source: "cbg-layer",
      layout: { visibility: "none" },
      paint: {
          "fill-color": [
          "interpolate",
          ["linear"],
          ["get", key],
          0, "#f2f0f7",
          100, color,
          500, "#000"
        ],
        "fill-opacity": 0.6
      }
    });
  });

  propertiesPct.forEach(({ key, layerId}) => {
    map.addLayer({
      id: layerId,
      type: "fill",
      source: "cbg-layer",
      layout: { visibility: "none" },
      paint: {
          "fill-color": [
          "interpolate",
          ["linear"],
          ["get", key],
          0, " #0d47a1",
          20, " #1976d2",
          40, " #2196f3",
          60, " #64b5f6",
          80, " #bbdefb",
          100, " #bbdefb"
        ],
        "fill-opacity": 1
      }
    });
  });

  propertiesPct1.forEach(({ key, layerId}) => {
    map.addLayer({
      id: layerId,
      type: "fill",
      source: "cbg-layer",
      layout: { visibility: "none" },
      paint: {
          "fill-color": [
          "interpolate",
          ["linear"],
          ["get", key],
          0, "#0d47a1",
          0.2, "#1976d2",
          0.4, "#2196f3",
          0.6, "#64b5f6",
          0.8, "#bbdefb",
          1.0, "#bbdefb"
        ],
        "fill-opacity": 0.6
      }
    });
  });

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

    // {
    //   id: 'cbg-fill',
    //   type: 'fill',
    //   source: 'cbg-layer',
    //   paint: {
    //     'fill-color': [
    //       'interpolate',
    //       ['linear'],
    //       ['get', 'Residential'],  // <- 시각화할 속성
    //       0, '#f2f0f7',
    //       20, '#cbc9e2',
    //       40, '#9e9ac8',
    //       60, '#756bb1',
    //       80, '#54278f'
    //     ],
    //     'fill-opacity': 0.7
    //   }
    // },
    

  ];

  // Add All Layers to the Map
  layers.forEach((layer) => {
    map.addLayer(layer);
  });

}



export { addLayers };
