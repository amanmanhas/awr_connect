import { useState, useEffect } from 'react';
import { routeService } from '../services/route.service';
import { RoutePoint } from '../types/route.types';

interface RouteCoordinates {
  startCoords?: { lat: number; lng: number };
  endCoords?: { lat: number; lng: number };
}

export const useRouteData = (routeInfo: RouteCoordinates | null) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use provided route coordinates or fallback to default
        const start = routeInfo?.startCoords || { lat: 37.7647, lng: -122.4192 };
        const end = routeInfo?.endCoords || { lat: 37.7757, lng: -122.4194 };

        const route = await routeService.fetchRoute(
          start.lat, 
          start.lng, 
          end.lat, 
          end.lng
        );
        
        if (route && route.length > 0) {
          setRoutePoints(route);
        } else {
          setRoutePoints([]);
        }
      } catch (err) {
        console.error('Error fetching route:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch route'));
        setRoutePoints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [routeInfo]);

  return { routePoints, isLoading, error };
};
