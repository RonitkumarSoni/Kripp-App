import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface CustomSpinnerProps {
    size?: number;
    color?: string;
}

export default function CustomSpinner({ size = 36, color = '#64748b' }: CustomSpinnerProps) {
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        );
        animation.start();

        return () => animation.stop();
    }, [spinAnim]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spokes = Array.from({ length: 12 });
    const radius = size / 2;
    const spokeWidth = Math.max(2, size * 0.08);
    const spokeHeight = Math.max(6, size * 0.26);

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
                style={{
                    width: size,
                    height: size,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ rotate: spin }],
                }}
            >
                {spokes.map((_, i) => {
                    const angle = i * 30;
                    const opacity = Math.max(0.12, 1 - (i * 0.075));
                    return (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                width: spokeWidth,
                                height: spokeHeight,
                                backgroundColor: color,
                                borderRadius: spokeWidth / 2,
                                opacity: opacity,
                                transform: [
                                    { rotate: `${angle}deg` },
                                    { translateY: -(radius - spokeHeight / 2) },
                                ],
                            }}
                        />
                    );
                })}
            </Animated.View>
        </View>
    );
}
