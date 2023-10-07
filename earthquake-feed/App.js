import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, SafeAreaView, Button, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

function HomeScreen({navigation}) {
  let lat;
  let lng;
  const [location, setLocation] = useState("null");
  const [errorMsg, setErrorMsg] = useState(null);

  // Geolocation.getCurrentPosition(info => setLocation(info));
  if(location && location.coords && location.coords.latitude){
    lat = location.coords.latitude;
    lng = location.coords.longitude;
    console.log(lat);
    console.log(lng);
  }

  let today = new Date();

  let current_date = today.toISOString().split('T')[0];

  // console.log(current_date);

  let regional_earthquake = false;

  const [data, setData] = useState(null);

  const[country, setCountry] = useState(null);

  useEffect(()=>{

    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=fc72fce9eb37493dae32cff49e3d6b48`;
    const fetchLocation = async () => {
      try {
        const locationResponse = await fetch(openCageUrl);
        const locationJson = await locationResponse.json();
        if(locationJson && locationJson.results && locationJson.results[0] && locationJson.results[0].formatted){
          setCountry(locationJson.results[0].formatted);
        }
        console.log(locationJson.results[0].formatted);
      } catch (error) {
        console.error("Error: ", error);
      }
    }

    fetchLocation();
    const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${current_date}&endtime&minlatitude=20.74&maxlatitude=26.72&minlongitude=88.02&maxlongitude=92.68&orderby=time`;
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error: ', error);
      }
    }
  
    fetchData();
  }, [lat]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  if (data && data.features && data.features.length !== 0) {
    regional_earthquake = true;
  }


  

  return (
    <ScrollView>
      <View style={styles.locationCard}>
        <Text>Your Current Location</Text>
        <Text>{country}</Text>
      </View>
      {regional_earthquake?<View style={styles.warningCard}>
        <Text style={styles.warningHeader}>Warning!</Text>
        <Text style={styles.warningText}>Earthquake was detected in your region today!</Text>
        {/* <Button
          color="white"
          title='Details'
        ></Button> */}
        <TouchableOpacity style={styles.warningButton}>
          <Text>Details</Text>
        </TouchableOpacity>
      </View>:<View style={styles.safeCard}>
          <Text style={styles.warningHeader}>You are safe!</Text>
          <Text style={styles.warningText}>No earthquake event occured within your region today!</Text>
        </View>}
      <View style={styles.card}>
        <Text>Recent Massive Global Earthquakes</Text>
        <Button
          title="View"
          onPress={() => navigation.navigate('Details')}
        />
      </View>
    </ScrollView>
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Earthquake Live Feed' }} />
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
  card:{
    flexDirection:'row',
    backgroundColor:"white",
    alignItems:'center',
    justifyContent:'space-around',
    paddingTop:20,
    paddingBottom:20,
    margin:10,
    borderRadius:10
  },
  warningCard:{
    alignItems:'center',
    backgroundColor:'crimson',
    margin:10,
    paddingTop:20,
    paddingBottom:20,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:10
  },
  safeCard:{
    alignItems:'center',
    backgroundColor:'greenyellow',
    margin:10,
    paddingTop:20,
    paddingBottom:20,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:10
  },
  warningHeader:{
    fontSize:30,
    textAlign:'center'
  },
  warningText:{
    textAlign:'center',
    fontSize:15,
    marginTop:5,
    marginBottom:5
  },
  warningButton:{
    backgroundColor:'white',
    paddingLeft:10,
    paddingRight:10,
    paddingTop:5,
    paddingBottom:5,
    marginTop:10,
    borderRadius:5
  },
  locationCard:{
    backgroundColor:'white',
    padding:10,
    margin:10,
    borderRadius:5
  }
});
