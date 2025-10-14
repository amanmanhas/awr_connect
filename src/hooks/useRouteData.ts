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
        // Use provided route coordinates or fallback to default (Dubai)
        const start = routeInfo?.startCoords || { lat: 25.1879, lng: 55.2744 }; // AWR Office
        const end = routeInfo?.endCoords || { lat: 25.1972, lng: 55.2744 }; // Burj Khalifa

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
