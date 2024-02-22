let url ="http://127.0.0.1:5000/data"

function createMap(lowC,mediumC,highC){

    // Create the tile layer 
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // let streetmap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    // attribution: 'Map data: © OpenTopoMap contributors'
    
    // });

    // Create an object to hold the base map
    let baseMap = {
        View : streetmap
    };

    // Create the overlay map object
    let overlayMaps = {
        "0%-50% Confidence": lowC,
        "50%-74% Confidence": mediumC,
        "+75% Confidence": highC
    };

    // Create the map object
    let myMap = L.map("map", {
        center: [39.106667,-94.676392],
        zoom: 5,
        layers: [streetmap,]
    });
    // lowC,mediumC,highC

    // Create the layer control and pass the base and overlay maps
    L.control.layers(baseMap, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};


function brightnessFire(brightness){
    
    if (brightness>=0 && brightness<=250){
        return "lightyellow"
    }
    else if(brightness>250 && brightness<=305){
        return "yellow"
    }
    else if(brightness>305 && brightness<=325){
        return "orange"
    }
    else if (brightness>325 && brightness<350){
        return "red"
    }
    else if (brightness>350 && brightness<=375){
        return "darkred"
    }
    else {
        return "black"
    }
};

// function confidenceOpacity(conf){
//     if (conf>0 && conf <=49){
//         return 0.4
//     }
//     else if (conf>=50 && conf <=74){
//         return 0.6
//     }
//     else if (conf>=75 && conf <=100){
//         return 0.8
//     }

// };

function fireMarkers(data){

    
    let lowConfidence = [];
    let mediumConfidence = [];
    let highConfidence = [];

    for (let i=0;i<data.length;i++){

        let response = data[i];
        let lat_data = response[0];
        let lon_data = response[1];
        let fireBrightness = response[2];
        let startDate = response[3];
        let startTime = response[4];
        let satelliteID = response[5];
        let confidenceLvl = response[6];

        if (confidenceLvl<=49) {  
            let lMarkers = L.circle([lat_data,lon_data],{
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
            <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);

            lowConfidence.push(lMarkers);
        }

        else if (confidenceLvl>=50 && confidenceLvl<=74){
            let mConfidence = L.circle([lat_data,lon_data],{
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 1500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
            <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
            mediumConfidence.push(mConfidence);

        }   

        else if (confidenceLvl>=75){
            let hConfidence = L.circle([lat_data,lon_data],{
                color: brightnessFire(fireBrightness),
                fillColor: brightnessFire(fireBrightness),
                fillOpacity: 0.75,
                radius: 4500,
                weight: 0.4
            }).bindPopup(`<h3>Brightness: ${fireBrightness}</h3><h3>Confidence level: ${confidenceLvl}</h3>
            <h3>Start Date: ${startDate}</h3><h3>Start Time: ${startTime}</h3><h3>Satellite: ${satelliteID}</h3>`);
            highConfidence.push(hConfidence);
        }

        else {
            return "Error"
        }
    }

    let lowLayer = L.layerGroup(lowConfidence);
    let mediumLayer = L.layerGroup(mediumConfidence);
    let highLayer = L.layerGroup(highConfidence);
    createMap(lowLayer,mediumLayer,highLayer);
    
};


d3.json(url).then(fireMarkers);