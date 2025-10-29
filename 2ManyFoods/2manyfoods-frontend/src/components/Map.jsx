require('dotenv').config();

const api_key = process.env.API_KEY;

async function initMap(){
    const [{Map}, {AdvancedMarkerElement}] = await Promise.all([google.maps.importLibrary("maps"),google.maps.importLibrary("marker"),]);
    const latlang = {lat: 1.3483, lng: 103.6831};
    const map = new google.maps.Map(document.getElementById("map"),{
        zoom:15,
        center: latlang,
    });
    let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: latLang,
    });
    infoWindow.open(map);

    map.addListener("click", (mapsMouseEvent) => {
        infoWindow.close();

        infoWindow = new google.maps.InfoWindow({
            position: mapsMouseEvent.latLng,
        });

        infoWindow.setContent(
            JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
        );
        infoWindow.open(map);
    });     
}

initMap();
