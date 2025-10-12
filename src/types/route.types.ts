export interface RoutePoint {
  latitude: number;
  longitude: number;
  speed: number;
  instruction?: string;
  streetName: string;
  distanceFromStart?: number;
  estimatedTime?: number;
  rotation?: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  start: Location;
  end: Location;
}

export interface RouteResponse {
  status: string;
  routes?: any[];
  error_message?: string;
}