import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RoutePoint } from '../../types/route.types';
import { styles } from './TrackingInfo.style';

interface RouteInfo {
  startLocation: string;
  endLocation: string;
}

interface TrackingInfoProps {
  routeInfo?: RouteInfo | null;
  isCompleted: boolean;
  currentInstruction?: string;
  carLocation?: RoutePoint | null;
  eta?: string;
  remainingDistance?: number;
  onBack?: () => void;
}

export const TrackingInfo: React.FC<TrackingInfoProps> = ({
  routeInfo,
  isCompleted,
  currentInstruction,
  carLocation,
  eta,
  remainingDistance,
  onBack,
}) => {
  return (
    <>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Routes</Text>
        </TouchableOpacity>
      )}
      
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
              Distance remaining: {remainingDistance?.toFixed(1)} km
            </Text>
          </>
        )}
      </View>
    </>
  );
};
