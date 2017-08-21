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
  AsyncStorage,
  Clipboard,
  ProgressViewIOS,
  AlertIOS
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Location, Permissions, MapView } from 'expo';
import axios from 'axios';
const url = "https://damp-falls-88401.herokuapp.com/";

class JoinHunt extends React.Component {
  static navigationOptions = (props) => ({
    title: 'Joined Hunt',
  })

  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      gameProgress: [],
      progressIndex: 0,
      id: '',
      gameID: '',
      currentHint: '',
      gatheredClue: ds.cloneWithRows([]),
    }
    AsyncStorage.getItem('user')
      .then(result => {
        var parsedResult = JSON.parse(result);
        this.setState({id: parsedResult.id});
        AsyncStorage.getItem('game')
          .then(result2 => {
            var parsedResult2 = JSON.parse(result2);
            this.setState({gameID: parsedResult2.gameID});
            axios.post(url + 'getProgress', {
              playerID: this.state.id
            })
            .then(response => {
              if (! response.data.progress) {
                alert("Failed to load progress");
              } else {
                this.setState({gameProgress: response.data.gameProgress, progressIndex: response.data.progressIndex});
                if (this.state.progressIndex === this.state.gameProgress.length) {
                  this.setState({currentHint: 'No more clue'});
                } else {
                  this.setState({currentHint: this.state.gameProgress[this.state.progressIndex].hint})
                }
                if (this.state.progressIndex) {
                  var clueList = [];
                  for (var i = 0; i < this.state.progressIndex; i++) {
                    clueList.push({clue: this.state.gameProgress[i].clue, name: this.state.gameProgress[i].name});
                  }
                  this.setState({
                    gatheredClue: ds.cloneWithRows(clueList)
                  })
                }
              }
            })
            .catch(err => {
              alert("Error loading game progress.");
            })
          })
      })
  }

  checkIn() {
    navigator.geolocation.getCurrentPosition(
      (success) => {
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        var index = this.state.progressIndex;
        var locationLat = this.state.gameProgress[index].lat;
        var locationLong = this.state.gameProgress[index].long;
        var currentLat = success.coords.latitude;
        var currentLong = success.coords.longitude;
        var distance = getDistanceFromLatLonInKm(locationLat, locationLong, currentLat, currentLong);
        console.log(distance);
        if (distance < 0.05) {
          axios.post(url + 'checkIn', {
            playerID: this.state.id,
          })
          .then(response => {
            if (! response.data.checked) {
              alert("Cannot checkin in backend.");
            } else {
              this.setState({progressIndex: response.data.progressIndex});
              if (this.state.progressIndex === this.state.gameProgress.length) {
                this.setState({currentHint: 'No more clue'});
                alert("Congratulations! You finished the hunt.");
              } else {
                this.setState({currentHint: this.state.gameProgress[this.state.progressIndex].hint});
              }
              if (this.state.progressIndex) {
                var clueList = [];
                for (var i = 0; i < this.state.progressIndex; i++) {
                  clueList.push({clue: this.state.gameProgress[i].clue, name: this.state.gameProgress[i].name});
                }
                this.setState({
                  gatheredClue: ds.cloneWithRows(clueList)
                })
              }
            }
          })
          .catch(err => {
            console.log('axios check in error', err);
            alert('Error in axios check in post request');
          })
        } else if (distance < 0.2) {
          alert('You\'re close!');
        } else {
          alert('You\'re not there yet!');
        }
      },
      (error) => {
        alert("Error! Can\'t get current location for checkin.");
      }
    )
  }

  leaveHunt() {
    AlertIOS.alert(
    'Leave game',
    'Are you sure you want to leave hunt? Your progress will be lost.',
     [
       {text: 'Cancel', style: 'cancel'},
       {text: 'Delete', onPress: () => this.leaveHuntClickHandle(), style: 'destructive'},
     ],
    );
  }

  leaveHuntClickHandle() {
    console.log(this.state.gameID);
    axios.post(url + 'leaveHunt', {
      playerID: this.state.id,
      gameID: this.state.gameID,
    })
    .then(response => {
      console.log(response);
      if (! response.data.left) {
        alert('Failed to leave game');
        console.log(response.data.error);
      } else {
        AsyncStorage.removeItem('game');
        this.props.navigation.goBack();
      }
    })
    .catch(err => {
      console.log("error leaving game", err);
      alert("Axios error trying to leave game");
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressBarBox}>
          <Text style={styles.progressPercentage}>{this.state.progressIndex / this.state.gameProgress.length * 100}%</Text>
          <ProgressViewIOS
            progress={this.state.progressIndex/this.state.gameProgress.length}
            style={styles.progressBar}
            progressViewStyle="default"
            progressTintColor="#6b0012"
            trackTintColor="#ffcdd5"
          />
        </View>
        <View style={styles.checkInBox}>
          <TouchableOpacity style={styles.checkInButton} onPress={() => this.checkIn()}>
            <Text style={styles.checkInButtonLabel}>C H E C K  I N</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.currentHintBox}>
          <Text style={styles.currntHintText}>Current Hint</Text>
          <Text style={{fontSize: 18, marginLeft: 20}}>{this.state.currentHint}</Text>
        </View>
        <View style={styles.clueBox}>
          <Text style={styles.clueText}>Gathered Clues</Text>
          <ListView
            dataSource={this.state.gatheredClue}
            enableEmptySections={true}
            renderRow={(rowData) => (
              <View>
                <Text style={{marginLeft: 20, fontFamily: 'Arial', fontSize: 18}}>{rowData.clue}</Text>
                <Text style={{marginLeft: 30, marginBottom: 15, fontFamily: 'Arial', fontSize: 15, color: 'gray'}}>From {rowData.name}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.leaveHuntBox}>
          <TouchableOpacity onPress={() => this.leaveHunt()}>
            <Text style={styles.leaveText}>LEAVE HUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#bdffc8',
    flex: 1,
    flexDirection: 'column'
  },
  progressBarBox: {
    height: '10%',
    flexDirection: 'column',
  },
  progressPercentage: {
    color: '#00004a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold'
  },
  progressBar: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkInBox: {
    height: '15%',
    width: '100%',
  },
  checkInButton: {
    marginLeft: 10,
    marginRight: 10,
    height: '100%',
    backgroundColor: '#795dff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  checkInButtonLabel: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentHintBox: {
    height: '20%',
  },
  currntHintText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold'
  },
  clueBox: {
    height: '48%',
  },
  clueText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: 'bold'
  },
  leaveHuntBox: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: '7%'
  },
  leaveText: {
    color: '#ff4d50',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5
  }
})

export default JoinHunt;

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
