/* eslint-disable no-inner-declarations */

import React, { useRef, useEffect } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet-control-geocoder";
import { grids } from "../grids.js";
import { counties } from "../counties.js";
import { states } from "../states.js";
import MarkerSidebar from "./MarkerList.jsx";

function Map() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // Holds the Leaflet map instance
  const [markers, setMarkers] = React.useState([]);

  const deleteMarker = (markerToDelete) => {
    markerToDelete.marker.remove(); // Remove from Leaflet map

    setMarkers((prevMarkers) =>
      prevMarkers.filter((marker) => marker.marker !== markerToDelete.marker)
    );
  };

  useEffect(() => {
    if (mapRef.current) {
      mapInstance.current = L.map(mapRef.current, { attributionControl: false }).setView(
        [39.8333, -94.5833],
        4
      );

      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      }).addTo(mapInstance.current);

      L.control.attribution({ prefix: false }).addTo(mapInstance.current);

      const addMarker = (lat, lng, gridcode, state, county) => {
        const newMarker = L.marker([lat, lng]).addTo(mapInstance.current);
        let markerInfo = "Marker at " + lat.toFixed(3) + ", " + lng.toFixed(3);

        if (gridcode) {
          markerInfo += "<br>Grid ID: " + gridcode;
        }
        if (state) {
          markerInfo += "<br>State: " + state;
        }
        if (county) {
          markerInfo += "<br>County: " + county;
        }

        newMarker.bindPopup(markerInfo).openPopup();

        setMarkers((prevMarkers) => [
          ...prevMarkers,
          { lat, lng, marker: newMarker, gridcode, state, county },
        ]);
      };

      function gridOnEachFeature(feature, layer) {
        // Create a label for the feature
        var label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: "label", // Use the 'label' class from your CSS
            html: feature.properties.GRIDCODE,
            iconSize: null, // Let CSS handle the size
          }),
        });

        // Function to add or remove the label based on zoom level
        function updateLabel() {
          var zoom = mapInstance.current.getZoom();
          if (zoom > 10 && mapInstance.current.getBounds().intersects(layer.getBounds())) {
            // Adjust zoom level as needed
            label.addTo(mapInstance.current);
          } else {
            label.remove();
          }
        }

        // Update label on map events
        mapInstance.current.on("zoomend moveend", updateLabel);

        // Initially update the label
        updateLabel();
      }

      const cpc_grids = L.geoJSON(grids, {
        style: function (feature) {
          return {
            color: "black",
            weight: 2,
            fillOpacity: 0,
          };
        },
        onEachFeature: gridOnEachFeature,
      }).addTo(mapInstance.current);

      function countyOnEachFeature(feature, layer) {
        // Create a label for the feature
        var label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: "county-label", // Use the 'label' class from your CSS
            html: feature.properties.NAME,
            iconSize: null, // Let CSS handle the size
          }),
        });

        // Function to add or remove the label based on zoom level
        function updateLabel() {
          var zoom = mapInstance.current.getZoom();
          if (zoom > 8 && mapInstance.current.getBounds().intersects(layer.getBounds())) {
            // Adjust zoom level as needed
            label.addTo(mapInstance.current);
          } else {
            label.remove();
          }
        }

        // Update label on map events
        mapInstance.current.on("zoomend moveend", updateLabel);

        // Initially update the label
        updateLabel();
      }

      const usa_counties = L.geoJSON(counties, {
        style: function (feature) {
          return {
            color: "blue",
            weight: 2,
            fillOpacity: 0,
          };
        },
        onEachFeature: countyOnEachFeature,
      }).addTo(mapInstance.current);

      mapInstance.current.on("click", function (e) {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;

        // Creating a GeoJSON Point for the clicked location
        var point = turf.point([lng, lat]);

        // Check each feature in your GeoJSON layer
        var gridcode = null;
        var state = null;
        var county = null;
        cpc_grids.eachLayer(function (layer) {
          // Check if the point is inside the polygon
          if (turf.inside(point, layer.toGeoJSON())) {
            gridcode = layer.feature.properties.GRIDCODE;
          }
        });
        usa_counties.eachLayer(function (layer) {
          // Check if the point is inside the polygon
          if (turf.inside(point, layer.toGeoJSON())) {
            county = layer.feature.properties.NAME;
            state = states[layer.feature.properties.STATEFP].name;
          }
        });

        addMarker(lat, lng, gridcode, state, county);
      });

      let geoCoderOptions = {
        collapsed: false,
        geocoder: L.Control.Geocoder.nominatim({
          geocodingQueryParams: {
            countrycodes: "us",
          },
        }),
        showUniqueResult: false,
      };

      const geocoder = L.Control.geocoder(geoCoderOptions).addTo(mapInstance.current);

      geocoder.on("markgeocode", function (e) {
        var bbox = e.geocode.bbox;
        var { lng, lat } = e.geocode.center;

        // Creating a GeoJSON Point for the searched location
        var point = turf.point([lng, lat]);

        // Check each feature in your GeoJSON layer
        var gridcode = null;
        var state = null;
        var county = null;
        cpc_grids.eachLayer(function (layer) {
          // Check if the point is inside the polygon
          if (turf.inside(point, layer.toGeoJSON())) {
            gridcode = layer.feature.properties.GRIDCODE;
          }
        });
        usa_counties.eachLayer(function (layer) {
          // Check if the point is inside the polygon
          if (turf.inside(point, layer.toGeoJSON())) {
            county = layer.feature.properties.NAME;
            state = states[layer.feature.properties.STATEFP].name;
          }
        });

        addMarker(lat, lng, gridcode, state, county);

        mapInstance.current.fitBounds(bbox);
      });
    }

    return () => {
      // Clean up the map
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const focusOnMarker = (lat, lng) => {
    console.log("🚀 ~ focusOnMarker ~ lat:", lat);
    console.log("🚀 ~ focusOnMarker ~ mapInstance.current:", mapInstance.current);
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 10); // 13 is the zoom level, adjust as needed
    }
  };

  return (
    <div style={{ display: "flex", height: "70vh", width: "100%" }}>
      <MarkerSidebar
        markers={markers}
        deleteMarker={deleteMarker}
        onMarkerSelect={focusOnMarker}
        style={{
          width: "300px",
          maxHeight: "500px", // set to the height of the map or as needed
          overflowY: "auto", // enable vertical scrolling
          flexShrink: 0,
          marginRight: "10px",
        }}
      />
      <div ref={mapRef} style={{ flex: 1 }} />
    </div>
  );
}

export default Map;