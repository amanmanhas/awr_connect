import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { RoutePoint } from '../types/route.types';
import { calculateDistance, calculateBearing, lerpAngle, interpolatePoint } from '../utils/geo.utils';

interface AnimationMetrics {
  currentInstruction: string;
  remainingDistance: number;
  eta: string;
}

interface UseRouteAnimationProps {
  routePoints: RoutePoint[];
  onLocationUpdate?: (location: RoutePoint) => void;
  onComplete?: () => void;
}

export const useRouteAnimation = ({ 
  routePoints, 
  onLocationUpdate,
  onComplete 
}: UseRouteAnimationProps) => {
  const [carLocation, setCarLocation] = useState<RoutePoint | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [metrics, setMetrics] = useState<AnimationMetrics>({
    currentInstruction: '',
    remainingDistance: 0,
    eta: ''
  });

  const currentIndexRef = useRef(0);
  const animationRef = useRef(new Animated.Value(0));

  const animateToNextPoint = () => {
    if (!routePoints || routePoints.length === 0) {
      return;
    }

    if (currentIndexRef.current >= routePoints.length - 1) {
      setIsCompleted(true);
      onComplete?.();
      return;
    }

    const start = routePoints[currentIndexRef.current];
    const end = routePoints[currentIndexRef.current + 1];

    if (!start || !end) {
      return;
    }

    // Calculate real-world distance in km and set a duration proportional to distance
    const distanceKm = calculateDistance(
      start.latitude, 
      start.longitude, 
      end.latitude, 
      end.longitude
    );
    
    const minMs = 500;
    const maxMs = 5000;
    const speedFactor = 8000;
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

        const newLocation: RoutePoint = {
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
        onLocationUpdate?.(newLocation);

        // Update instruction
        if (start.instruction && value < 0.1) {
          setMetrics(prev => ({ ...prev, currentInstruction: start.instruction || '' }));
        }

        // Update remaining distance and ETA
        const last = routePoints[routePoints.length - 1];
        if (last && last.distanceFromStart != null) {
          const currentDist = (start.distanceFromStart || 0) + 
            ((end.distanceFromStart || 0) - (start.distanceFromStart || 0)) * value;
          const remainingDist = last.distanceFromStart - currentDist;
          
          const currentTime = (start.estimatedTime || 0) + 
            ((end.estimatedTime || 0) - (start.estimatedTime || 0)) * value;
          const remainingTime = last.estimatedTime! - currentTime;
          
          const etaDate = new Date(Date.now() + remainingTime * 60 * 1000);
          const etaString = etaDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          setMetrics(prev => ({
            ...prev,
            remainingDistance: remainingDist,
            eta: etaString
          }));
        }
      }
    });

    // Reset and start animation
    currentIndexRef.current = 0;
    animationRef.current.setValue(0);
    animateToNextPoint();

    return () => {
      animationRef.current.removeListener(listener);
      animationRef.current.stopAnimation();
    };
  }, [routePoints]);

  return {
    carLocation,
    isCompleted,
    metrics,
  };
};
