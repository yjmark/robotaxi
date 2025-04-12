import { db, collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from './firebase.js';

let currentMarkers = []; // An array that stores the markers displayed on the map
let activePopup = null; // A variable that stores the currently active popup

function createListItem(data, docId) {
  const accidentDateTime = data.Accident_Date_Time?.toDate();
  const formattedDate = accidentDateTime?.toLocaleString();

  const listItem = document.createElement("li");
  listItem.innerHTML = `
    <div class="event-details">
      <div class="event-title"><strong>${data.Business_Name}</strong><br></div>
      <div>
        ${data.Make} ${data.Model}<br>
        ${formattedDate}<br>
        ${data.Number_of_Vehicles_Involved} vehicle(s)/${data.Involved_in_the_Accident} involved<br>
        ${data.Full_Address}
      </div>
    </div>
    <div class="event-buttons">
      <button class="edit-btn" data-id="${docId}">Edit</button>
      <button class="delete-btn" data-id="${docId}">Delete</button>
    </div>
  `;
  return listItem;
}

// Function to load event markers on the event list and map
async function loadEvents(map) {
  const eventListContainer = document.getElementById("eventListContainer");

  try {
    // Initialize the event list container
    eventListContainer.innerHTML = "";

    // Remove all markers from the map
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkers = []; // Initialize array

    // Import event data from Firestore
    const querySnapshot = await getDocs(collection(db, "av_crash_data"));
    const bounds = map.getBounds();

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      //const { latitude, longitude } = data.geometry.coordinates; 
      const docId = docSnapshot.id; // Import the document ID
      // Import latitude and longitude from the data (Change style according to Firestore style)
      let latitude, longitude;

      if (Array.isArray(data.geometry.coordinates)) {
        // GeoJSON style
        [longitude, latitude] = data.geometry.coordinates;
      } else if ('latitude' in data.geometry && 'longitude' in data.geometry) {
        // Firestore style
        latitude = data.geometry.latitude;
        longitude = data.geometry.longitude;
      } else {
        console.warn("No coordinates information: ", docSnapshot.id);
        return; // Skip if no coordinates
      }
      
      // ⛔ 지도 범위 밖이면 skip
      if (
        longitude < bounds.getWest() || longitude > bounds.getEast() ||
        latitude < bounds.getSouth() || latitude > bounds.getNorth()
      ) {
        return;
      }

      const accidentDateTime = data.Accident_Date_Time?.toDate(); // null-safe
      const formattedDate = accidentDateTime?.toLocaleString();


      // Add event data to the event list container
      const listItem = createListItem(data, docId);
      eventListContainer.appendChild(listItem);

    // FlyTo and popup event location when clicking on the event list item
    listItem.addEventListener("click", () => {
        // Remove previously active popup
        if (activePopup) {
            activePopup.remove();
          }
        map.flyTo({
        center: [longitude, latitude], 
        zoom: 14,                      
        essential: true                
        });
        // Create a new popup and add it to the map
        activePopup = new mapboxgl.Popup({ offset: 25 })
          .setLngLat([longitude, latitude])
          .setHTML(`
            <strong>${data.Business_Name}</strong><br>
            ${data.Make} ${data.Model} (${data.Vehicle_Year})<br>
            ${formattedDate}<br>
            Car was ${data.Vehicle_was}<br>
            ${data.Number_of_Vehicles_Involved} vehicle(s)/${data.Involved_in_the_Accident} involved<br>
            ${data.Full_Address}   
          `)
          .addTo(map);
    });
      const zoom = map.getZoom(); // 현재 줌
      // Add markers to the map
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';

      if (zoom < 14) {
        markerEl.style.display = "none";
        markerEl.style.pointerEvents = "none";
      } else {
        markerEl.style.display = "block";
        markerEl.style.pointerEvents = "auto";
      }

      // 팝업 설정
      const popup = new mapboxgl.Popup().setHTML(`
        <strong>${data.Business_Name}</strong><br>
        ${data.Make} ${data.Model} (${data.Vehicle_Year})<br>
        ${formattedDate}<br>
        Car was ${data.Vehicle_was}<br>
        ${data.Number_of_Vehicles_Involved} vehicle(s)/${data.Involved_in_the_Accident} involved<br>
        ${data.Full_Address}   
      `);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);
      
      marker.__data = data;
      marker.__docId = docId;

      // Click event for the marker
      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent map click event

        // Remove previously active popup
        if (activePopup) {
          activePopup.remove();
        }

        // Move
        map.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          essential: true
        });

        // Open popup
        popup.addTo(map);
        activePopup = popup;
      });  
      

      // 저장
      currentMarkers.push(marker); // Add the marker to the array
    });

    // Add event listener to the event list container
    eventListContainer.addEventListener("click", (e) => handleListActions(e, map));

  } catch (error) {
    console.error("Error loading crash reports: ", error);
  }
}

function toDateTimeLocal(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function updateEventListInView(map) {
  const eventListContainer = document.getElementById("eventListContainer");
  eventListContainer.innerHTML = "";

  const bounds = map.getBounds();

  // Filter currentMarkers based on visibility in current bounds
  const visibleMarkers = currentMarkers.filter(marker => {
    const lngLat = marker.getLngLat();
    return bounds.contains(lngLat);
  });

  visibleMarkers.forEach(marker => {
    if (marker.__data && marker.__docId) {
      const listItem = createListItem(marker.__data, marker.__docId);
      eventListContainer.appendChild(listItem);
      listItem.addEventListener("click", () => {
        if (activePopup) {
          activePopup.remove();
        }
        map.flyTo({
          center: [marker.getLngLat().lng, marker.getLngLat().lat],
          zoom: 14,
          essential: true
        });
        marker.getPopup().addTo(map);
        activePopup = marker.getPopup();
      });
    }
  });
}

// Edit and delete event actions
async function handleListActions(e, map) {
    const target = e.target;
    const docId = target.getAttribute("data-id");
  
    if (target.classList.contains("delete-btn")) {
      const confirmDelete = confirm("Are you sure you want to delete this record?");
      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, "av_crash_data", docId));
          alert("Record deleted successfully!");
          loadEvents(map); // Refresh the event list
        } catch (error) {
          console.error("Error deleting record: ", error);
        }
      }
    }
  
    if (target.classList.contains("edit-btn")) {
        // Fill in the edit form with the current values
        const docRef = doc(db, "av_crash_data", docId);
        const docSnapshot = await getDoc(docRef);
  
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
      
            // Fill in the form fields with the current values
            document.getElementById("Accident_Date_Time").value = toDateTimeLocal(data.Accident_Date_Time.toDate());
            document.getElementById("Business_Name").value = data.Business_Name;
            document.getElementById("Vehicle_Year").value = data.Vehicle_Year;
            document.getElementById("Make").value = data.Make;
            document.getElementById("geometry").value = `${data.geometry.latitude}, ${data.geometry.longitude}`;
            document.getElementById("Number_of_Vehicles_Involved").value = data.Number_of_Vehicles_Involved;
            document.getElementById("Vehicle_was").value = data.Vehicle_was;
            document.getElementById("Full_Address").value = data.Full_Address;
            document.getElementById("Involved_in_the_Accident").value = data.Involved_in_the_Accident;
      
            // Show the Bootstrap modal
            const editModal = new bootstrap.Modal(document.getElementById("eventModal"));
            editModal.show();

            // confirmButton (Update Firestore)
            const confirmButton = document.getElementById("confirmButton");
            confirmButton.replaceWith(confirmButton.cloneNode(true)); // Remove existing event listener
            document.getElementById("confirmButton").addEventListener("click", async () => {
            try {
                const updatedData = {
                    Accident_Date_Time: new Date(document.getElementById("Accident_Date_Time").value),
                    Business_Name: document.getElementById("Business_Name").value,
                    Vehicle_Year: document.getElementById("Vehicle_Year").value,
                    Make: document.getElementById("Make").value,
                    geometry: {
                    latitude: parseFloat(document.getElementById("geometry").value.split(",")[0]),
                    longitude: parseFloat(document.getElementById("geometry").value.split(",")[1]),
                    },
                    Number_of_Vehicles_Involved: document.getElementById("Number_of_Vehicles_Involved").value,
                    Vehicle_was: document.getElementById("Vehicle_was").value,
                    Full_Address: document.getElementById("Full_Address").value,
                    Involved_in_the_Accident: document.getElementById("Involved_in_the_Accident").value,
                };

                await updateDoc(docRef, updatedData);
                alert("Event updated successfully!");
                editModal.hide(); // Close the modal
                loadEvents(map); // Refresh the event list
            } catch (error) {
            console.error("Error updating event: ", error);
        }
    });
        } else {
            alert("Document does not exist!");
        }
    }
} 

export { loadEvents, currentMarkers, updateEventListInView };