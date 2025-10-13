import React from 'react';
import { View, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { RoutePoint } from '../../types/route.types';
import { styles } from './VehicleMarker.style';

interface VehicleMarkerProps {
  location: RoutePoint;
  pulseAnim: Animated.Value;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({ 
  location, 
  pulseAnim 
}) => {
  return (
    <Marker
      coordinate={{ 
        latitude: location.latitude, 
        longitude: location.longitude 
      }}
      title="Vehicle"
      description="Vehicle in transit"
      flat={true}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={location.rotation ?? 0}
      zIndex={100}
    >
      <View style={styles.vehicleMarker}>
        <Animated.View 
          style={[
            styles.vehiclePulse, 
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.3, 0]
              })
            }
          ]} 
        />
        <View style={styles.vehicleContainer}>
          <View style={styles.directionArrow}>
            <View style={styles.arrowTip} />
          </View>
          <View style={styles.vehicleDirection}>
            <View style={styles.carBody}>
              {/* Truck Cabin (Front) */}
              <View style={styles.carFront}>
                <View style={styles.headlightsContainer}>
                  <View style={styles.headlight} />
                  <View style={styles.headlight} />
                </View>
              </View>
              {/* Truck Cabin Window */}
              <View style={styles.carMain}>
                <View style={styles.carWindow} />
              </View>
              {/* Truck Cargo/Container (Back) */}
              <View style={styles.carBack}>
                <View style={styles.cargoPattern}>
                  <View style={styles.cargoLine} />
                  <View style={styles.cargoLine} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Marker>
  );
};
