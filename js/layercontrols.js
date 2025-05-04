function createLayerControls() {

const layerGroups = {
    "AV Crash": [
      { id: "crash-count-layer", label: "Crash count" },
      { id: "crash-density-layer", label: "Crash density (Count/mi²)" },
      { id: "crash-density1-layer", label: "Crash density predicted-Gini Simpson Index 10% increased (Count/mi²)" },
      { id: "crash-density2-layer", label: "Crash density predicted-SVI Walkability 10% decreased (Count/mi²)" },
      { id: "crash-density3-layer", label: "Crash density predicted-SVI Visual furniture 10% increased (Count/mi²)" },
      { id: "Area_km2-layer", label: "Block group area (km²)" }
    ],
    "Demographic": [
      { id: "population-layer", label: "Population" },
      { id: "ethnics-diversity-layer", label: "Ethnics diversity (?)" },
    ],
    "Social & Economic": [
      { id: "felony-density-layer", label: "Felony density (Count/mi²)" },
      { id: "homeless-density-layer", label: "Homeless density (Count/mi²)" },
      { id: "medhhinc-layer", label: "Median household income ($)" },

    ],
    "Land Use": [
      { id: "building-density-layer", label: "Building density (?)" },
      { id: "commercial-density-layer", label: "Commercial POI Density (Count/mi²)" },
      { id: "gini-simps-layer", label: "Gini Simpson Index (?)" },
      { id: "open-space-density-layer", label: "Open Space (Recreation and Parks) Density (Count/mi²)" },
    ],
    
    "Transportation": [
      { id: "intersection-density-layer", label: "Intersection density (Count/mi²)" },
      { id: "parking-meter-density-layer", label: "Parking meter density (Count/mi²)" },
      { id: "mean-elevation-layer", label: "Mean elevation" },
      { id: "transit-stop-density-layer", label: "Transit stop density (Count/mi²)" },
      { id: "average-speed-layer", label: "Average speed" },
    ],
    "Google Streetview": [
      { id: "SVI-enclos-layer", label: "Sky View Index-enclos" },
      { id: "SVI-walkability-layer", label: "Sky View Index-walkability" },
      { id: "SVI-obstacle-layer", label: "Sky View Index-obstacle" },
      { id: "VMI-layer", label: "Visual Motorization Index" }
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