import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function DoughsScreen() {
  const [doughs, setDoughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're in a client environment
    setIsClient(true);
    
    const fetchDoughs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('dough_batches')
          .select(`
            *,
            recipes:recipe_id (name, hydration, flour_total)
          `)
          .in('status', ['planned', 'in_progress'])
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching doughs:', error);
          return;
        }
        
        setDoughs(data || []);
      } catch (error) {
        console.error('Error fetching doughs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoughs();

    // Set up realtime subscription for dough updates
    const doughsSubscription = supabase
      .channel('dough_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dough_batches' }, 
        fetchDoughs
      )
      .subscribe();

    return () => {
      supabase.removeChannel(doughsSubscription);
    };
  }, []);

  const getProgressPercentage = (dough) => {
    // Simple implementation - can be enhanced with actual timeline progress
    if (!dough.timeline || !dough.current_stage) return 0;
    
    const stages = Object.keys(dough.timeline);
    const currentIndex = stages.indexOf(dough.current_stage);
    
    if (currentIndex === -1) return 0;
    return Math.floor((currentIndex / (stages.length - 1)) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return '#f39c12';
      case 'in_progress': return '#2ecc71';
      case 'completed': return '#3498db';
      case 'failed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTimeRemaining = (dough) => {
    // Placeholder for time remaining calculation
    // This would be more sophisticated in a real implementation
    return '2h 45m';
  };

  // Simple server-side render
  if (!isClient) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Doughs</Text>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Doughs</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/doughs/create')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : doughs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active doughs yet.</Text>
          <Text style={styles.emptySubText}>
            Click the + button to start a new dough from a recipe.
          </Text>
        </View>
      ) : (
        <FlatList
          data={doughs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.doughCard, {borderLeftColor: item.color_code || getStatusColor(item.status)}]}
              onPress={() => router.push({
                pathname: '/(tabs)/doughs/[id]',
                params: { id: item.id }
              })}
            >
              <View style={styles.doughInfo}>
                <Text style={styles.doughName}>
                  {item.recipes?.name || 'Unnamed Dough'}
                </Text>
                
                <View style={styles.doughDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="water-outline" size={16} color="#3498db" />
                    <Text style={styles.detailText}>
                      {item.recipes?.hydration.toFixed(1)}%
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="timer-outline" size={16} color="#e67e22" />
                    <Text style={styles.detailText}>
                      {formatTime(item.start_time)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="thermometer-outline" size={16} color="#e74c3c" />
                    <Text style={styles.detailText}>
                      {item.temperature_logs && item.temperature_logs.length > 0 
                        ? `${item.temperature_logs[item.temperature_logs.length - 1].value}°C` 
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      {width: `${getProgressPercentage(item)}%`}
                    ]} 
                  />
                </View>
                
                <View style={styles.stageInfo}>
                  <Text style={styles.currentStage}>
                    {item.current_stage 
                      ? item.current_stage.charAt(0).toUpperCase() + item.current_stage.slice(1) 
                      : 'Not started'}
                  </Text>
                  <Text style={styles.timeRemaining}>
                    {calculateTimeRemaining(item)}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#bbb" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  doughCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  doughInfo: {
    flex: 1,
  },
  doughName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doughDetails: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  stageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  currentStage: {
    fontSize: 14,
    color: '#555',
  },
  timeRemaining: {
    fontSize: 14,
    color: '#e67e22',
  },
});