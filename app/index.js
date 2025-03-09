import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../src/services/supabase';
import { Alert } from 'react-native';

export default function Index() {
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        console.log('Checking Supabase connection...');
        
        // Just try to query recipes to check connection
        const { data, error } = await supabase
          .from('recipes')
          .select('id')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') { // Table doesn't exist error
            console.log('Tables do not exist yet. Please run the setup-database.sql script in Supabase.');
            Alert.alert(
              'Database Setup Required',
              'The database tables haven\'t been created yet. Please run the setup-database.sql script in the Supabase SQL Editor.',
              [{ text: 'OK' }]
            );
          } else {
            console.error('Database connection error:', error);
          }
        } else {
          console.log('Successfully connected to database');
        }
      } catch (error) {
        console.error('Error checking database:', error);
      }
    };

    checkDatabaseConnection();
  }, []);

  // Redirect to the login screen by default
  return <Redirect href="/(auth)/login" />;
}