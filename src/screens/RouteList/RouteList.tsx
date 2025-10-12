import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { styles } from './RouteList.style';

export interface RouteItem {
  id: string;
  startLocation: string;
  endLocation: string;
  startCoords: { lat: number; lng: number };
  endCoords: { lat: number; lng: number };
  liveTrackingAvailable: boolean;
  distance?: string;
  estimatedTime?: string;
}

const mockRoutes: RouteItem[] = [
  {
    id: '1',
    startLocation: 'Mission & 16th St, San Francisco',
    endLocation: 'Market & 5th St, Downtown SF',
    startCoords: { lat: 37.7647, lng: -122.4192 },
    endCoords: { lat: 37.7757, lng: -122.4194 },
    liveTrackingAvailable: true,
    distance: '2.5 km',
    estimatedTime: '8 min'
  },
  {
    id: '2',
    startLocation: 'Golden Gate Park, SF',
    endLocation: 'Fisherman\'s Wharf, SF',
    startCoords: { lat: 37.7694, lng: -122.4862 },
    endCoords: { lat: 37.8080, lng: -122.4177 },
    liveTrackingAvailable: false,
    distance: '6.2 km',
    estimatedTime: '15 min'
  },
  {
    id: '3',
    startLocation: 'SFO Airport Terminal 1',
    endLocation: 'Union Square, SF',
    startCoords: { lat: 37.6213, lng: -122.3790 },
    endCoords: { lat: 37.7880, lng: -122.4074 },
    liveTrackingAvailable: false,
    distance: '21 km',
    estimatedTime: '28 min'
  },
  {
    id: '4',
    startLocation: 'Embarcadero Station',
    endLocation: 'AT&T Park',
    startCoords: { lat: 37.7929, lng: -122.3968 },
    endCoords: { lat: 37.7786, lng: -122.3893 },
    liveTrackingAvailable: true,
    distance: '1.8 km',
    estimatedTime: '6 min'
  },
  {
    id: '5',
    startLocation: 'Castro District',
    endLocation: 'Haight-Ashbury',
    startCoords: { lat: 37.7609, lng: -122.4350 },
    endCoords: { lat: 37.7699, lng: -122.4469 },
    liveTrackingAvailable: false,
    distance: '1.5 km',
    estimatedTime: '5 min'
  }
];

interface RouteListProps {
  onNavigateToDashboard?: (route: RouteItem) => void;
}

const RouteList: React.FC<RouteListProps> = ({ onNavigateToDashboard }) => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handleRoutePress = (route: RouteItem) => {
    if (route.liveTrackingAvailable) {
      setSelectedRoute(route.id);
      if (onNavigateToDashboard) {
        onNavigateToDashboard(route);
      }
    }
  };

  const renderRouteCard = ({ item }: { item: RouteItem }) => {
    const isDisabled = !item.liveTrackingAvailable;
    
    return (
      <TouchableOpacity
        style={[
          styles.routeCard,
          isDisabled && styles.routeCardDisabled,
          selectedRoute === item.id && styles.routeCardSelected
        ]}
        onPress={() => handleRoutePress(item)}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <View style={styles.routeHeader}>
          <Text style={[styles.routeId, isDisabled && styles.textDisabled]}>
            Route {item.id}
          </Text>
          <View style={[
            styles.statusBadge,
            item.liveTrackingAvailable ? styles.statusAvailable : styles.statusUnavailable
          ]}>
            <Text style={[
              styles.statusText,
              item.liveTrackingAvailable ? styles.statusTextAvailable : styles.statusTextUnavailable
            ]}>
              {item.liveTrackingAvailable ? '🟢 Live Tracking' : '⚫ Unavailable'}
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.startIcon}>📍</Text>
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Start</Text>
              <Text style={[styles.locationText, isDisabled && styles.textDisabled]}>
                {item.startLocation}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.endIcon}>🏁</Text>
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={[styles.locationText, isDisabled && styles.textDisabled]}>
                {item.endLocation}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.routeFooter}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={[styles.infoValue, isDisabled && styles.textDisabled]}>
              {item.distance}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Est. Time</Text>
            <Text style={[styles.infoValue, isDisabled && styles.textDisabled]}>
              {item.estimatedTime}
            </Text>
          </View>
        </View>

        {item.liveTrackingAvailable && (
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Live Tracking →</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Routes</Text>
        <Text style={styles.headerSubtitle}>
          Select a route with live tracking to view real-time updates
        </Text>
      </View>
      
      <FlatList
        data={mockRoutes}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default RouteList;
