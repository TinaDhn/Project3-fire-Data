let url = "http://127.0.0.1:5000/data";
let myMap;  // Declare myMap outside of functions to make it accessible globally
let streetmap;  // Declare streetmap globally
let mapInitialized = false;  // Flag to check if the map is already initialized

function init() {
    let selector = d3.select("#selDataset");

    // Retrieve JSON data
    d3.json(url).then(function(dataPull) {
        let uniqueYears = new Set();

        // Extract unique years from the dataset
        dataPull.forEach(function(row) {
            uniqueYears.add(row[11]); 
        });

        // Create options for the dropdown menu
        selector.append("option").text("All Years").property("value", "all");
        uniqueYears.forEach(function(year) {
            selector.append("option").text(year).property("value", year);
        });

        // Add event listener to the dropdown menu
        selector.on("change", function () {
            let selectedYear = selector.property("value");
            filterData(selectedYear, dataPull);
        });

        // Initialize the map with all data
        if (!mapInitialized) {
            createMap([], [], []);
            mapInitialized = true;
        }

        // By default, load data for all years
        filterData("all", dataPull);
    });
}

function createMap(lowC, mediumC, highC) {
    // Check if the map is already initialized
    if (!myMap) {
        // Create the tile layer 
        streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // Create the map object
        myMap = L.map("map", {
            center: [39.106667, -94.676392],
            zoom: 5,
            layers: [streetmap]
        });

        mapInitialized = true;
    }

    // Clear existing layers
    myMap.eachLayer(layer => {
        if (layer instanceof L.LayerGroup) {
            layer.clearLayers();
        }
    });

    // Create the overlay map object
    let overlayMaps = {
        "0%-50% Confidence": L.layerGroup(lowC),
        "50%-74% Confidence": L.layerGroup(mediumC),
        "+75% Confidence": L.layerGroup(highC)
    };

    // Check if the control already exists, if not, create it
    let layerControl = myMap._controlLayers;
    if (!layerControl) {
        // Create the layer control and pass the base and overlay maps
        L.control.layers({ "OpenStreetMap": streetmap }, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    } else {
        // Update existing layer control with new overlay maps
        layerControl.remove();
        L.control.layers({ "OpenStreetMap": streetmap }, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    }
}

function brightnessFire(brightness) {
    // ... (unchanged)
        if (brightness >= 0 && brightness <= 250) {
        return "lightyellow";
    } else if (brightness > 250 && brightness <= 300) {
        return "yellow";
    } else if (brightness > 300 && brightness <= 325) {
        return "orange";
    } else if (brightness > 325 && brightness < 350) {
        return "red";
    } else if (brightness > 350 && brightness <= 375) {
        return "darkred";
    } else {
        return "black";
    }
}

function fireMarkers(data) {
    let lowConfidence = [];
    let mediumConfidence = [];
    let highConfidence = [];

    for (let i = 0; i < data.length; i++) {
        let response = data[i];
        let lat_data = response[0];
        let lon_data = response[1];
        let fireBrightness = response[2];
        let startDate = response[3];
        let startTime = response[4];
        let satelliteID = response[5];
        let confidenceLvl = response[6];

        if (confidenceLvl <= 49) {
            let lMarkers = L.circle([lat_data, lon_data], {
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
                <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);

            lowConfidence.push(lMarkers);
        } else if (confidenceLvl >= 50 && confidenceLvl <= 74) {
            let mConfidence = L.circle([lat_data, lon_data], {
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 1500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
                <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
            mediumConfidence.push(mConfidence);
        } else if (confidenceLvl >= 75) {
            let hConfidence = L.circle([lat_data, lon_data], {
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 4500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
                <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
            highConfidence.push(hConfidence);
        } else {
            return "Error";
        }
    }

    // Update the map with new layers
    myMap.eachLayer(layer => {
        if (layer instanceof L.LayerGroup) {
            layer.clearLayers();
        }
    });

    createMap(lowConfidence, mediumConfidence, highConfidence);
}

function filterData(selectedYear, data) {
    // Filter data based on the selected year
    let filteredData;
    if (selectedYear === "all") {
        filteredData = data;
    } else {
        filteredData = data.filter(row => row[11] == selectedYear);
    }

    // Call fireMarkers with the filtered data
    fireMarkers(filteredData);
}

init();

// let url = "http://127.0.0.1:5000/data";
// let myMap;  // Declare myMap outside of functions to make it accessible globally
// let streetmap;  // Declare streetmap globally
// let mapInitialized = false;  // Flag to check if the map is already initialized
// let overlayMaps = {};  // Global object to hold overlay maps

// function init() {
//     let selector = d3.select("#selDataset");

//     // Retrieve JSON data
//     d3.json(url).then(function(dataPull) {
//         let uniqueYears = new Set();

//         // Extract unique years from the dataset
//         dataPull.forEach(function(row) {
//             uniqueYears.add(row[11]); 
//         });

//         // Create options for the dropdown menu
//         selector.append("option").text("All Years").property("value", "all");
//         uniqueYears.forEach(function(year) {
//             selector.append("option").text(year).property("value", year);
//         });

//         // Add event listener to the dropdown menu
//         selector.on("change", function () {
//             let selectedYear = selector.property("value");
//             filterData(selectedYear, dataPull);
//         });

//         // Initialize the map with all data
//         if (!mapInitialized) {
//             createMap([], [], []);
//             mapInitialized = true;
//         }

//         // By default, load data for all years
//         filterData("all", dataPull);
//     });
// }

// function createMap(lowC, mediumC, highC) {
//     // Check if the map is already initialized
//     if (myMap) {
//         // Clear existing layers
//         myMap.eachLayer(layer => {
//             if (layer instanceof L.LayerGroup) {
//                 layer.clearLayers();
//             }
//         });
//     } else {
//         // Create the tile layer 
//         streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         });

//         // Create the map object
//         myMap = L.map("map", {
//             center: [39.106667, -94.676392],
//             zoom: 5,
//             layers: [streetmap]
//         });

//         mapInitialized = true;
//     }

//     // Create the overlay map object
//     overlayMaps = {
//         "0%-50% Confidence": L.layerGroup(lowC),
//         "50%-74% Confidence": L.layerGroup(mediumC),
//         "+75% Confidence": L.layerGroup(highC)
//     };

//     // Create the layer control and pass the base and overlay maps
//     L.control.layers({ "OpenStreetMap": streetmap }, overlayMaps, {
//         collapsed: false
//     }).addTo(myMap);
// }

// function brightnessFire(brightness) {
//     // ... (unchanged)
//         if (brightness >= 0 && brightness <= 250) {
//         return "lightyellow";
//     } else if (brightness > 250 && brightness <= 300) {
//         return "yellow";
//     } else if (brightness > 300 && brightness <= 325) {
//         return "orange";
//     } else if (brightness > 325 && brightness < 350) {
//         return "red";
//     } else if (brightness > 350 && brightness <= 375) {
//         return "darkred";
//     } else {
//         return "black";
//     }
// }

// function fireMarkers(data) {
//     let lowConfidence = [];
//     let mediumConfidence = [];
//     let highConfidence = [];

//     for (let i = 0; i < data.length; i++) {
//         let response = data[i];
//         let lat_data = response[0];
//         let lon_data = response[1];
//         let fireBrightness = response[2];
//         let startDate = response[3];
//         let startTime = response[4];
//         let satelliteID = response[5];
//         let confidenceLvl = response[6];

//         if (confidenceLvl <= 49) {
//             let lMarkers = L.circle([lat_data, lon_data], {
//                 color: brightnessFire(fireBrightness),
//                 fillColor: brightnessFire(fireBrightness),
//                 fillOpacity: 0.75,
//                 radius: 500,
//                 weight: 0.4
//             }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
//                 <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);

//             lowConfidence.push(lMarkers);
//         } else if (confidenceLvl >= 50 && confidenceLvl <= 74) {
//             let mConfidence = L.circle([lat_data, lon_data], {
//                 color: brightnessFire(fireBrightness),
//                 fillColor: brightnessFire(fireBrightness),
//                 fillOpacity: 0.75,
//                 radius: 1500,
//                 weight: 0.4
//             }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
//                 <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
//             mediumConfidence.push(mConfidence);
//         } else if (confidenceLvl >= 75) {
//             let hConfidence = L.circle([lat_data, lon_data], {
//                 color: brightnessFire(fireBrightness),
//                 fillColor: brightnessFire(fireBrightness),
//                 fillOpacity: 0.75,
//                 radius: 4500,
//                 weight: 0.4
//             }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
//                 <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
//             highConfidence.push(hConfidence);
//         } else {
//             return "Error";
//         }
//     }

//     // Update the overlayMaps object with new layers
//     overlayMaps = {
//         "0%-50% Confidence": L.layerGroup(lowConfidence),
//         "50%-74% Confidence": L.layerGroup(mediumConfidence),
//         "+75% Confidence": L.layerGroup(highConfidence)
//     };

//     // Set the new layers to the existing control
//     myMap.eachLayer(layer => {
//         if (layer instanceof L.Control.Layers) {
//             layer.setOverlays(overlayMaps);
//         }
//     });
// }

// function filterData(selectedYear, data) {
//     // Filter data based on the selected year
//     let filteredData;
//     if (selectedYear === "all") {
//         filteredData = data;
//     } else {
//         filteredData = data.filter(row => row[11] == selectedYear);
//     }

//     // Call fireMarkers with the filtered data
//     fireMarkers(filteredData);
// }

// init();
