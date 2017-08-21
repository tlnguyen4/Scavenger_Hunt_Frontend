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
  ProgressViewIOS
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
      currentHint: '',
      gatheredClue: ds.cloneWithRows([]),
    }
    AsyncStorage.getItem('user')
      .then(result => {
        var parsedResult = JSON.parse(result);
        this.setState({id: parsedResult.id});
        axios.post(url + 'getProgress', {
          playerID: this.state.id
        })
        .then(response => {
          if (! response.data.progress) {
            alert("Failed to load progress");
          } else {
            this.setState({gameProgress: response.data.gameProgress, progressIndex: response.data.progressIndex, currentHint: response.data.gameProgress[response.data.progressIndex].hint});
            if (this.state.progressIndex) {
              var clueList = [];
              for (var i = 0; i <= this.state.progressIndex; i++) {
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
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressBarBox}>
          <Text style={styles.progressPercentage}>{this.state.progressIndex/this.state.gameProgress.length}%</Text>
          <ProgressViewIOS
            progress={this.state.progressIndex/this.state.gameProgress.length}
            style={styles.progressBar}
            progressViewStyle="default"
            progressTintColor="#6b0012"
            trackTintColor="#ffcdd5"
          />
        </View>
        <View style={styles.checkInBox}>
          <TouchableOpacity style={styles.checkInButton}>
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
                <Text style={{marginLeft: 20, fontFamily: 'Arial', fontSize: 18}}>{rowData.name}</Text>
                <Text style={{marginLeft: 30, fontFamily: 'Arial', fontSize: 15}}>{rowData.clue}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.leaveHuntBox}>
          <TouchableOpacity>
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
    height: '25%',
  },
  currntHintText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold'
  },
  clueBox: {
    height: '43%',
  },
  clueText: {
    fontSize: 18,
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
