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


  fetch('./data/layers/cbg_data.geojson')
  .then(response => response.json())
  .then(geojson => {
    geojson.features.forEach(feature => {
      feature.id = feature.properties.GEOID; // ✅ 필수!
    });

    map.addSource('cbg-layer', {
      'type': 'geojson',
      'data': geojson
    });

    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    


    const propertiesPct = [
      { key: "Public", layerId: "public-layer" , med: 0.5,  color: " #0000FF", max: 1},
      { key: "Commercial", layerId: "commercial-layer", med: 0.5,  color: " #FF0000", max: 1},
      { key: "Industrial", layerId: "industrial-layer", med: 0.5,  color: " #800080", max: 1},
      { key: "Residential", layerId: "residential-layer",med: 0.5,  color: " #FFFF00", max: 1},
      { key: "Mixed Use", layerId: "mixed-use-layer" , med: 0.5,  color: " #FFA500", max: 1},
      { key: "SVI", layerId: "SVI-layer", med: 0.25,  color: " #30ab4a", max: 0.5},
      { key: "GVI", layerId: "GVI-layer", med: 0.25,  color: " #30ab4a", max: 0.5},
      { key: "VEI", layerId: "VEI-layer", med: 0.25,  color: " #30ab4a", max: 0.5},
      { key: "VMI", layerId: "VMI-layer", med: 0.25,  color: " #30ab4a", max: 0.5},
      { key: "VHI", layerId: "VHI-layer", med: 0.25,  color: " #30ab4a", max: 0.5},
    ];

    const propertiesTree = [
      { key: "crash_count", layerId: "crash-count-layer", med: 11,  color: "  #e55e5e", max: 22 },
      { key: "Area_km2", layerId: "Area_km2-layer", med: 2.4,  color: "  #e55e5e", max: 4.93 },
      { key: "Population", layerId: "population-layer", med: 10401,  color: "  #e55e5e", max: 111074 },
      { key: "MedHHInc", layerId: "medhhinc-layer", med: 149901,  color: "  #e55e5e", max: 250001 },
      { key: "MedRent", layerId: "MedRent-layer", med: 2382,  color: "  #e55e5e", max: 3501 },
      { key: "MedHVal", layerId: "MedHVal-layer", med: 1410900,  color: "  #e55e5e", max: 2000001 },
      { key: "Building_d", layerId: "building-density-layer", med: 0.36,  color: " #2196f3", max: 0.65},
      { key: "Whites", layerId: "whites-layer", med: 50,  color: " #2196f3", max: 100},
      { key: "Black", layerId: "black-layer", med: 50,  color: " #2196f3", max: 100},
      { key: "Asian", layerId: "asian-layer", med: 50,  color: " #2196f3", max: 100},
      { key: "Native_Ame", layerId: "native-ame-layer", med: 50,  color: " #2196f3", max: 100},

      { key: "commercial_density", layerId: "commercial-density-layer", med: 2927,  color: " #30ab4a", max: 75268},
      { key: "tree_density", layerId: "tree-density-layer", med: 5350,  color: " #30ab4a", max: 17872},
      { key: "open_space_density", layerId: "open-space-density-layer", med: 85,  color: " #2196f3", max: 170},
      { key: "intersection_density", layerId: "intersection-density-layer", med: 440,  color: " #2196f3", max: 2353},
      { key: "road_density", layerId: "road-density-layer", med: 30,  color: " #2196f3", max: 83},
      { key: "traffic_signals_density", layerId: "traffic-signals-density-layer", med: 28,  color: " #2196f3", max: 507},
      { key: "parking_meter_density", layerId: "parking-meter-density-layer", med: 176,  color: " #2196f3", max: 22611},
      { key: "Bus Stop Density", layerId: "Bus-Stop-Density-layer", med: 81,  color: " #2196f3", max: 673},
      { key: "Bus Line Density", layerId: "Bus-Line-Density-layer", med: 17,  color: " #2196f3", max: 437},
      { key: "Metro Stop Density", layerId: "Metro-Stop-Density-layer", med: 80,  color: " #2196f3", max: 401},
      { key: "Metro Line Density", layerId: "Metro-Line-Density-layer", med: 80,  color: " #2196f3", max: 166},

      // 여기에 더 추가
    ];

    propertiesTree.forEach(({ key, layerId, med, color, max}) => {
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
            0, " #f2f0f7",
            med, color,
            max, "#000"
          ],
          "fill-opacity": 0.6
        }
      });
    });

    propertiesPct.forEach(({ key, layerId, med, color, max}) => {
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
            0, " #f2f0f7",
            med, " #aaa",
            max, color
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
            ' #bc7486',   // 0-9 incidents
            10, ' #c25873', // 10-29 incidents
            30, ' #8a232d'  // 30 incidents or more 
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            25, 20,
            50, 40
          ],
          'circle-opacity': 0.6
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
        'circle-color': '# 9e3676',
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

    
    map.addLayer({
      id: "cbg-fill-layer",
      type: "fill",
      source: "cbg-layer",
      paint: {
        "fill-color": [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#aa336a',     // 🔸 hover 시 색상
          '#888888'      // 🔹 기본 색상
        ],
        "fill-opacity": 0.2
      }
    });

    // Add All Layers to the Map
    layers.forEach((layer) => {
      map.addLayer(layer);
    });

    let hoveredId = null;

    map.on('mousemove', 'cbg-fill-layer', (e) => {
      if (e.features.length > 0) {
        // 이전 hover된 feature의 hover 상태 false로
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: 'cbg-layer', id: hoveredId },
            { hover: false }
          );
        }

        // 새로운 feature hover 상태 true로
        hoveredId = e.features[0].id;
        map.setFeatureState(
          { source: 'cbg-layer', id: hoveredId },
          { hover: true }
        );
      }
    });

    map.on('mouseleave', 'cbg-fill-layer', () => {
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: 'cbg-layer', id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
    });

  });
}



export { addLayers };
