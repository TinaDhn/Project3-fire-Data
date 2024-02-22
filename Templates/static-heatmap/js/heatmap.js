let url = "http://127.0.0.1:5000/data";

// Create a Leaflet map
let myMap = L.map("map", {
    center: [45,-102], // Set initial center
    zoom: 3.4 // Set initial zoom level
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the data and create heatmap
d3.json(url).then(function(response) {
    console.log(response);
    let heatArray = [];
    
    for (let i = 0; i < response.length; i++) {
        let data= response[i];
        let latitude= data[0];
        let longtitute= data[1];
        let brightness= data[2];
        heatArray.push([latitude, longtitute, brightness]);
        
    }
    console.log(heatArray);
    // Create heatmap layer
    let heat = L.heatLayer(heatArray, {
        radius: 1,
        blur: 1,
        opacity: 0.8
    }).addTo(myMap);
});