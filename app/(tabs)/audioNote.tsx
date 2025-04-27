import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    useColorScheme,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import BottomAudioBar from '@/components/BottomAudioBar';

interface AudioEntry {
    id: number;
    uri: string;
    date: string;
    time: string;
}

interface PlaybackStatus {
    duration: number;
    position: number;
    isPlaying: boolean;
}

const AudioNoteScreen = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioEntries, setAudioEntries] = useState<AudioEntry[]>([]);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playbackStatus, setPlaybackStatus] = useState<{ [key: number]: PlaybackStatus }>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [audioToDeleteId, setAudioToDeleteId] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';
    const styles = dynamicStyles(isDarkMode);
    const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        loadAudioEntries();

        return () => {
            isMounted.current = false;
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
                startPulseAnimation();
            } else {
                alert('Permissão para acessar o microfone é necessária.');
            }
        } catch (err) {
            console.error('Falha ao iniciar gravação', err);
        }
    };

    const stopRecording = async () => {
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                
                if (uri) {
                    const now = new Date();
                    const newEntry: AudioEntry = {
                        id: Date.now(),
                        uri,
                        date: now.toLocaleDateString(),
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    
                    const updatedEntries = [newEntry, ...audioEntries];
                    setAudioEntries(updatedEntries);
                    await AsyncStorage.setItem('audioNotes', JSON.stringify(updatedEntries));
                    
                    updatePlaybackStatus(newEntry.id, {
                        duration: 0,
                        position: 0,
                        isPlaying: false
                    });
                }
            } catch (error) {
                console.error('Erro ao parar gravação', error);
            } finally {
                setRecording(null);
                setIsRecording(false);
                stopPulseAnimation();
            }
        }
    };

    const loadAudioEntries = async () => {
        try {
            const data = await AsyncStorage.getItem('audioNotes');
            if (data) {
                const parsedEntries = JSON.parse(data);
                setAudioEntries(parsedEntries);
                
                const initialPlaybackStatus = parsedEntries.reduce((acc: any, entry: AudioEntry) => {
                    acc[entry.id] = {
                        duration: 0,
                        position: 0,
                        isPlaying: false
                    };
                    return acc;
                }, {});
                
                setPlaybackStatus(initialPlaybackStatus);
            }
        } catch (error) {
            console.error('Erro ao carregar áudios', error);
        }
    };

    const deleteAudioEntry = async (id: number) => {
        try {
            if (playingId === id && sound) {
                await sound.stopAsync();
                setPlayingId(null);
            }
            
            const updatedEntries = audioEntries.filter(entry => entry.id !== id);
            setAudioEntries(updatedEntries);
            await AsyncStorage.setItem('audioNotes', JSON.stringify(updatedEntries));
            
            const { [id]: _, ...rest } = playbackStatus;
            setPlaybackStatus(rest);
            
            setIsModalVisible(false);
        } catch (error) {
            console.error('Erro ao deletar áudio', error);
        }
    };

    const confirmDelete = (id: number) => {
        setAudioToDeleteId(id);
        setIsModalVisible(true);
    };

    const playPauseAudio = async (id: number, uri: string) => {
        if (playingId === id && sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    updatePlaybackStatus(id, {
                        position: status.positionMillis,
                        isPlaying: false
                    });
                }
                await sound.pauseAsync();
                setPlayingId(null);
                return;
            } catch (error) {
                console.error('Erro ao pausar áudio', error);
            }
        }

        if (sound) {
            await sound.unloadAsync();
        }

        setLoadingAudioId(id);

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                {
                    shouldPlay: false,
                    positionMillis: playbackStatus[id]?.position || 0,
                    isLooping: false,
                },
                (status) => {
                    if (!isMounted.current) return;
                    
                    if (status.isLoaded) {
                        updatePlaybackStatus(id, {
                            duration: status.durationMillis,
                            position: status.positionMillis,
                            isPlaying: status.isPlaying
                        });

                        if (status.didJustFinish) {
                            updatePlaybackStatus(id, {
                                position: 0,
                                isPlaying: false
                            });
                            setPlayingId(null);
                            
                            // Atualização suave para evitar flickering
                            requestAnimationFrame(() => {
                                if (isMounted.current) {
                                    updatePlaybackStatus(id, {
                                        position: 0,
                                        isPlaying: false
                                    });
                                }
                            });
                        }
                    }
                }
            );

            setSound(newSound);
            setPlayingId(id);
            await newSound.playAsync();
        } catch (error) {
            console.error('Erro ao reproduzir áudio', error);
            if (isMounted.current) {
                setPlayingId(null);
            }
        } finally {
            if (isMounted.current) {
                setLoadingAudioId(null);
            }
        }
    };

    const updatePlaybackStatus = (id: number, updates: Partial<PlaybackStatus>) => {
        setPlaybackStatus(prev => ({
            ...prev,
            [id]: {
                duration: prev[id]?.duration || 0,
                position: prev[id]?.position || 0,
                isPlaying: prev[id]?.isPlaying || false,
                ...updates
            }
        }));
    };

    const formatTime = (millis: number) => {
        if (!millis && millis !== 0) return '0:00';
        
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.length === 1 ? '0' : ''}${seconds}`;
    };

    const updatePlaybackPosition = async (id: number, value: number) => {
        if (sound && playingId === id && playbackStatus[id]?.duration) {
            const newPosition = value * playbackStatus[id].duration;
            try {
                await sound.setPositionAsync(newPosition);
                updatePlaybackStatus(id, {
                    position: newPosition
                });
            } catch (error) {
                console.error('Erro ao atualizar posição', error);
            }
        }
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Áudio</Text>
            
            <View style={styles.bodyContainer}>
                {audioEntries.length === 0 ? (
                    <Text style={styles.emptyMessage}>Nenhum áudio gravado ainda</Text>
                ) : (
                    <FlatList
                        data={audioEntries}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.audioEntryContainer}>
                                <Text style={styles.dateText}>{item.date} {item.time}</Text>
                                
                                <View style={styles.audioControls}>
                                    <TouchableOpacity
                                        onPress={() => playPauseAudio(item.id, item.uri)}
                                        style={styles.controlButton}
                                        disabled={loadingAudioId === item.id}
                                    >
                                        {loadingAudioId === item.id ? (
                                            <ActivityIndicator size="small" color={isDarkMode ? '#FFFFFF' : '#000000'} />
                                        ) : (
                                            <Icon
                                                name={playingId === item.id ? 'pause' : 'play'}
                                                size={22}
                                                color={isDarkMode ? '#FFFFFF' : '#000000'}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    
                                    <Slider
                                        style={styles.progressBar}
                                        minimumValue={0}
                                        maximumValue={1}
                                        value={
                                            playbackStatus[item.id]?.duration > 0 
                                                ? playbackStatus[item.id]?.position / playbackStatus[item.id]?.duration 
                                                : 0
                                        }
                                        onValueChange={(value) => {
                                            const newPosition = value * (playbackStatus[item.id]?.duration || 0);
                                            updatePlaybackStatus(item.id, {
                                                position: newPosition
                                            });
                                        }}
                                        onSlidingComplete={(value) => updatePlaybackPosition(item.id, value)}
                                        thumbTintColor={isDarkMode ? '#FFFFFF' : '#000000'}
                                        minimumTrackTintColor={isDarkMode ? '#FFFFFF' : '#000000'}
                                        maximumTrackTintColor={isDarkMode ? '#888888' : '#cccccc'}
                                        disabled={!playbackStatus[item.id]?.duration}
                                    />
                                    
                                    <TouchableOpacity
                                        onPress={() => confirmDelete(item.id)}
                                        style={styles.deleteButton}
                                    >
                                        <Icon name="trash-2" size={20} color={isDarkMode ? '#FFFFFF' : '#333333'} />
                                        <Text style={styles.deleteButtonText}>Excluir</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={styles.playbackText}>
                                    {formatTime(playbackStatus[item.id]?.position || 0)} / {formatTime(playbackStatus[item.id]?.duration || 0)}
                                </Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <Modal
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Tem certeza que deseja excluir este áudio?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={() => audioToDeleteId && deleteAudioEntry(audioToDeleteId)}
                            >
                                <Text style={styles.modalButtonText}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomAudioBar
                isRecording={isRecording}
                recording={recording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                pulseAnim={pulseAnim}
                startPulseAnimation={startPulseAnimation}
                stopPulseAnimation={stopPulseAnimation}
            />
        </View>
    );
};

const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
    },
    bodyContainer: {
        flex: 1,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        marginBottom: 15,
        marginTop: 10,
        padding: 20,
        color: isDarkMode ? '#FFFFFF' : '#2786C6',
        fontWeight: 'bold',
        marginLeft:-12,
        
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
        color: isDarkMode ? '#94a3b8' : '#64748b',
    },
    audioEntryContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 15,
        padding: 15,
        borderRadius: 15,
        backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
        elevation: 2,
        shadowColor: isDarkMode ? '#000' : '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    dateText: {
        fontSize: 16,
        color: isDarkMode ? '#FFFFFF' : '#333',
        marginBottom: 10,
    },
    audioControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5,
    },
    controlButton: {
        padding: 8,
        width: 40,
        alignItems: 'center',
    },
    deleteButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        backgroundColor: isDarkMode ? '#060606' : '#F5F5F5',
    },
    deleteButtonText: {
        marginLeft: 5,
        color: isDarkMode ? '#FFFFFF' : '#475569',
        fontWeight: 'bold',
    },
    playbackText: {
        fontSize: 14,
        color: isDarkMode ? '#CCCCCC' : '#666666',
        alignSelf: 'flex-end',
    },
    progressBar: {
        flex: 1,
        height: 40,
        marginHorizontal: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 12,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: isDarkMode ? '#333' : '#ccc',
    },
    modalButtonConfirm: {
        backgroundColor: '#ff4444',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AudioNoteScreen;