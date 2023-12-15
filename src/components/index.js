import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { getDistance } from "../utils/getDistance";
import "leaflet/dist/leaflet.css";
import { getMs } from "../utils/getMs";
import { getAbsTimeDistance } from "../utils/getAbsTimeDistance";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./index.css";



delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const THRESHOLD = 3500;

function LocationMarker({ locations, temperatures }) {
  const [point, setPoint] = useState(null);

  const map = useMapEvents({
    mousemove: (e) => {
      const closest = locations
        .map((l) => {
          const distance = getDistance(l, e.latlng);
          return {
            distance,
            location: l,
          };
        })
        .sort((a, b) => b.distance - a.distance)
        .pop();

      if (closest.distance > THRESHOLD) {
        return setPoint(null);
      }

      const closestTemp = temperatures
        .map((t) => {
          const deltaTime = getAbsTimeDistance(
            t.timestamp,
            closest.location.timestamp
          );
          return {
            deltaTime,
            value: t.temp,
          };
        })
        .sort((a, b) => b.deltaTime - a.deltaTime)
        .pop();

      setPoint({ temp: closestTemp.value, coords: closest.location });
    },
  });

  if (point === null) return null;

  return (
    <Marker position={point.coords}>
      <Popup>Температура {point.temp}</Popup>
    </Marker>
  );
}

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [temperatures, setTemperatures] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationResponse = await fetch("/data/location.json");
        const temperatureResponse = await fetch("/data/temperatures.json");

        const locationData = await locationResponse.json();
        const temperatureData = await temperatureResponse.json();

        const locations = locationData.Latitude.map((lat, index) => {
          if (lat === "NA") return null;
          return {
            lat,
            lng: locationData.Longitude[index],
            timestamp: getMs(locationData.Timestamp[index]),
          };
        }).filter(Boolean);

        const temperatures = temperatureData.Timestamp.map((t, index) => {
          return {
            timestamp: getMs(t),
            temp: temperatureData.OutsideTemp[index],
          };
        });

        setLocations(locations);
        setTemperatures(temperatures);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const center = [59.13262376, 37.84800256];

  return (
    <MapContainer center={center} zoom={16}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={locations} />
      <LocationMarker locations={locations} temperatures={temperatures} />
    </MapContainer>
  );
};

export default MapComponent;
