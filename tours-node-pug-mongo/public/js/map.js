/* eslint-disable */
document.addEventListener('DOMContentLoaded', function() {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);

  // Create leafletjs map object
  const map = L.map('map', { scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Create the icon with the given assets and css properties
  var greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40], // size of the icon
    iconAnchor: [16, 45], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50] // point from which the popup should open relative to the iconAnchor
  });

  // Add locations to map an create points array (coordinates)
  const pointsLonLat = [];
  locations.forEach(location => {
    const [lat, lon] = location.coordinates;
    pointsLonLat.push([lon, lat]);

    // Add Map marker to map
    const popupText = `<p>Day ${location.day}: ${location.description}</p>`;
    L.marker([lon, lat], { icon: greenIcon })
      .addTo(map)
      .bindPopup(popupText, { autoClose: false, className: 'mapPopup' })
      .openPopup()
      .on('mouseover', function(e) {
        this.openPopup();
      })
      .on('mouseout', function(e) {
        this.closePopup();
      });
  });

  // fit map to coordinates given
  const bounds = L.latLngBounds(pointsLonLat).pad(0.5);
  map.fitBounds(bounds);
});
