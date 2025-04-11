import { db, collection, addDoc } from './firebase.js';
import { setupMap } from './map-setup.js';
import { setupGeocoder } from './geocoder.js';
import { addLayers } from './layers.js';
import { loadEvents } from './eventlist.js';

mapboxgl.accessToken = 'pk.eyJ1IjoieWptYXJrIiwiYSI6ImNtMHlwOG81NTBxZ2kya3BsZXp5MXJ5Z2wifQ.ijwd5rmGXOOJtSao2rNQhg';
const map = setupMap();

//new mapboxgl.Popup({ closeOnClick: false })
//.setLngLat([-76.295, 36.965])
//.setHTML(`
//  <h3>Base Management System by Youngsang Jun</h3>
//  <h4>About Base Management System</h4>
//  <p>Base Management System is a system for manage all kinds of events in a military base, such as training, exercise, sports, construction projects etc. This engagement project uses the Norfolk Naval Base in Virginia as an example. Therefore, the expected primary users of this system are the personnel stationed at the Norfolk Naval Base. The system will share schedules and locations of activities with relevant personnel within the base.</p>
//    <h4>Notes</h4>
//    <p>- This dataset is fictitious and does not reflect actual data.</p>
//`)
//.addTo(map);
setupGeocoder(map);
// 초기 레이어 및 소스 추가
map.on('load', () => {
  addLayers(map);
  loadEvents(map);
});


map.on("click", (e) => {
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

  window.selectedMarker = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .addTo(map);
  
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
    document.getElementById("event_place").value = `${lat}, ${lng}`;
    document.getElementById("event_name").focus(); // 이벤트 이름 입력 필드에 포커스
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