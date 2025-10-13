import React from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { RoutePoint } from '../../types/route.types';
import { styles } from './RouteMarkers.style';

interface RouteMarkersProps {
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  startLocation?: string;
  endLocation?: string;
}

export const RouteMarkers: React.FC<RouteMarkersProps> = ({
  startPoint,
  endPoint,
  startLocation,
  endLocation,
}) => {
  return (
    <>
      {/* Start Marker */}
      <Marker
        coordinate={startPoint}
        title="Start Location"
        description={startLocation || "Starting point"}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={styles.startMarker}>
          <View style={styles.markerPin}>
            <Text style={styles.markerText}>🟢</Text>
          </View>
          <View style={styles.markerStem} />
        </View>
      </Marker>

      {/* End Marker */}
      <Marker
        coordinate={endPoint}
        title="Destination"
        description={endLocation || "End point"}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={styles.endMarker}>
          <View style={styles.markerPin}>
            <Text style={styles.markerText}>🏁</Text>
          </View>
          <View style={styles.markerStem} />
        </View>
      </Marker>
    </>
  );
};
