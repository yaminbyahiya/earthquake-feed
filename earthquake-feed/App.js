import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function HomeScreen({navigation}) {
  return (
    <View style={styles.header}>
      <Text>Earthquake Live Feed</Text>
      <Button
        title="View Recent Earthquakes"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen() {

  let start_time = '2023-09-01';
  let end_time = '2023-09-27';

  const [data, setData] = useState(null);

  useEffect(()=>{
    const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start_time}&endtime=${end_time}&minmagnitude=5`;
    fetch(apiUrl).then(response => response.json()).then(jsonData => setData(jsonData)).catch(error => console.error('Error: ', error)); 
  }, []);

  return (
    <ScrollView>
      {data && data.features && data.features.map((feature, index) => (
        <View key={index} style={styles.earthquakeCard}>
          <Text style={styles.magnitude}>Magnitude: {feature.properties.mag}</Text>
          <Text style={styles.place}>Place: {feature.properties.place}</Text>
          <Text style={styles.time}>Time: {new Date(feature.properties.time).toString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>{
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{title: 'Recent Earthquakes'}}/>
      </Stack.Navigator>
    }
    </NavigationContainer>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header:{
    flex: 1,
    alignItems:'center',
    justifyContent:'flex-start'
  },
  earthquakeCard: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  magnitude: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  place: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
});
