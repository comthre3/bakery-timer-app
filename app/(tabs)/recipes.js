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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Try to get cached recipes from AsyncStorage
  const getCachedRecipes = async () => {
    try {
      const cachedRecipesJson = await AsyncStorage.getItem('cachedRecipes');
      if (cachedRecipesJson) {
        const cachedRecipes = JSON.parse(cachedRecipesJson);
        console.log(`Got ${cachedRecipes.length} recipes from cache`);
        return cachedRecipes;
      }
    } catch (error) {
      console.error('Error getting cached recipes:', error);
    }
    return null;
  };

  // Save recipes to cache for offline use
  const cacheRecipes = async (recipesToCache) => {
    try {
      await AsyncStorage.setItem('cachedRecipes', JSON.stringify(recipesToCache));
      console.log(`Cached ${recipesToCache.length} recipes`);
    } catch (error) {
      console.error('Error caching recipes:', error);
    }
  };

  useEffect(() => {
    // Mark that we're in a client environment
    setIsClient(true);
    
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        
        console.log('Fetching recipes from Supabase...');
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching recipes from Supabase:', error);
          setError(error.message);
          
          // Try to get recipes from cache as fallback
          const cachedData = await getCachedRecipes();
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached recipes as fallback');
            setRecipes(cachedData);
            setUsingFallback(true);
            setError(null); // Clear error since we have fallback data
          }
          return;
        }
        
        console.log(`Fetched ${data ? data.length : 0} recipes from Supabase`);
        setRecipes(data || []);
        
        // Cache recipes for offline use
        if (data && data.length > 0) {
          cacheRecipes(data);
        }
      } catch (error) {
        console.error('Error in fetchRecipes:', error);
        setError(error.message || 'An unexpected error occurred');
        
        // Try to get recipes from cache as fallback
        const cachedData = await getCachedRecipes();
        if (cachedData && cachedData.length > 0) {
          console.log('Using cached recipes as fallback after error');
          setRecipes(cachedData);
          setUsingFallback(true);
          setError(null); // Clear error since we have fallback data
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();

    // Set up realtime subscription for recipe updates
    const recipesSubscription = supabase
      .channel('recipe_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'recipes' }, 
        fetchRecipes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recipesSubscription);
    };
  }, []);

  const goToRecipeDetail = (id) => {
    console.log('Navigating to recipe detail:', id);
    router.push({
      pathname: '/(tabs)/recipes/[id]',
      params: { id }
    });
  };

  // Simple server-side render
  if (!isClient) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recipes</Text>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/recipes/create')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {usingFallback && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
          <Text style={styles.fallbackText}>Offline mode - using cached data</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load recipes</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes yet.</Text>
          <Text style={styles.emptySubText}>
            Click the + button to create your first recipe.
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.recipeCard}
              onPress={() => goToRecipeDetail(item.id)}
            >
              <View>
                <Text style={styles.recipeName}>{item.name}</Text>
                {item.description && (
                  <Text 
                    style={styles.recipeDescription}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}
                <View style={styles.recipeDetails}>
                  <Text style={styles.recipeDetail}>Flour: {item.flour_total}g</Text>
                  <Text style={styles.recipeDetail}>Hydration: {item.hydration.toFixed(1)}%</Text>
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
  fallbackBanner: {
    backgroundColor: '#f39c12',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorDetail: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
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
  recipeCard: {
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
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  recipeDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  recipeDetail: {
    fontSize: 14,
    color: '#888',
    marginRight: 12,
  },
});