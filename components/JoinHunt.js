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
      game: [],
      id: '',
      gameID: '',
      currentHint: ds.cloneWithRows([]),
      gatheredClue: ds.cloneWithRows([]),
      tCount: 0,
    }
    AsyncStorage.getItem('user')
      .then(result => {
        var parsedResult = JSON.parse(result);
        this.setState({id: parsedResult.id});
        axios.post(url + 'getProgress', {
          playerID: this.state.id,
        })
        .then(response => {
          if (! response.data.progress) {
            alert("Failed to load progress");
          } else {
            this.setState({gameProgress: response.data.gameProgress, game: response.data.game, gameID: response.data.gameID});
            var hintArray = [];
            var clueList = [];
            var tCount2 = 0;
            this.state.gameProgress.forEach((bool, index) => {
              if (! bool) {
                hintArray.push({hint: this.state.game[index].hint, index: index});
              } else {
                tCount2 = tCount2 + 1;
                clueList.push({clue: this.state.game[index].clue, name: this.state.game[index].name});
              }
            })
            this.setState({
              gatheredClue: ds.cloneWithRows(clueList),
              currentHint: ds.cloneWithRows(hintArray),
              tCount: tCount2,
            })
          }
        })
        .catch(err => {
          alert("Error loading game progress.");
        })
      })
  }

  checkIn = async(rowData) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      alert('In order to check in you must grant permission to access current location.');
    } else {
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
      var index = rowData.index;
      var locationLat = this.state.game[index].lat;
      var locationLong = this.state.game[index].long;
      var currentLat = location.coords.latitude;
      var currentLong = location.coords.longitude;
      var distance = getDistanceFromLatLonInKm(locationLat, locationLong, currentLat, currentLong);
      if (distance < 0.05) {
        axios.post(url + 'checkIn', {
          playerID: this.state.id,
          index: index
        })
        .then(response => {
          if (! response.data.checked) {
            alert("Cannot checkin in backend.");
          } else {
            const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
            this.setState({gameProgress: response.data.gameProgress});
            var hintArray = [];
            var clueList = [];
            var tCount2 = 0;
            this.state.gameProgress.forEach((bool, index) => {
              if (! bool) {
                hintArray.push({hint: this.state.game[index].hint, index: index});
              } else {
                tCount2 = tCount2 + 1;
                clueList.push({clue: this.state.game[index].clue, name: this.state.game[index].name});
              }
            })
            if (tCount2 === this.state.gameProgress.length) {
              alert("Congratulations! You've finished the hunt. Gathered clues are up for solving.");
            } else {
              alert('Checked in complete. See clue below.');
            }
            this.setState({
              gatheredClue: ds.cloneWithRows(clueList),
              currentHint: ds.cloneWithRows(hintArray),
              tCount: tCount2,
            })
          }
        })
        .catch(err => {
          alert("Axios post err trying to check in");
        })
      } else if (distance < 0.3) {
        alert('You\'re close!');
      } else {
        alert('You\'re not there yet!');
      }
    }
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
    axios.post(url + 'leaveHunt', {
      playerID: this.state.id,
      gameID: this.state.gameID,
    })
    .then(response => {
      if (! response.data.left) {
        alert('Failed to leave game');
      } else {
        AsyncStorage.removeItem('game');
        this.props.navigation.goBack();
      }
    })
    .catch(err => {
      alert("Axios error trying to leave game");
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerTop}>
          <View style={styles.progressBarBox}>
            <Text style={styles.progressPercentage}>{Math.floor(this.state.tCount / this.state.gameProgress.length * 100)}%</Text>
            <ProgressViewIOS
              progress={this.state.tCount / this.state.gameProgress.length}
              style={styles.progressBar}
              progressViewStyle="default"
              progressTintColor="#6b0012"
              trackTintColor="#ffcdd5"
            />
          </View>
          <View style={styles.currentHintBox}>
            <View>
              <ListView
                dataSource={this.state.currentHint}
                enableEmptySections={true}
                renderRow={(rowData) => (
                  <TouchableOpacity style={styles.checkInButton} onLongPress={this.checkIn.bind(this, rowData)}>
                    <Text style={styles.checkInButtonLabel}>{rowData.index + 1}. {rowData.hint}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <View>
              {this.state.tCount ? <Text style={styles.clueText}>Gathered Clues</Text> : <Text></Text>}
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
          </View>
        </View>
        <View style={styles.containerBottom}>
          <View style={styles.leaveHuntBox}>
            <TouchableOpacity onPress={() => this.leaveHunt()}>
              <Text style={styles.leaveText}>LEAVE HUNT</Text>
            </TouchableOpacity>
          </View>
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
  containerTop: {
    height: '95%',
  },
  containerBottom: {
    height: '5%',
  },
  progressBarBox: {
    height: '8%',
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
  checkInButton: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#795dff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 5
  },
  checkInButtonLabel: {
    color: 'white',
    fontFamily: 'Arial',
    textAlign: 'left',
    fontSize: 18
  },
  currentHintBox: {
    height: '92%',
  },
  currntHintText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold'
  },
  clueText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 5,
    fontWeight: 'bold'
  },
  leaveHuntBox: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: '100%'
  },
  leaveText: {
    color: '#ff4d50',
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
