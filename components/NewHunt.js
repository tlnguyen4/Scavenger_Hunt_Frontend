import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  AsyncStorage
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Location, Permissions, MapView } from 'expo';
import axios from 'axios';
const url = "https://damp-falls-88401.herokuapp.com/";

class NewHunt extends React.Component {
  static navigationOptions = (props) => ({
    title: 'New Hunt',
  })

  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      lat: 0,
      long: 0,
      gameID: '',
      locationName: '',
      locationHint: '',
      locations: ds.cloneWithRows([]),
      // players: ds.cloneWithRows([])
    }
    AsyncStorage.getItem('game')
      .then(result => {
        var parsedResult = JSON.parse(result);
        this.setState({gameID: parsedResult.gameID});
        axios.post(url + 'getLocations', {
          gameID: this.state.gameID
        })
        .then(response => {
          if (! response.data.retrieved) {
            alert("Failed to get game state");
          } else {
            if (response.data.locations) {
              this.setState({
                locations: ds.cloneWithRows(response.data.locations),
                // players: ds.cloneWithRows(response.data.players)
              });
            }
          }
        })
        .catch(err => {
          alert('Error loading data.');
        });
      })
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (success) => {
        this.setState({
          lat: success.coords.latitude,
          long: success.coords.longitude
        })
      },
      (error) => {
        alert("Error! Can\'t get current location.")
      }
    )
  }

  add() {
    if (! this.state.locationName || ! this.state.locationHint) {
      alert('Empty fields.');
      return;
    }
    axios.post(url + 'addLocation', {
      gameID: this.state.gameID,
      locationName: this.state.locationName,
      locationHint: this.state.locationHint
    })
    .then(response => {
      if (! response.data.added) {
        alert("Failed to add location.");
      } else {
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          locations: ds.cloneWithRows(response.data.locations),
          locationName: '',
          locationHint: '',
        });
      }
    })
    .catch(err => {
      alert("Error adding location to database.");
    })
  }

  deleteHunt() {
    AsyncStorage.getItem('game')
      .then(result => {
        var parsedResult = JSON.parse(result);
        return parsedResult;
      })
      .then(parsedResult => {
        axios.post(url + 'deleteHunt', {
          gameID: parsedResult.gameID,
          creatorID: parsedResult.creatorID
        })
        .then(response => {
          if (! response.data.deleted) {
            alert('Failed to delete game in backend.');
          } else {
            AsyncStorage.removeItem('game');
            this.props.navigation.goBack();
          }
        })
      })
      .catch(err => {
        alert("Failed to delete game.");
      })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mapBox}>
          <MapView
            style={{height: '100%', width: '100%'}}
            region={{
              latitude: this.state.lat,
              longitude: this.state.long,
              latitudeDelta: 0.01,
              longitudeDelta: 0.005
            }}
            showsUserLocation={true}
          />
        </View>
        <View style={styles.inputAddBox}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter name of location"
              value={this.state.locationName}
              onChangeText={text => this.setState({locationName: text})}
            />
            <TextInput
              style={[styles.textInput, {marginTop: 5}]}
              placeholder="Enter hint for location"
              value={this.state.locationHint}
              onChangeText={text => this.setState({locationHint: text})}
            />
          </View>
          <View style={styles.addButtonBox}>
            <TouchableOpacity style={styles.addButton} onPress={() => this.add()}>
                <Text style={styles.addButtonLabel}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.listBox}>
          <ListView
            dataSource={this.state.locations}
            enableEmptySections={true}
            renderRow={(rowData) => (
              <View>
                <Text style={{marginLeft: 10, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 18}}>{rowData.name}</Text>
                <Text style={{marginLeft: 20, marginBottom: 15, fontFamily: 'Arial', fontSize: 15}}>{rowData.hint}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.deleteBox}>
          <TouchableOpacity onPress={() => this.deleteHunt()}>
            <Text style={styles.deleteText}>DELETE GAME</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ffa9',
    flexDirection: 'column',
  },
  inputAddBox: {
    display: 'flex',
    flexDirection: 'row',
    margin: 0,
    padding: 0,
    height: '20%',
    width: '100%',
    alignItems: 'center'
  },
  inputBox: {
    margin: 0,
    padding: 0,
    width: '80%'
  },
  addButtonBox: {
    width: '20%',
    height: '100%',
    paddingRight: 10,
    paddingTop: 17,
    paddingBottom: 17
  },
  mapBox: {
    height: '35%',
  },
  listBox: {
    height: '38%'
  },
  textInput: {
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: 'gray',
    height: 40,
    marginLeft: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#3dbd00',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    borderRadius: 5
  },
  addButtonLabel: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteBox: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '7%'
  },
  deleteText: {
    color: '#ff4d50',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5
  }
})

export default NewHunt;
