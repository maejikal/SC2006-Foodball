import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './MapPage.css';

const API_KEY = import.meta.env.VITE_API_KEY;

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;
  const isIndividual = location.state?.isIndividual || false;

  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const currentCircleRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const latlang = { lat: 1.3483, lng: 103.6831 };
    const map = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: latlang,
    });

    let infoWindow = new google.maps.InfoWindow({
      content: "Click the map to get Lat/Lng!",
      position: latlang,
    });
    infoWindow.open(map);

    map.addListener("click", (mapsMouseEvent) => {
      infoWindow.close();
      
      if (currentCircleRef.current) {
        currentCircleRef.current.setMap(null);
      }

      currentCircleRef.current = new google.maps.Circle({
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.2,
        map,
        center: mapsMouseEvent.latLng,
        radius: 800,
      });

      const latLng = mapsMouseEvent.latLng.toJSON();
      setSelectedLocation(latLng);

      infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      infoWindow.setContent(
        JSON.stringify(latLng, null, 2)
      );
      infoWindow.open(map);
    });
  }, [isLoaded]);

  const handleConfirm = () => {
    if (selectedLocation) {
      navigate('/search', {
        state: { groupName, groupId, location: selectedLocation, isIndividual }
      });
    }
  };

  return (
    <div className="mapPage">
      <Navbar />
      <div className="mapContent">
        <h1>{groupName}</h1>
        <p>Click on the map to select your location</p>
        
        <div className="mapSection">
          <div className="mapWrapper">
            {!isLoaded ? (
              <div className="placeholderMap">Loading map...</div>
            ) : (
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className="locationInfo">
            <p>
              <strong>Selected:</strong> Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
            <button className="confirmBtn" onClick={handleConfirm}>
              confirm location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
