import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  startMarker: {
    alignItems: 'center',
  },
  endMarker: {
    alignItems: 'center',
  },
  markerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    fontSize: 18,
  },
  markerStem: {
    width: 2,
    height: 10,
    backgroundColor: '#666',
  },
});
