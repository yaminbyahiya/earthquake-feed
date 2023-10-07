import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, SafeAreaView, Button, TouchableOpacity, FlatList, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

function EarthquakeNews({navigation}){
  const [articles, setArticles] = useState([]);
  useEffect(()=>{
    const fetchNews = async () => {
      try {
        const apiKey = '47d3d84485ed4acd93e5682c77f7166c';
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=earthquake&apiKey=${apiKey}`
        );
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching earthquake news:', error);
      }
    };

    fetchNews();
  }, []);


  const openArticleLink = (url) => {
    Linking.openURL(url);
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openArticleLink(item.url)}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
        <Text>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

    return(
      <View style={styles.newsCard}>
          <FlatList
            data={articles}
            renderItem={renderItem}
            keyExtractor={(item) => item.url}
          />
      </View>
    );

}

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

  // let current_date = '2023-09-17';

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
        <Text style={styles.locationHeader}>Your Current Location <Ionicons name="location" size={20} color="black" /></Text>
        <Text>{country}</Text>
      </View>
      {regional_earthquake?<View style={styles.warningCard}>
        <Feather name="alert-triangle" size={50} color="red" />
        <Text style={styles.warningHeader}>Warning!</Text>
        <Text style={styles.warningText}>Earthquake was detected in your region today!</Text>
        {/* <Button
          color="white"
          title='Details'
        ></Button> */}
        <TouchableOpacity style={styles.warningButton}>
          <Text style={styles.warningButtonText}>Details</Text>
        </TouchableOpacity>
      </View>:<View style={styles.safeCard}>
          <Ionicons name="md-checkmark-circle" size={50} color="green" />
          <Text style={styles.warningHeader}>You are safe!</Text>
          <Text style={styles.warningText}>No earthquake event occured within your region today!</Text>
        </View>}
      <View style={styles.card}>
        <Text>Recent Massive Global Earthquakes</Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('Details')}
        >
          <Text style={styles.warningButtonText}>View</Text>
        </TouchableOpacity>
        {/* <Button
          title="View"
          onPress={() => navigation.navigate('Details')}
        /> */}
      </View>
      <View style={styles.card}>
        <Text>Latest News on Global Earthquakes</Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('News')}
        >
          <Text style={styles.warningButtonText}>View</Text>
        </TouchableOpacity>
        {/* <Button
          title="View"
          onPress={() => navigation.navigate('Details')}
        /> */}
      </View>
    </ScrollView>
  );
}

function DetailsScreen() {

  let today = new Date();
  let end_time = today.toISOString().split('T')[0];
  let thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  let start_time = thirtyDaysAgo.toISOString().split('T')[0]; 

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
        <Stack.Screen name="News" component={EarthquakeNews} options={{title: 'Latest Earthquake News'}}/>
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
    backgroundColor:'white',
    margin:10,
    paddingTop:20,
    paddingBottom:20,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:10
  },
  safeCard:{
    alignItems:'center',
    backgroundColor:'white',
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
    backgroundColor:'black',
    paddingLeft:10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10,
    marginTop:10,
    borderRadius:5,
  },
  warningButtonText:{
    color:'white'
  },
  viewButton:{
    backgroundColor:'black',
    paddingLeft:10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10,
    borderRadius:5,
  },
  locationCard:{
    backgroundColor:'white',
    padding:10,
    margin:10,
    borderRadius:5
  },
  locationHeader:{
    fontSize:20
  },
  newsCard:{
    alignItems:'center',
    backgroundColor:'white',
    margin:10,
    paddingTop:20,
    paddingBottom:20,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:10
  },
  newsHeader:{
    fontSize:20
  },
});
