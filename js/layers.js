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

const propertiesTree = [
  // AV Crash Data
  { key: "crash_coun", layerId: "crash-count-layer", med: 11,  color: "  #e55e5e", max: 22 },
  { key: "crash_den", layerId: "crash-density-layer", med: 9.12,  color: "  #e55e5e", max: 146 },
  { key: "crash_den_predicted_Sci1", layerId: "crash-density1-layer", med: 9.12,  color: "  #e55e5e", max: 79 },
  { key: "crash_den_predicted_Sci2", layerId: "crash-density2-layer", med: 9.12,  color: "  #e55e5e", max: 79 },
  { key: "crash_den_predicted_Sci3", layerId: "crash-density3-layer", med: 9.12,  color: "  #e55e5e", max: 79 },
  { key: "Area_km2", layerId: "Area_km2-layer", med: 2.4,  color: "  #e55e5e", max: 4.93 },

  // Demographic Data
  { key: "Population", layerId: "population-layer", med: 10401,  color: "  #e55e5e", max: 111074 }, // Top 10
  { key: "Ethics_div", layerId: "ethnics-diversity-layer", med: 0.6,  color: " #2196f3", max: 0.9},
  
  // Social & Economic Data
  { key: "Felony_den", layerId: "felony-density-layer", med: 286,  color: "  #e55e5e", max: 19982 }, // Top 10
  { key: "Homeless_d", layerId: "homeless-density-layer", med: 88,  color: "  #e55e5e", max: 12328 }, // Top 10
  { key: "MedHHInc", layerId: "medhhinc-layer", med: 149901,  color: "  #e55e5e", max: 500001 },
 
  // Land Use Data
  { key: "Building_d", layerId: "building-density-layer", med: 0.36,  color: " #2196f3", max: 0.65}, // Top 10
  { key: "commerci_1", layerId: "commercial-density-layer", med: 2933,  color: " #30ab4a", max: 75268}, // Top 10
  { key: "Gini_Simps", layerId: "gini-simps-layer", med: 0.28,  color: "  #e55e5e", max: 0.73 }, // Top 10
  { key: "open_space", layerId: "open-space-density-layer", med: 1,  color: "  #30ab4a", max: 170 }, 

  // Transportation Data
  { key: "intersecti", layerId: "intersection-density-layer", med: 440,  color: " #2196f3", max: 2353}, // Top 10
  { key: "parking_me", layerId: "parking-meter-density-layer", med: 177,  color: "  #e55e5e", max: 22611}, // Top 10
  { key: "mean_eleva", layerId: "mean-elevation-layer", med: 57,  color: "  #e55e5e", max: 230}, // Top 10
  { key: "TransitSto", layerId: "transit-stop-density-layer", med: 85,  color: " #2196f3", max: 857},
  { key: "avg_speed_", layerId: "average-speed-layer", med: 18,  color: "  #e55e5e", max: 72},

  // Google Streetview Data
  { key: "SVI_Enclos", layerId: "SVI-enclos-layer", med: 0.23,  color: "  #30ab4a", max: 1.30 }, // Top 10
  { key: "SVI_Walkab", layerId: "SVI-walkability-layer", med: 0.0536,  color: "  #30ab4a", max: 0.1210}, // Top 10
  { key: "SVI_Obstac", layerId: "SVI-obstacle-layer", med: 0.0035,  color: " #30ab4a", max: 0.0274},
  { key: "VMI", layerId: "VMI-layer", med: 0.43,  color: " #30ab4a", max: 0.5}, // Top 10
  
  // 여기에 더 추가
  //{ key: "Black", layerId: "black-layer", med: 50,  color: " #2196f3", max: 100},
  //{ key: "Asian", layerId: "asian-layer", med: 50,  color: " #2196f3", max: 100},
  //{ key: "Native_Ame", layerId: "native-ame-layer", med: 50,  color: " #2196f3", max: 100},
  // { key: "tree_density", layerId: "tree-density-layer", med: 5350,  color: " #30ab4a", max: 17872},
  // { key: "open_space", layerId: "open-space-density-layer", med: 85,  color: " #2196f3", max: 170},
  // { key: "road_density", layerId: "road-density-layer", med: 30,  color: " #2196f3", max: 83},
  // { key: "traffic_signals_density", layerId: "traffic-signals-density-layer", med: 28,  color: " #2196f3", max: 507},
];



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
  
  fetch('./data/model/df_final_Sci3.geojson')
  .then(response => response.json())
  .then(geojson => {
    geojson.features.forEach(feature => {
      feature.id = feature.properties.geoid; // ✅ 필수!
    });
    
    map.addSource('cbg-layer', {
      'type': 'geojson',
      'data': geojson
    });
    
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    
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
              // NaN은 0으로 대체해서 색상 처리
              [
                "coalesce", // 첫 번째 숫자가 유효하면 사용, 아니면 다음
                ["get", key],
                0
              ],
              0, " #f2f0f7",
              med, color.trim(),
              max, " #000000"
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
            20,
            25, 40,
            50, 50
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
          ' #aa336a',     // 🔸 hover 시 색상
          ' #999999'      // 🔹 기본 색상
        ],
        "fill-opacity": [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.4,  // 🔸 hover 시 더 진하게
          0.1   // 🔹 기본 투명도
        ]
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


// ✅ 1. Create the legend container
const legend = document.createElement("div");
legend.id = "map-legend";
legend.style.cssText = `
  position: absolute;
  bottom: 30px;
  right: 10px;
  background: white;
  padding: 10px;
  font-size: 12px;
  color: #333;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  z-index: 1;
  display: none;
`;
document.body.appendChild(legend);

// ✅ 2. Render legend for a given layer
function updateLegend(layerInfo) {
  legend.innerHTML = `
    <strong>${layerInfo.layerId}</strong><br>
    <div style="width:100px; height:10px; background:linear-gradient(to right, #f2f0f7, ${layerInfo.color.trim()}, #000);"></div>
    <div style="display:flex; justify-content:space-between">
      <span>${0}</span><span>${layerInfo.med}</span><span>${layerInfo.max}</span>
    </div>
  `;
  legend.style.display = "block";
}

function hideLegend() {
  legend.style.display = "none";
}



export { addLayers, updateLegend, hideLegend, propertiesTree };
