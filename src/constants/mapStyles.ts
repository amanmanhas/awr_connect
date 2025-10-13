export const customMapStyle = [
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { visibility: 'simplified' },
      { color: '#f0f0f0' }
    ]
  },
  {
    featureType: 'road.arterial',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'road.local',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }]
  }
];

export const DEFAULT_MAP_REGION = {
  latitude: 37.7647,
  longitude: -122.4192,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};
