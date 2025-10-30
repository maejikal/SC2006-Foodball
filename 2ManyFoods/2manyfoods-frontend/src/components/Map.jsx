import React from 'react';
const api_key = import.meta.env.API_KEY;

export default async function Map(){
    const [{Map}] = await Promise.all([google.maps.importLibrary("maps")]);
    const latlang = {lat: 1.3483, lng: 103.6831};
    const map = new google.maps.Map(document.getElementById("map"),{
        zoom:15,
        center: latlang,
    });
    
    var pinCircle = new google.maps.Circle({
    strokeColor: "#0000FF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0000FF",
    fillOpacity: 0.1,
    map,
    center: latlang,
    radius: 800,
    });

    map.addListener("click", (mapsMouseEvent) => {
        pinCircle.setCenter(mapsMouseEvent.latLng);
    });
 
}

Map();