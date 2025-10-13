import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface UsePulseAnimationConfig {
  minValue?: number;
  maxValue?: number;
  duration?: number;
}

export const usePulseAnimation = (config: UsePulseAnimationConfig = {}) => {
  const {
    minValue = 1,
    maxValue = 1.2,
    duration = 1000,
  } = config;

  const pulseAnim = useRef(new Animated.Value(minValue)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minValue,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => {
      pulse.stop();
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim, minValue, maxValue, duration]);

  return pulseAnim;
};
