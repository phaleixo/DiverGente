import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface BottomAudioBarProps {
    isRecording: boolean;
    recording: any; // Tipo para recording
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    pulseAnim: Animated.Value;
    startPulseAnimation: () => void;
    stopPulseAnimation: () => void;
}

const BottomAudioBar: React.FC<BottomAudioBarProps> = ({
    isRecording,
    recording,
    startRecording,
    stopRecording,
    pulseAnim,
    startPulseAnimation,
    stopPulseAnimation,
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    const styles = bottomBarStyles(isDarkMode);

    return (
        <View style={styles.container}>
            {isRecording && (
                <View style={styles.recordingMessageContainer}>
                    <Text style={styles.recordingText}>Gravando...</Text>
                </View>
            )}
            <TouchableOpacity
                onPress={recording ? stopRecording : startRecording}
                style={[
                    styles.recordButton,
                    { backgroundColor: recording ? 'red' : '#2786C6' },
                ]}
                onPressIn={startPulseAnimation} // Iniciar animação ao pressionar
                onPressOut={stopPulseAnimation} // Parar animação ao soltar
            >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Icon
                        name="microphone"
                        size={26}
                        color="white"
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const bottomBarStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        padding: 10,
        alignItems: 'center',
    },
    recordButton: {
        width: 60,
        height: 60,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingMessageContainer: {
        position: 'absolute',
        top: -40, 
        alignSelf: 'center',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 5,
    },
    recordingText: {
        color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
        fontSize: 16,
    },
});

export default BottomAudioBar;