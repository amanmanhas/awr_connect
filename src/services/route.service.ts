import { decode } from '@mapbox/polyline';
import { API_CONFIG } from '../config/api.config';
import { RoutePoint, RouteResponse } from '../types/route.types';
import { calculateDistance, calculateBearing } from '../utils/geo.utils';

// Mock route data for fallback
const mockRoute: RoutePoint[] = [
  // Mission District to Downtown SF following streets
  { latitude: 37.7647, longitude: -122.4192, speed: 30, streetName: "Mission St", instruction: "Start at Mission & 16th" },
  { latitude: 37.7651, longitude: -122.4198, speed: 20, streetName: "16th St", instruction: "Turn right onto 16th St" },
  { latitude: 37.7652, longitude: -122.4207, speed: 25, streetName: "16th St", instruction: "Continue on 16th St" },
  { latitude: 37.7653, longitude: -122.4212, speed: 25, streetName: "16th St" },
  { latitude: 37.7654, longitude: -122.4217, speed: 20, streetName: "16th St", instruction: "Approaching Mission St" },
  { latitude: 37.7655, longitude: -122.4226, speed: 15, streetName: "16th St" },
  { latitude: 37.7656, longitude: -122.4231, speed: 10, streetName: "16th St", instruction: "Prepare to turn left" },
  { latitude: 37.7657, longitude: -122.4236, speed: 15, streetName: "Mission St", instruction: "Turn left onto Mission St" },
  { latitude: 37.7662, longitude: -122.4235, speed: 25, streetName: "Mission St" },
  { latitude: 37.7666, longitude: -122.4234, speed: 30, streetName: "Mission St", instruction: "Continue on Mission St" },
  { latitude: 37.7671, longitude: -122.4233, speed: 30, streetName: "Mission St" },
  { latitude: 37.7676, longitude: -122.4232, speed: 25, streetName: "Mission St", instruction: "Approaching 14th St" },
  { latitude: 37.7681, longitude: -122.4231, speed: 30, streetName: "Mission St" },
  { latitude: 37.7685, longitude: -122.4230, speed: 30, streetName: "Mission St", instruction: "Pass Duboce Ave" },
  { latitude: 37.7690, longitude: -122.4229, speed: 30, streetName: "Mission St" },
  { latitude: 37.7694, longitude: -122.4228, speed: 25, streetName: "Mission St", instruction: "Approaching Market St" },
  { latitude: 37.7699, longitude: -122.4227, speed: 20, streetName: "Mission St" },
  { latitude: 37.7703, longitude: -122.4226, speed: 15, streetName: "Mission St", instruction: "Prepare to turn right" },
  { latitude: 37.7712, longitude: -122.4224, speed: 15, streetName: "Market St", instruction: "Turn right onto Market St" },
  { latitude: 37.7716, longitude: -122.4221, speed: 25, streetName: "Market St" },
  { latitude: 37.7721, longitude: -122.4218, speed: 30, streetName: "Market St", instruction: "Continue on Market St" },
  { latitude: 37.7725, longitude: -122.4215, speed: 30, streetName: "Market St" },
  { latitude: 37.7730, longitude: -122.4212, speed: 25, streetName: "Market St", instruction: "Approaching 8th St" },
  { latitude: 37.7734, longitude: -122.4209, speed: 30, streetName: "Market St" },
  { latitude: 37.7739, longitude: -122.4206, speed: 30, streetName: "Market St", instruction: "Pass 7th St" },
  { latitude: 37.7743, longitude: -122.4203, speed: 25, streetName: "Market St" },
  { latitude: 37.7748, longitude: -122.4200, speed: 20, streetName: "Market St", instruction: "Approaching destination" },
  { latitude: 37.7752, longitude: -122.4197, speed: 15, streetName: "Market St" },
  { latitude: 37.7757, longitude: -122.4194, speed: 10, streetName: "Market St", instruction: "Arriving at Market & 5th" }
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