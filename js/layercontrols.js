function createLayerControls() {

const layerGroups = {
    "AV Crash": [
      { id: "crash-count-layer", label: "Crash count" },
      { id: "Area_km2-layer", label: "Block Group Area (km²)" }
    ],
    "Demographic": [
      { id: "population-layer", label: "Population" },
      { id: "whites-layer", label: "White (%)" },
      { id: "black-layer", label: "Black (%)" },
      { id: "asian-layer", label: "Asian (%)" },
      { id: "native-ame-layer", label: "Native American (%)" }
    ],
    "Social & Economic": [
      { id: "medhhinc-layer", label: "Median Household Income ($)" },
      { id: "MedRent-layer", label: "Median Monthly Rent ($)" },
      { id: "MedHVal-layer", label: "Median House Value ($)" },
      { id: "building-density-layer", label: "Building Density" }
    ],
    "Land Use": [
      { id: "public-layer", label: "Public" },
      { id: "commercial-layer", label: "Commercial (%)" },
      { id: "industrial-layer", label: "Industrial (%)" },
      { id: "residential-layer", label: "Residential (%)" },
      { id: "mixed-use-layer", label: "Mixed Use (%)" },
      { id: "commercial-density-layer", label: "Commercial POI Density (Count/mi²)" }
    ],
    "Open Space": [
      { id: "tree-density-layer", label: "Tree Density (Count/mi²)" },
      { id: "open-space-density-layer", label: "Open Space (Recreation and Parks) Density (Count/mi²)" }
    ],
    "Transportation": [
      { id: "intersection-density-layer", label: "Intersection Density (Count/mi²)" },
      { id: "road-density-layer", label: "Road Density (mi/mi²)" },
      { id: "traffic-signals-density-layer", label: "Traffic Signals Density (Count/mi²)" },
      { id: "parking-meter-density-layer", label: "Parking Meter Density (Count/mi²)" },
      { id: "Bus-Stop-Density-layer", label: "Bus Stop Density" },
      { id: "Bus-Line-Density-layer", label: "Bus Line Density" },
      { id: "Metro-Stop-Density-layer", label: "Metro Stop Density" },
      { id: "Metro-Line-Density-layer", label: "Metro Line Density" }
    ],
    "Google Streetview": [
      { id: "SVI-layer", label: "Sky View Index" },
      { id: "GVI-layer", label: "Green View Index" },
      { id: "VEI-layer", label: "Visual Enclosure Index" },
      { id: "VMI-layer", label: "Visual Motorization Index" },
      { id: "VHI-layer", label: "Visual Housing Index" }
    ]
  };

  const container = document.getElementById("layer-controls");

  for (const [groupTitle, layers] of Object.entries(layerGroups)) {
    const groupHeader = document.createElement("h5");
    groupHeader.textContent = groupTitle;
    container.appendChild(groupHeader);

    layers.forEach(layer => {
      const wrapper = document.createElement("div");
      wrapper.className = "toggle-wrapper";

      wrapper.innerHTML = `
        <label class="toggle-switch">
          <input type="checkbox" data-layer="${layer.id}" class="layer-toggle" />
          <span class="slider"></span>
        </label>
        <span class="toggle-label">${layer.label}</span>
      `;

      container.appendChild(wrapper);
    });
  } 
}

export {createLayerControls};