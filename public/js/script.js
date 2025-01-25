const socket = io();

let lastKnownPosition = null;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      socket.emit("send-location", { latitude, longitude, accuracy });

      lastKnownPosition = { latitude, longitude };

      if (accuracy < 50) {
        const currentZoom = map.getZoom();
        map.flyTo([latitude, longitude], currentZoom);
      }
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 50000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://kunalportfolio45.netlify.app/">Kunal Sharma</a>',
}).addTo(map);

const markers = {};

socket.on("recived-location", (data) => {
  const { id, latitude, longitude } = data;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }

  const currentZoom = map.getZoom();
  map.setView([latitude, longitude], currentZoom);

  if (lastKnownPosition) {
    const distance = getDistance(
      lastKnownPosition.latitude,
      lastKnownPosition.longitude,
      latitude,
      longitude
    );

    document.getElementById("distanceOutput").textContent = `Distance to ${id}: ${distance.toFixed(
      2
    )} km`;
  }

  const jsonData = JSON.stringify(data, null, 2);
  document.getElementById("jsonOutput").textContent = jsonData;
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}