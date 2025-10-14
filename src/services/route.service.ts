import { decode } from '@mapbox/polyline';
import { API_CONFIG } from '../config/api.config';
import { RoutePoint, RouteResponse } from '../types/route.types';
import { calculateDistance, calculateBearing } from '../utils/geo.utils';

// Mock route data for fallback - Dubai route from AWR Office to Burj Khalifa
const mockRoute: RoutePoint[] = [
  { latitude: 25.1879, longitude: 55.2744, speed: 30, streetName: "Marasi Dr", instruction: "Start at AWR Office, Business Bay" },
  { latitude: 25.1885, longitude: 55.2744, speed: 25, streetName: "Marasi Dr", instruction: "Head north on Marasi Dr" },
  { latitude: 25.1891, longitude: 55.2744, speed: 30, streetName: "Marasi Dr", instruction: "Continue on Marasi Dr" },
  { latitude: 25.1897, longitude: 55.2744, speed: 30, streetName: "Marasi Dr" },
  { latitude: 25.1903, longitude: 55.2744, speed: 25, streetName: "Marasi Dr", instruction: "Approaching Al Mustaqbal St" },
  { latitude: 25.1909, longitude: 55.2744, speed: 20, streetName: "Marasi Dr" },
  { latitude: 25.1915, longitude: 55.2744, speed: 15, streetName: "Marasi Dr", instruction: "Prepare to turn right" },
  { latitude: 25.1921, longitude: 55.2744, speed: 20, streetName: "Al Mustaqbal St", instruction: "Turn right onto Al Mustaqbal St" },
  { latitude: 25.1927, longitude: 55.2744, speed: 25, streetName: "Al Mustaqbal St" },
  { latitude: 25.1933, longitude: 55.2744, speed: 30, streetName: "Al Mustaqbal St", instruction: "Continue on Al Mustaqbal St" },
  { latitude: 25.1939, longitude: 55.2744, speed: 30, streetName: "Al Mustaqbal St" },
  { latitude: 25.1945, longitude: 55.2744, speed: 25, streetName: "Al Mustaqbal St", instruction: "Approaching Financial Centre Rd" },
  { latitude: 25.1951, longitude: 55.2744, speed: 30, streetName: "Financial Centre Rd" },
  { latitude: 25.1957, longitude: 55.2744, speed: 30, streetName: "Financial Centre Rd", instruction: "Continue on Financial Centre Rd" },
  { latitude: 25.1963, longitude: 55.2744, speed: 25, streetName: "Financial Centre Rd" },
  { latitude: 25.1968, longitude: 55.2744, speed: 20, streetName: "Mohammed Bin Rashid Blvd", instruction: "Approaching Burj Khalifa" },
  { latitude: 25.1972, longitude: 55.2744, speed: 10, streetName: "Mohammed Bin Rashid Blvd", instruction: "Arriving at Burj Khalifa, Downtown Dubai" }
];



class RouteService {
  private static instance: RouteService;

  private constructor() {}

  public static getInstance(): RouteService {
    if (!RouteService.instance) {
      RouteService.instance = new RouteService();
    }
    return RouteService.instance;
  }

  async fetchRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<RoutePoint[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: { lat: startLat, lng: startLng },
          end: { lat: endLat, lng: endLng }
        })
      });

      if (!response.ok) {
        console.warn('API error, falling back to mock route:', response.statusText);
        return this.densifyAndCalculateMetrics(mockRoute);
      }
      
      const json = await response.json() as RouteResponse;
      
      if (json.status !== 'OK' || !json.routes?.[0]?.legs?.[0]) {
        console.warn('Invalid route response, falling back to mock route:', json.error_message || json.status);
        return this.densifyAndCalculateMetrics(mockRoute);
      }

      const processedRoute = this.processRouteResponse(json);
      if (!processedRoute.length) {
        console.warn('Empty route response, falling back to mock route');
        return this.densifyAndCalculateMetrics(mockRoute);
      }

      return processedRoute;
    } catch (error) {
      console.warn('Error fetching route, falling back to mock route:', error);
      return this.densifyAndCalculateMetrics(mockRoute);
    }
  }

  private processRouteResponse(json: RouteResponse): RoutePoint[] {
    const route = json.routes![0];
    const leg = route.legs[0];
    const overview = route.overview_polyline?.points;
    
    if (!overview) {
      throw new Error('No route polyline found');
    }

    const decodedPoints = decode(overview);
    const routePoints: RoutePoint[] = [];
    let currentStep = 0;
    let lastLat: number | null = null;
    let lastLng: number | null = null;
    
    // Process route points with step information
    for (const point of decodedPoints) {
      // Skip duplicates
      if (lastLat !== null && lastLng !== null) {
        const dd = calculateDistance(lastLat, lastLng, point[0], point[1]);
        if (dd < 0.00005) continue;
      }

      // Find matching step
      while (currentStep < leg.steps.length) {
        const step = leg.steps[currentStep];
        const stepPoints = decode(step.polyline.points);
        if (stepPoints.some(sp => calculateDistance(point[0], point[1], sp[0], sp[1]) < 0.1)) {
          break;
        }
        currentStep++;
      }
      
      const step = leg.steps[Math.min(currentStep, leg.steps.length - 1)];
      
      // Add point to route with metadata
      const speedKmH = step.duration && step.distance ?
        Math.max(10, Math.min(80, (step.distance.value / step.duration.value) * 3.6)) : 40;

      routePoints.push({
        latitude: point[0],
        longitude: point[1],
        speed: speedKmH,
        streetName: step.html_instructions?.replace(/<[^>]*>/g, '').split(' on ')[1] || 'Road',
        instruction: step.html_instructions?.replace(/<[^>]*>/g, ''),
        distanceFromStart: 0,
        estimatedTime: 0,
      });

      lastLat = point[0];
      lastLng = point[1];
    }

    return this.densifyAndCalculateMetrics(routePoints);
  }

  private densifyAndCalculateMetrics(routePoints: RoutePoint[]): RoutePoint[] {
    // Densify route for smoother animation
    const densified: RoutePoint[] = [];
    const maxSegmentKm = 0.02;
    
    for (let i = 0; i < routePoints.length - 1; i++) {
      const a = routePoints[i];
      const b = routePoints[i + 1];
      const segmentKm = calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
      const parts = Math.max(1, Math.ceil(segmentKm / maxSegmentKm));
      
      for (let p = 0; p < parts; p++) {
        const frac = p / parts;
        densified.push({
          latitude: a.latitude + (b.latitude - a.latitude) * frac,
          longitude: a.longitude + (b.longitude - a.longitude) * frac,
          speed: a.speed,
          streetName: a.streetName,
          instruction: p === 0 ? a.instruction : undefined,
          distanceFromStart: 0,
          estimatedTime: 0,
          rotation: undefined
        });
      }
    }
    
    // Add final point
    densified.push({ ...routePoints[routePoints.length - 1], rotation: undefined });

    // Calculate cumulative metrics
    for (let i = 0; i < densified.length; i++) {
      if (i === 0) {
        densified[i].distanceFromStart = 0;
        densified[i].estimatedTime = 0;
      } else {
        const prev = densified[i - 1];
        const cur = densified[i];
        const d = calculateDistance(prev.latitude, prev.longitude, cur.latitude, cur.longitude);
        cur.distanceFromStart = (prev.distanceFromStart || 0) + d;
        const avgSpeed = (prev.speed + cur.speed) / 2 || cur.speed || 40;
        const timeHours = d / avgSpeed;
        cur.estimatedTime = (prev.estimatedTime || 0) + timeHours * 60;
        prev.rotation = calculateBearing(prev, cur);
      }
    }

    // Set final point rotation
    if (densified.length >= 2) {
      densified[densified.length - 1].rotation = densified[densified.length - 2].rotation;
    }

    return densified;
  }
}

export const routeService = RouteService.getInstance();