import 'react-native';
import 'react-native-maps';

declare module 'react-native' {
  interface ViewProps {
    refs?: any;
  }
  
  interface TextProps {
    refs?: any;
  }
  
  interface ActivityIndicatorProps {
    refs?: any;
  }
}

declare module 'react-native-maps' {
  interface MapViewProps {
    refs?: any;
  }
  
  interface MarkerProps {
    refs?: any;
  }
  
  interface PolylineProps {
    refs?: any;
  }
}