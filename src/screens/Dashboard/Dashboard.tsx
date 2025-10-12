import React, { useEffect, useState, useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from 'react-native-maps';
import { Text, View, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import styles from './Dashboard.style';
import { routeService } from '../../services/route.service';
import { RoutePoint } from '../../types/route.types';
import { calculateDistance, calculateBearing } from '../../utils/geo.utils';

// Linear interpolate between two angles (degrees), shortest path
const lerpAngle = (a: number = 0, b: number = 0, t: number) => {
  let diff = (b - a + 540) % 360 - 180; // shortest signed difference
  return (a + diff * t + 360) % 360;
};

// Function to interpolate between two points
const interpolatePoint = (start: RoutePoint, end: RoutePoint, fraction: number) => ({
  latitude: start.latitude + (end.latitude - start.latitude) * fraction,
  longitude: start.longitude + (end.longitude - start.longitude) * fraction,
});

interface DashboardProps {
  routeInfo?: {
    startLocation: string;
    endLocation: string;
    startCoords: { lat: number; lng: number };
    endCoords: { lat: number; lng: number };
  } | null;
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ routeInfo, onBack }) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [carLocation, setCarLocation] = useState<RoutePoint | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<string>("");
  const [remainingDistance, setRemainingDistance] = useState<number>(0);
  const [eta, setEta] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const currentIndexRef = useRef(0);
  const mapRef = useRef<MapView | null>(null);
  const animationRef = useRef(new Animated.Value(0));

  // Fetch route on component mount
  useEffect(() => {
    const fetchRoute = async () => {
      setIsLoading(true);
      try {
        // Use provided route coordinates or fallback to default
        const start = routeInfo?.startCoords || { lat: 37.7647, lng: -122.4192 };
        const end = routeInfo?.endCoords || { lat: 37.7757, lng: -122.4194 };

        // Try to get real route
        const route = await routeService.fetchRoute(start.lat, start.lng, end.lat, end.lng);
        if (route && route.length > 0) {
          setRoutePoints(route);
          setCarLocation(route[0]);
        } else {
          // Fallback to mock route
          setRoutePoints([]);
          setCarLocation(null);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to mock route
        setRoutePoints([]);
        setCarLocation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [routeInfo]);




  // Function to animate car movement between two points using routePoints
  const animateToNextPoint = () => {
    if (!routePoints || routePoints.length === 0) {
      return;
    }

    if (currentIndexRef.current >= routePoints.length - 1) {
      setIsCompleted(true);
      return;
    }

    const start = routePoints[currentIndexRef.current];
    const end = routePoints[currentIndexRef.current + 1];

    if (!start || !end) {
      return;
    }

    // Calculate real-world distance in km and set a duration proportional to distance
    const distanceKm = calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);
    const minMs = 500; // minimum duration
    const maxMs = 5000; // maximum duration
    const speedFactor = 8000; // tune this to change visual speed
    const duration = Math.max(minMs, Math.min(maxMs, distanceKm * speedFactor));

    animationRef.current.setValue(0);
    Animated.timing(animationRef.current, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        currentIndexRef.current += 1;
        animateToNextPoint();
      }
    });
  };

  // Start animation when routePoints are available and set up listener
  useEffect(() => {
    if (!routePoints || routePoints.length === 0) {
      return;
    }
    const listener = animationRef.current.addListener(({ value }) => {
      if (currentIndexRef.current < routePoints.length - 1) {
        const start = routePoints[currentIndexRef.current];
        const end = routePoints[currentIndexRef.current + 1];
        if (!start || !end) return;

        const interp = interpolatePoint(start, end, value);
        const startRot = start.rotation ?? calculateBearing(start, end);
        const endRot = end.rotation ?? calculateBearing(start, end);
        const rotation = lerpAngle(startRot, endRot, value);

        const newLocation = {
          latitude: interp.latitude,
          longitude: interp.longitude,
          speed: (start.speed || 30) + ((end.speed || 30) - (start.speed || 30)) * value,
          streetName: start.streetName,
          instruction: start.instruction,
          distanceFromStart: start.distanceFromStart,
          estimatedTime: start.estimatedTime,
          rotation
        };

        setCarLocation(newLocation);

        // Update instruction if available
        if (start.instruction && value < 0.1) {
          setCurrentInstruction(start.instruction);
        }

        // Update remaining distance and ETA if available
        const last = routePoints[routePoints.length - 1];
        if (last && last.distanceFromStart != null) {
          const remainingDist = last.distanceFromStart - ((start.distanceFromStart || 0) + ((end.distanceFromStart || 0) - (start.distanceFromStart || 0)) * value);
          setRemainingDistance(remainingDist);

          const remainingTime = last.estimatedTime! - ((start.estimatedTime || 0) + ((end.estimatedTime || 0) - (start.estimatedTime || 0)) * value);
          const etaDate = new Date(Date.now() + remainingTime * 60 * 1000);
          setEta(etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }

        // Smoothly update map center
        mapRef.current?.animateToRegion({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }, 0);
      }
    });

    // Reset index and start the animation
    currentIndexRef.current = 0;
    animationRef.current.setValue(0);
    animateToNextPoint();

    return () => {
      animationRef.current.removeListener(listener);
    };
  }, [routePoints]);

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Routes</Text>
        </TouchableOpacity>
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      ) : (
        <>
          <View style={styles.infoContainer}>
            {routeInfo && (
              <View style={styles.routeInfoBanner}>
                <Text style={styles.routeInfoText}>
                  📍 {routeInfo.startLocation} → {routeInfo.endLocation}
                </Text>
              </View>
            )}
            <Text style={styles.title}>
              {isCompleted ? 'Destination Reached!' : 'Live Vehicle Tracking'}
            </Text>
            {currentInstruction && (
              <Text style={styles.instruction}>{currentInstruction}</Text>
            )}
            {carLocation && (
              <>
                <Text style={styles.speed}>
                  Speed: {Math.round(carLocation.speed)} km/h
                </Text>
                <Text style={styles.street}>
                  On: {carLocation.streetName || 'Calculating...'}
                </Text>
              </>
            )}
            {!isCompleted && (
              <>
                <Text style={styles.eta}>ETA: {eta || 'Calculating...'}</Text>
                <Text style={styles.distance}>
                  Distance remaining: {remainingDistance.toFixed(1)} km
                </Text>
              </>
            )}
          </View>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: routePoints[0]?.latitude || 37.7647,
              longitude: routePoints[0]?.longitude || -122.4192,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            showsTraffic
          >
            {/* Draw the route path */}
            {routePoints.length > 0 && (
              <>
                {/* Main route polyline */}
                <Polyline
                  coordinates={routePoints.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
                  strokeColor="#0066ff"
                  strokeWidth={4}
                  geodesic={true}
                  lineDashPattern={[0]}
                  lineCap="round"
                  lineJoin="round"
                  zIndex={1}
                />
                {/* Route outline for better visibility */}
                <Polyline
                  coordinates={routePoints.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
                  strokeColor="#ffffff"
                  strokeWidth={6}
                  geodesic={true}
                  zIndex={0}
                />
              </>
            )}

            {/* Show the start and end markers */}
            {routePoints.length > 0 && (
              <>
                <Marker
                  coordinate={routePoints[0]}
                  title="Start"
                  pinColor="green"
                />
                <Marker
                  coordinate={routePoints[routePoints.length - 1]}
                  title="Destination"
                  pinColor="red"
                />
              </>
            )}

            {/* Moving vehicle marker */}
            {carLocation && (
              <Marker
                coordinate={{ latitude: carLocation.latitude, longitude: carLocation.longitude }}
                title="Vehicle"
                description="Vehicle in transit"
                flat={true}
                anchor={{ x: 0.5, y: 0.5 }}
                rotation={carLocation.rotation ?? 0}
              >
                <MaterialIcons name="directions-car-filled" color="#ff0000" size={20} />
              </Marker>
            )}
          </MapView>
        </>
      )}
    </View>
  );
};

export default Dashboard;