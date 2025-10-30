import React from 'react';
const api_key = import.meta.env.API_KEY;

export default async function Map(){
    var circleRadius = ($('#radius').val()*1000)
    const [{Map}] = await Promise.all([google.maps.importLibrary("maps")]);
    const latlang = {lat: 1.3483, lng: 103.6831};
    const map = new google.maps.Map(document.getElementById("map"),{
        zoom:15,
        center: latlang,
    });
    let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: latlang,
    });
    infoWindow.open(map);
    map.addListener("click", (mapsMouseEvent) => {
        infoWindow.close();
        const pinCircle = new google.maps.Circle({
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.2,
        map,
        center: mapsMouseEvent.latLng,
        radius: 800,
        });
        infoWindow = new google.maps.InfoWindow({
            position: mapsMouseEvent.latLng,
        });

        infoWindow.setContent(
            JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
        );
        infoWindow.open(map);
    });     
}

Map();
