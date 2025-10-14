export const customMapStyle = [
  {
    featureType: 'road.arterial',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'road.local',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'on' }]
  }
];

export const DEFAULT_MAP_REGION = {
  latitude: 25.1879, // Dubai - AWR Office (Business Bay)
  longitude: 55.2744,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};
