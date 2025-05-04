import { db, collection, addDoc } from './firebase.js';
import { setupMap } from './map-setup.js';
import { setupGeocoder } from './geocoder.js';
import { addLayers } from './layers.js';
import { loadEvents, currentMarkers, updateEventListInView } from './eventlist.js';
import { createLayerControls } from './layercontrols.js';
import { initRadarChart, updateRadarChart } from './radarchart.js';


mapboxgl.accessToken = 'pk.eyJ1IjoieWptYXJrIiwiYSI6ImNtMHlwOG81NTBxZ2kya3BsZXp5MXJ5Z2wifQ.ijwd5rmGXOOJtSao2rNQhg';
const map = setupMap();

//new mapboxgl.Popup({ closeOnClick: false })
//.setLngLat([-76.295, 36.965])
//.setHTML(`
//  <h3>Robotaxi Incidents Management System By Shuai Wang, Emmanuel Jiang, and Youngsang Jun</h3>
//  <h4>About Robotaxi Incidents Management System</h4>
//  <p>Robotaxi Incidents Management System is a system for manage .</p>
//    <h4>Notes</h4>
//    <p>- This dataset is real and does reflect actual data.</p>
//`)
//.addTo(map);



// 초기 레이어 및 소스 추가
map.on('load', () => {
  addLayers(map);  
  loadEvents(map);
  

  
  map.on("zoomend", () => {
    const zoom = map.getZoom();
  
    currentMarkers.forEach(marker => {
      const el = marker.getElement();
      if (zoom >= 14) {
        el.style.display = "block";
        el.style.pointerEvents = "auto";  // 클릭 가능하게
      } else {
        el.style.display = "none";
        el.style.pointerEvents = "none";
      }
    });
  });
  
});
setupGeocoder(map);

// 레이어 선택을 위한 버튼 설정
// const layerList = document.getElementById('backgroundmap');
// const inputs = layerList.getElementsByTagName('input');
// for (const input of inputs) {
//   input.onclick = (layer) => {
//     const layerId = layer.target.id;
//     map.setStyle('mapbox://styles/mapbox/' + layerId);
//   };
// }



map.on("moveend", () => {
  updateEventListInView(map);// 지도 이동 후 리스트 갱신
});

// Zoom into cluster on click
map.on('click', 'clusters', (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters']
  });
  const clusterId = features[0].properties.cluster_id;
  map.getSource('crashes').getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;

    map.easeTo({
      center: features[0].geometry.coordinates,
      zoom: zoom
    });
  });
});

// Change the cursor to a pointer when the mouse is over the clusters layer
map.on('mouseenter', 'clusters', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', () => {
  map.getCanvas().style.cursor = '';
});

map.on("click", (e) => {
  // 👉 만약 클릭한 곳이 점(unclustered-point)이나 클러스터(clusters) 위라면 이벤트 중단
  const clickedFeatures = map.queryRenderedFeatures(e.point, {
    layers: ['unclustered-point', 'clusters']
  });

  if (clickedFeatures.length > 0) {
    return; // 점이나 클러스터 클릭 시 무시
  }

  // Add Event Button 
  const lat = e.lngLat.lat.toFixed(6); 
  const lng = e.lngLat.lng.toFixed(6);

  // Fill the event_place coordination input field with the clicked location
  const eventPlaceInput = document.getElementById("geometry");
  eventPlaceInput.value = `${lat}, ${lng}`;

  // Add marker on the clicked location
  if (window.selectedMarker) {
    window.selectedMarker.remove(); // Remove the existing marker
  }

  // window.selectedMarker = new mapboxgl.Marker({ color: "#003764" })
  //   .setLngLat([lng, lat])
  //   .addTo(map);
  
  const popupContent = document.createElement("div");
  popupContent.innerHTML = `
    <button type="button" id="addEventButton" class="btn-primary" data-bs-toggle="modal" data-bs-target="#eventModal" style="margin-top: 5px;">
      Add Event Here
    </button>
  `;

  new mapboxgl.Popup({ offset: -5 }) 
    .setLngLat([lng, lat])
    .setDOMContent(popupContent)
    .addTo(map);

  // Add Event 
  popupContent.querySelector("#addEventButton").addEventListener("click", () => {
    // 폼 초기화: 모든 입력 필드를 빈 값으로 설정
    const form = document.getElementById("eventForm");
    form.reset();

    // Add event
    document.getElementById("geometry").value = `${lat}, ${lng}`;
    document.getElementById("Accident_Date_Time").focus(); // 이벤트 이름 입력 필드에 포커스
    // Bootstrap modal
    const addEventModal = new bootstrap.Modal(document.getElementById("eventModal"));
    addEventModal.show();
  });
});

document.getElementById("confirmButton").addEventListener("click", async () => {
  const form = document.getElementById("eventForm");

  // Import the values from the form
  const Accident_Date_Time = new Date(document.getElementById("Accident_Date_Time").value);
  const Business_Name = document.getElementById("Business_Name").value;
  const Vehicle_Year = document.getElementById("Vehicle_Year").value;
  const Make = document.getElementById("Make").value;
  const Model = document.getElementById("Model").value;
  // const event_personnum = parseInt(document.getElementById("event_personnum").value, 10);
  const [lat, lng] = document.getElementById("geometry").value.split(",").map(Number);
  const Number_of_Vehicles_Involved = document.getElementById("Number_of_Vehicles_Involved").value;
  const Vehicle_was = document.getElementById("Vehicle_was").value;
  const Full_Address = document.getElementById("Full_Address").value;
  const Involved_in_the_Accident = document.getElementById("Involved_in_the_Accident").value;
  if (!Business_Name || !Vehicle_Year ||!Make || !Model ||isNaN(lat) || isNaN(lng)|| !Number_of_Vehicles_Involved || !Vehicle_was) {
    alert("Please fill in all required fields correctly!");
    return;
  }

  try {
    // Save the event to Firestore
    await addDoc(collection(db, "av_crash_data"), {
      Accident_Date_Time,
      Business_Name,
      Vehicle_Year,
      Make,
      Model,
      geometry: { latitude: lat, longitude: lng },
      Number_of_Vehicles_Involved,
      Vehicle_was,
      Full_Address,
      Involved_in_the_Accident,
    });

    alert("Incident successfully saved!");
    form.reset(); 
    document.querySelector('#eventModal .btn-close').click(); 
    loadEvents(map); 
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to save incident!");
  }
});

document.getElementById("eventModal").addEventListener("hidden.bs.modal", () => {

  const backdrops = document.querySelectorAll(".modal-backdrop");
  backdrops.forEach((backdrop) => backdrop.remove());

  document.body.classList.remove("modal-open");
  document.body.style.overflow = ""; 
});

document.getElementById("layer-controls").addEventListener("click", (e) => {
  const layerId = e.target.getAttribute("data-layer");
  if (!layerId) return;

  const visibility = map.getLayoutProperty(layerId, "visibility");
  map.setLayoutProperty(
    layerId,
    "visibility",
    visibility === "visible" ? "none" : "visible"
  );
});

document.addEventListener('DOMContentLoaded', () => {
  createLayerControls();
});

// 페이지 로드 후 차트 초기화
document.addEventListener('DOMContentLoaded', () => {
  initRadarChart();

  map.on('click', 'cbg-fill-layer', function (e) {
    const props = e.features[0].properties;
    const maxValues = {
      commerci_1: 75268,
      Population: 111074,
      SVI_Enclos: 1.30,
      Building_d: 0.65
    };
    const comPOI = (parseFloat(props.commerci_1) || 0)/ maxValues.commerci_1;
    const population = (parseFloat(props.Population) || 0)/ maxValues.Population;
    const SVI_Enclos = (parseFloat(props.SVI_Enclos) || 0)/ maxValues.SVI_Enclos;
    const Building_de = (parseFloat(props.Building_d) || 0)/ maxValues.Building_d;

    updateRadarChart([comPOI, population, SVI_Enclos, Building_de]);
  });
});

