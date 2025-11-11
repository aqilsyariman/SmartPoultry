import React, { useState, useEffect, FC } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Animated,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Svg, Path, Line } from 'react-native-svg';

// Define types
type ActivityType = 'water' | 'feed' | 'system';

interface Activity {
  type: ActivityType;
  message: string;
  time: string;
}

const Testing: FC = () => {
  // State
  const [feedLevel, setFeedLevel] = useState<number>(75);
  const [waterLevel, setWaterLevel] = useState<number>(60);
  const [activityLog, setActivityLog] = useState<Activity[]>([
    {
      type: 'water',
      message: 'Water level at 60%',
      time: 'Today, 10:15 AM'
    },
    {
      type: 'feed',
      message: 'Feed dispensed (200g)',
      time: 'Today, 08:30 AM'
    },
    {
      type: 'system',
      message: 'System check completed',
      time: 'Today, 06:00 AM'
    }
  ]);
  const [isDispensingFeed, setIsDispensingFeed] = useState<boolean>(false);
  const [isFillingWater, setIsFillingWater] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Animation
  const fadeAnim = new Animated.Value(0);

  // Handle notification display
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

  // Functions
  const dispenseFeed = (): void => {
    setIsDispensingFeed(true);
    
    setTimeout(() => {
      setIsDispensingFeed(false);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const newActivity: Activity = {
        type: 'feed',
        message: 'Feed dispensed (200g)',
        time: `Today, ${timeString}`
      };
      
      setActivityLog([newActivity, ...activityLog]);
      setNotification('Feed dispensed successfully!');
    }, 2000);
  };

  const refillWater = (): void => {
    setIsFillingWater(true);
    
    setTimeout(() => {
      setIsFillingWater(false);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const newActivity: Activity = {
        type: 'water',
        message: 'Water refilled',
        time: `Today, ${timeString}`
      };
      
      setActivityLog([newActivity, ...activityLog]);
      setNotification('Water refilled successfully!');
    }, 2000);
  };

  const renderActivityIcon = (type: ActivityType): React.ReactElement => {
    switch(type) {
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
              <Line x1="6" y1="1" x2="6" y2="4" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Line x1="10" y1="1" x2="10" y2="4" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Line x1="14" y1="1" x2="14" y2="4" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        );
      case 'system':
        return (
          <View style={[styles.activityIcon, { backgroundColor: '#DCFCE7' }]}>
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
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Poultry Monitor</Text>
            <Text style={styles.subtitle}>Coop Management System</Text>
          </View>
          
        </View>
        
        {/* Status Overview */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator} />
            <Text style={styles.cardTitle}>System Status: Online</Text>
          </View>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Temperature</Text>
              <View style={styles.statusValue}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
                  <Path 
                    d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </Svg>
                <Text style={styles.valueText}>24°C</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Humidity</Text>
              <View style={styles.statusValue}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
                  <Path 
                    d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </Svg>
                <Text style={styles.valueText}>65%</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Feed Control */}
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
              <Text style={styles.amberBadgeText}>75% Full</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <View style={styles.gaugeBg} />
              <View style={[styles.gaugeFill, { height: `${feedLevel}%`, backgroundColor: '#FBBF24' }]} />
              <View style={styles.gaugeCover}>
                <Text style={[styles.gaugeText, { color: '#F59E0B' }]}>{feedLevel}%</Text>
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
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
                <Line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.buttonText}>Dispense Feed</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Water Control */}
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
              <Text style={styles.blueBadgeText}>60% Full</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <View style={styles.gaugeBg} />
              <View style={[styles.gaugeFill, { height: `${waterLevel}%`, backgroundColor: '#60A5FA' }]} />
              <View style={styles.gaugeCover}>
                <Text style={[styles.gaugeText, { color: '#3B82F6' }]}>{waterLevel}%</Text>
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
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
                <Line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.buttonText}>Refill Water</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Activity Log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Log</Text>
          <View style={styles.activityLog}>
            {activityLog.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                {renderActivityIcon(activity.type)}
                <View style={styles.activityContent}>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Notification */}
      {notification && (
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>{notification}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

// Define styles with TypeScript types
const styles = StyleSheet.create<{[key: string]: ViewStyle | TextStyle}>({
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
  addButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#22C55E',
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
});

export default Testing;