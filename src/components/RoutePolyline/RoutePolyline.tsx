import React from 'react';
import { Polyline } from 'react-native-maps';
import { RoutePoint } from '../../types/route.types';

interface RoutePolylineProps {
  routePoints: RoutePoint[];
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({ routePoints }) => {
  if (!routePoints || routePoints.length === 0) {
    return null;
  }

  const coordinates = routePoints.map(p => ({
    latitude: p.latitude,
    longitude: p.longitude
  }));

  return (
    <>
      {/* Route outline shadow */}
      <Polyline
        coordinates={coordinates}
        strokeColor="rgba(0, 0, 0, 0.15)"
        strokeWidth={10}
        geodesic={true}
        zIndex={0}
      />
      {/* Route white border */}
      <Polyline
        coordinates={coordinates}
        strokeColor="#ffffff"
        strokeWidth={8}
        geodesic={true}
        zIndex={1}
      />
      {/* Main route polyline */}
      <Polyline
        coordinates={coordinates}
        strokeColor="#4285F4"
        strokeWidth={6}
        geodesic={true}
        lineCap="round"
        lineJoin="round"
        zIndex={2}
      />
    </>
  );
};
