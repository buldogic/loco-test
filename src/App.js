import React from "react";
import MapComponent from "./components";
import './App.css'

const App = () => {
  return (
    <div>
      <div>
        <h1>Your React Leaflet Map</h1>
        <br />
      </div>
      <div  className="leaflet-container">
        <MapComponent />
      </div>
    </div>
  );
};

export default App;
