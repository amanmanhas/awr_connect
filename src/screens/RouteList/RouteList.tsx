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
    startLocation: 'AWR Office, Business Bay, Dubai',
    endLocation: 'Burj Khalifa, Downtown Dubai',
    startCoords: { lat: 25.1879, lng: 55.2744 },
    endCoords: { lat: 25.1972, lng: 55.2744 },
    liveTrackingAvailable: true,
    distance: '1.2 km',
    estimatedTime: '4 min'
  },
  {
    id: '2',
    startLocation: 'Dubai Mall, Downtown',
    endLocation: 'Mall of the Emirates',
    startCoords: { lat: 25.1972, lng: 55.2796 },
    endCoords: { lat: 25.1181, lng: 55.2008 },
    liveTrackingAvailable: false,
    distance: '12.5 km',
    estimatedTime: '18 min'
  },
  {
    id: '3',
    startLocation: 'Dubai International Airport',
    endLocation: 'Palm Jumeirah',
    startCoords: { lat: 25.2532, lng: 55.3657 },
    endCoords: { lat: 25.1124, lng: 55.1390 },
    liveTrackingAvailable: false,
    distance: '35 km',
    estimatedTime: '32 min'
  },
  {
    id: '4',
    startLocation: 'Dubai Marina',
    endLocation: 'Jumeirah Beach',
    startCoords: { lat: 25.0804, lng: 55.1398 },
    endCoords: { lat: 25.2321, lng: 55.2709 },
    liveTrackingAvailable: true,
    distance: '19.5 km',
    estimatedTime: '24 min'
  },
  {
    id: '5',
    startLocation: 'Deira City Centre',
    endLocation: 'Gold Souk, Deira',
    startCoords: { lat: 25.2524, lng: 55.3309 },
    endCoords: { lat: 25.2701, lng: 55.3001 },
    liveTrackingAvailable: false,
    distance: '4.8 km',
    estimatedTime: '12 min'
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
