import React, { useRef } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { View, ActivityIndicator, Text } from 'react-native';
import styles from './Dashboard.style';
import { useRouteData } from '../../hooks/useRouteData';
import { useRouteAnimation } from '../../hooks/useRouteAnimation';
import { usePulseAnimation } from '../../hooks/usePulseAnimation';
import { VehicleMarker } from '../../components/VehicleMarker/VehicleMarker';
import { RoutePolyline } from '../../components/RoutePolyline/RoutePolyline';
import { RouteMarkers } from '../../components/RouteMarkers/RouteMarkers';
import { TrackingInfo } from '../../components/TrackingInfo/TrackingInfo';
import { customMapStyle, DEFAULT_MAP_REGION } from '../../constants/mapStyles';

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
  const mapRef = useRef<MapView | null>(null);
  
  // Fetch route data
  const { routePoints, isLoading } = useRouteData(routeInfo);
  
  // Pulse animation for vehicle marker
  const pulseAnim = usePulseAnimation();
  
  // Animate vehicle along route
  const { carLocation, isCompleted, metrics } = useRouteAnimation({
    routePoints,
    onLocationUpdate: (location) => {
      // Update map camera to follow vehicle
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 0);
    },
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      ) : (
        <>
          <TrackingInfo
            routeInfo={routeInfo}
            isCompleted={isCompleted}
            currentInstruction={metrics.currentInstruction}
            carLocation={carLocation}
            eta={metrics.eta}
            remainingDistance={metrics.remainingDistance}
            onBack={onBack}
          />
          
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: routePoints[0]?.latitude || DEFAULT_MAP_REGION.latitude,
              longitude: routePoints[0]?.longitude || DEFAULT_MAP_REGION.longitude,
              latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
              longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
            }}
            showsTraffic={false}
            showsBuildings={false}
            showsIndoors={false}
            showsPointsOfInterests={false}
            customMapStyle={customMapStyle}
          >
            <RoutePolyline routePoints={routePoints} />
            
            {routePoints.length > 0 && (
              <RouteMarkers
                startPoint={routePoints[0]}
                endPoint={routePoints[routePoints.length - 1]}
                startLocation={routeInfo?.startLocation}
                endLocation={routeInfo?.endLocation}
              />
            )}

            {carLocation && (
              <VehicleMarker location={carLocation} pulseAnim={pulseAnim} />
            )}
          </MapView>
        </>
      )}
    </View>
  );
};

export default Dashboard;