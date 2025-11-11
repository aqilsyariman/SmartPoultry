import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { Svg, Path, Line } from 'react-native-svg';

const ESP_IP = 'http://172.20.10.2'; // Replace with your ESP32's IP

interface LogEntry {
  id: string;
  text: string;
}

type ActivityType = 'water' | 'feed' | 'system';

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
}

const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString();
};

const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const PoultryMonitor = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [temperature, setTemperature] = useState('N/A');
  const [humidity, setHumidity] = useState('N/A');
  const [motion, setMotion] = useState('N/A');
  const [rain, setRain] = useState('N/A');
  const [light, setLight] = useState('N/A');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '0', text: 'System initialized' },
  ]);
  const [feedLevel, setFeedLevel] = useState<number>(75);
  const [waterLevel, setWaterLevel] = useState<number>(0);
  const [activityLog, setActivityLog] = useState<Activity[]>([
    {
      id: generateUniqueId(),
      type: 'water',
      message: 'Water level at 60%',
      time: getCurrentTimestamp(),
    },
    {
      id: generateUniqueId(),
      type: 'feed',
      message: 'Feed dispensed (200g)',
      time: getCurrentTimestamp(),
    },
    {
      id: generateUniqueId(),
      type: 'system',
      message: `System Status: ${isConnected ? 'Online' : 'Offline'}`,
      time: getCurrentTimestamp(),
    },
  ]);
  const [isDispensingFeed, setIsDispensingFeed] = useState<boolean>(false);
  const [isFillingWater, setIsFillingWater] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fadeAnim = new Animated.Value(0);
  const isConnectedRef = useRef<boolean>(false);

  const colors = {
    background: '#f0f4f8',
    card: '#ffffff',
    text: '#1f2937',
    secondaryText: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#10b981',
    danger: '#ef4444',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
  };

  useEffect(() => {
    if (notification) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setNotification(null));
    }
  }, [notification, fadeAnim]);

  useEffect(() => {
    isConnectedRef.current = isConnected ?? false;
  }, [isConnected]);

  const addLog = (message: string) => {
    const timestamp = getCurrentTimestamp();
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: `${timestamp}: ${message}`,
    };
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 19)]);
  };

  const checkESPConnection = async () => {
    if (isConnectedRef.current) return;

    setIsLoading(true);
    addLog('Attempting to connect to ESP32...');
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await axios.get(`${ESP_IP}/ping`, { timeout: 10000 });
        if (response.status === 200) {
          setIsConnected(true);
          addLog('✅ Connection successful!');
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        attempt++;
        addLog(`❌ Ping attempt ${attempt} failed: ${error.message}`);
        if (attempt === maxRetries) {
          setIsConnected(false);
          addLog('❌ Connection failed after retries');
          setIsLoading(false);
        }
      }
    }
  };

  // ✅ Final useEffect — Only one connection attempt, no auto reconnecting
  useEffect(() => {
    addLog('System ready. Connect to ESP32 to begin.');
    checkESPConnection();

    const sensorInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${ESP_IP}/sensors`, { timeout: 10000 });
        const { temperature, humidity, motion, rain, light} = response.data;
        setLight(light ?? 'N/A');
        setTemperature(temperature ?? 'N/A');
        setHumidity(humidity ?? 'N/A');
        setMotion(motion ?? 'N/A');
        setRain(rain ?? 'N/A');
      } catch (error: any) {
        // Optional: Log error if you want
        // addLog(`❌ Sensor fetch failed: ${error.message}`);
      }
    }, 1000);

    return () => {
      clearInterval(sensorInterval);
    };
  }, []);
  
  const dispenseFeed = (): void => {
    setIsDispensingFeed(true);
    setTimeout(() => {
      setIsDispensingFeed(false);
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newActivity: Activity = {
        id: generateUniqueId(),
        type: 'feed',
        message: 'Feed dispensed (200g)',
        time: `Today, ${timeString}`,
      };
      setActivityLog([newActivity, ...activityLog]);
      setNotification('Feed dispensed successfully!');
      setFeedLevel(prev => Math.max(prev - 10, 0));
    }, 2000);
  };

  const refillWater = (): void => {
    setIsFillingWater(true);
    setTimeout(() => {
      setIsFillingWater(false);
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newActivity: Activity = {
        id: generateUniqueId(),
        type: 'water',
        message: 'Water refilled',
        time: `Today, ${timeString}`,
      };
      setActivityLog([newActivity, ...activityLog]);
      setNotification('Water refilled successfully!');
      setWaterLevel(100);
    }, 2000);
  };

  const renderActivityIcon = (type: ActivityType): React.ReactElement => {
    switch (type) {
      case 'water':
        return (
          <View style={[styles.activityIcon, { backgroundColor: '#EBF5FF' }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'feed':
        return (
          <View style={[styles.activityIcon, { backgroundColor: '#FEF3C7' }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="6"
                y1="1"
                x2="6"
                y2="4"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="10"
                y1="1"
                x2="10"
                y2="4"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="14"
                y1="1"
                x2="14"
                y2="4"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'system':
        return (
          <View style={[styles.activityIcon, { backgroundColor: '#DCFCE7' }]}>
            {isConnected ? (
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M22 4L12 14.01l-3-3"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ) : (
              <Svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                fill="none"
              >
                <Path
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
        );
      default:
        return <View />;
    }
  };

  const ConnectionStatus = () => {
    let message = 'Checking connection...';
    let bgColor = colors.gray100;
    let textColor = colors.gray500;
    let iconName = 'sync';

    if (isConnected === true) {
      message = 'ESP32 is connected!';
      bgColor = '#dcfce7';
      textColor = '#16a34a';
      iconName = 'checkmark-circle';
    } else if (isConnected === false) {
      message = 'ESP32 is not connected.';
      bgColor = '#fee2e2';
      textColor = '#dc2626';
      iconName = 'close-circle';
    }

    return (
      <View style={[styles.connectionStatus, { backgroundColor: bgColor }]}>
        {isConnected === null ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.statusIcon}
          />
        ) : (
          <Ionicons
            name={iconName}
            size={20}
            color={textColor}
            style={styles.statusIcon}
          />
        )}
        <Text style={[styles.connectionText, { color: textColor }]}>
          {message}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Poultry Monitor</Text>
            <Text style={styles.subtitle}>Coop Management System</Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ConnectionStatus />
          
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isLoading ? colors.gray400 : colors.primary },
            ]}
            onPress={checkESPConnection}
            disabled={isLoading}
          >
            <Ionicons
              name="wifi"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isLoading ? 'Connecting...' : 'Connect to ESP32'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.controlRow, { backgroundColor: colors.gray100 }]}>
            
            
          </View>
        </View>
        <View style={styles.card}><View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isConnected ? '#22C55E' : '#EF4444' },
              ]}
            />
            <Text style={styles.cardTitle}>
              System Status: {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
          </View>
        <View style={styles.card}>
          
          <View style={styles.statusGrid}>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Light</Text>
              <View style={styles.statusValue}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.valueText}>{light}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Temperature</Text>
              <View style={styles.statusValue}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.valueText}>{temperature}</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Humidity</Text>
              <View style={styles.statusValue}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.valueText}>{humidity}</Text>
              </View>
            </View>
          </View>
        </View>


        <View style={styles.card}>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Intruder</Text>
              <View style={styles.statusValue}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.valueText}>{motion}</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Rain</Text>
              <View style={styles.statusValue}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.valueText}>{rain}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          {isDispensingFeed && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.amberDot]} />
                <View style={[styles.dot, styles.amberDot]} />
                <View style={[styles.dot, styles.amberDot]} />
              </View>
            </View>
          )}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Feed Control</Text>
            <View style={styles.badge}>
              <Text style={styles.amberBadgeText}>{feedLevel}% Full</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <View style={styles.gaugeBg} />
              <View
                style={[
                  styles.gaugeFill,
                  { height: `${feedLevel}%`, backgroundColor: '#FBBF24' },
                ]}
              />
              <View style={styles.gaugeCover}>
                <Text style={[styles.gaugeText, { color: '#F59E0B' }]}>
                  {feedLevel}%
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.controlFooter}>
            <View>
              <Text style={styles.footerLabel}>Last Feed:</Text>
              <Text style={styles.footerValue}>Today, 08:30 AM</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.amberButton]}
              onPress={dispenseFeed}
              disabled={isDispensingFeed}
            >
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: 8 }}
              >
                <Line
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.buttonText}>Dispense Feed</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {isFillingWater && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.blueDot]} />
                <View style={[styles.dot, styles.blueDot]} />
                <View style={[styles.dot, styles.blueDot]} />
              </View>
            </View>
          )}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Water Control</Text>
            <View style={styles.badge}>
              <Text style={styles.blueBadgeText}>{waterLevel}% Full</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <View style={styles.gaugeBg} />
              <View
                style={[
                  styles.gaugeFill,
                  { height: `${waterLevel}%`, backgroundColor: '#60A5FA' },
                ]}
              />
              <View style={styles.gaugeCover}>
                <Text style={[styles.gaugeText, { color: '#3B82F6' }]}>
                  {waterLevel}%
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.controlFooter}>
            <View>
              <Text style={styles.footerLabel}>Last Refill:</Text>
              <Text style={styles.footerValue}>Today, 10:15 AM</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.blueButton]}
              onPress={refillWater}
              disabled={isFillingWater}
            >
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: 8 }}
              >
                <Line
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.buttonText}>Refill Water</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Log</Text>
          <View style={styles.activityLog}>
            {activityLog.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                {renderActivityIcon(activity.type)}
                <View style={styles.activityContent}>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.card,
            styles.logContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Connection Log
          </Text>
          <View style={{ maxHeight: 200, overflow: 'scroll' }}>
            {logs.map(item => (
              <View key={item.id} style={styles.logEntry}>
                <Text style={[styles.logText, { color: colors.secondaryText }]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {notification && (
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>{notification}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 16,
    color: '#3B82F6',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
  },
  statusLabel: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  amberBadgeText: {
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    fontSize: 12,
    fontWeight: '500',
  },
  blueBadgeText: {
    color: '#1D4ED8',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    fontSize: 12,
    fontWeight: '500',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gauge: {
    position: 'relative',
    height: 120,
    width: 120,
  },
  gaugeBg: {
    position: 'absolute',
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: '#E6EEF8',
    overflow: 'hidden',
  },
  gaugeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  gaugeCover: {
    position: 'absolute',
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    top: 20,
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  gaugeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  amberButton: {
    backgroundColor: '#F59E0B',
  },
  blueButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  activityLog: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 4,
  },
  amberDot: {
    backgroundColor: '#F59E0B',
  },
  blueDot: {
    backgroundColor: '#3B82F6',
  },
  notification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  ledVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledOff: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ledOn: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 10,
  },
  connectionText: {
    fontWeight: '500',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  controlLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabelIcon: {
    marginRight: 8,
  },
  controlLabelText: {
    fontWeight: '500',
    fontSize: 16,
  },
  logContainer: {
    borderRadius: 8,
  },
  logEntry: {
    padding: 8,
    paddingHorizontal: 20,
  },
  logText: {
    fontSize: 14,
  },
});

export default PoultryMonitor;