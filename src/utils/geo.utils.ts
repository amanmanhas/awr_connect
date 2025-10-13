import { RoutePoint } from '../types/route.types';

// Calculate distance between two points in km using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate bearing between two RoutePoints
export const calculateBearing = (start: RoutePoint, end: RoutePoint) => {
  const startLat = start.latitude * Math.PI / 180;
  const startLng = start.longitude * Math.PI / 180;
  const endLat = end.latitude * Math.PI / 180;
  const endLng = end.longitude * Math.PI / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

// Linear interpolate between two angles (degrees), shortest path
export const lerpAngle = (a: number = 0, b: number = 0, t: number) => {
  let diff = (b - a + 540) % 360 - 180; // shortest signed difference
  return (a + diff * t + 360) % 360;
};

// Interpolate between two points
export const interpolatePoint = (start: RoutePoint, end: RoutePoint, fraction: number): RoutePoint => ({
  latitude: start.latitude + (end.latitude - start.latitude) * fraction,
  longitude: start.longitude + (end.longitude - start.longitude) * fraction,
  speed: start.speed,
  streetName: start.streetName,
});