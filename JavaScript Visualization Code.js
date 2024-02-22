let url = "http://127.0.0.1:5000/data";

function createMap(yearLayers, brightestFireMarker) {
    // Create the tile layer 
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create the map object
    let myMap = L.map("map", {
        center: [39.106667, -94.676392],
        zoom: 5,
        layers: [streetmap]
    });

    // Create the layer control and pass the base and overlay maps
    let baseMaps = {
        "Street Map": streetmap
    };

    // Create overlay maps with only the remaining years and the brightest fire marker
    let overlayMaps = Object.assign({}, yearLayers, { "Brightest Fire": brightestFireMarker });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};

function brightnessFire(brightness) {
    if (brightness >= 0 && brightness <= 250) {
        return "lightyellow"
    } else if (brightness > 250 && brightness <= 300) {
        return "yellow"
    } else if (brightness > 300 && brightness <= 325) {
        return "orange"
    } else if (brightness > 325 && brightness < 350) {
        return "red"
    } else if (brightness > 350 && brightness <= 375) {
        return "darkred"
    } else {
        return "black"
    }
};

function fireMarkers(data) {
    let yearLayers = {};
    let brightestFireMarker;

    // Loop through the data
    for (let i = 0; i < data.length; i++) {
        let response = data[i];
        let lat_data = response[0];
        let lon_data = response[1];
        let fireBrightness = response[2];
        let startDate = new Date(response[3]);
        let startTime = response[4];
        let satelliteID = response[5];
        let confidenceLvl = response[6];
        let year = startDate.getFullYear(); // Extract the year from the startDate

        // Only consider the specified years, excluding 2021
        if (year >= 2022 && year <= 2023) {
            // Check if the year layer group exists, if not, create it
            if (!yearLayers[year]) {
                yearLayers[year] = L.layerGroup([]);
            }

            if (fireBrightness >= 500) {
                let markerColor = brightnessFire(fireBrightness);
                let markerRadius = 8;

                let fireMarker = L.circleMarker([lat_data, lon_data], {
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.75,
                    radius: markerRadius,
                    weight: 1
                }).bindPopup("<h3>Brightness: " + fireBrightness + "</h3><h3>Confidence level: " + confidenceLvl + "</h3>" +
                    "<h3>Start Date: " + startDate + "</h3><h3>Start Time: " + startTime + "</h3><h3>Satellite: " + satelliteID + "</h3>");

                // Add the fire marker to the layer group for the corresponding year
                yearLayers[year].addLayer(fireMarker);

                // Update brightest fire
                if (!brightestFireMarker || fireBrightness > brightestFireMarker.options.fireBrightness) {
                    brightestFireMarker = fireMarker;
                    brightestFireMarker.options.fireBrightness = fireBrightness; // Store brightness in marker options
                }
            }
        }
    }

    // Highlight brightest fire marker
    if (brightestFireMarker) {
        brightestFireMarker.setStyle({
            radius: 20, // Increase size
            weight: 2, // Increase border thickness
            color: 'black', // Change border color
            fillColor: 'gold', // Change fill color
            fillOpacity: 1 // Increase opacity
        });
    }

    let fireMarkersLayer = L.layerGroup([]);
    // Add all fire markers to the layer group
    Object.values(yearLayers).forEach(layer => fireMarkersLayer.addLayer(layer));

    // Create the map with the year layers and brightest fire marker
    createMap(yearLayers, brightestFireMarker);
};

d3.json(url).then(fireMarkers);


























