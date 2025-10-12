/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Dashboard } from './src';
import RouteList, { RouteItem } from './src/screens/RouteList/RouteList';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

type AppContentProps = {
  isDarkMode: boolean;
};

function AppContent({ isDarkMode }: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<'list' | 'dashboard'>('list');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const handleNavigateToDashboard = (route: RouteItem) => {
    setSelectedRoute(route);
    setCurrentScreen('dashboard');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedRoute(null);
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'list' ? (
        <RouteList onNavigateToDashboard={handleNavigateToDashboard} />
      ) : (
        <View
          style={{
            backgroundColor: isDarkMode ? 'black' : 'white',
            paddingTop: safeAreaInsets.top,
            paddingLeft: safeAreaInsets.left,
            paddingRight: safeAreaInsets.right,
            flex: 1,
          }}>
          <Dashboard 
            routeInfo={selectedRoute}
            onBack={handleBackToList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
