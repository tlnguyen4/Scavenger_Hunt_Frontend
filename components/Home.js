import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  AsyncStorage,
  AlertIOS,
} from 'react-native';
import axios from 'axios';
const url = "https://damp-falls-88401.herokuapp.com/";

class Home extends React.Component {
  static navigationOptions = (props) => ({
    title: 'Hunt'
  })

  constructor() {
    super();
    this.state = {
      username: '',
      name: '',
      id: '',
      gameID: '',
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('user')
      .then(result => {
        var parsedResult = JSON.parse(result);
        this.setState({username: parsedResult.username, name: parsedResult.name, id: parsedResult.id});
      })
  }

  startHunt() {
    AsyncStorage.getItem('game')
      .then(result => {
        if (result) {
          alert('You are already in a game. Head over to Current Hunt.');
        } else {
          axios.post(url + 'newHunt', {
            creator: this.state.name,
            creatorID: this.state.id,
          })
          .then(response => {
            if (! response.data.created) {
              alert(response.data.error);
            } else {
              AsyncStorage.setItem('game', JSON.stringify({
                gameID: response.data.game._id,
                creatorID: response.data.game.creatorID
              }))
              this.props.navigation.navigate('NewHunt');
            }
          })
          .catch(err => {
            alert('Error trying to create new game.');
          });
        }
      });
  }

  joinHunt() {
    AsyncStorage.getItem('game')
      .then(result => {
        if (result) {
          alert("You are already in a game. Head over to Current Hunt.")
        } else {
          AlertIOS.prompt(
            'Enter game ID',
            'Enter shared game ID to enter hunt.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Join hunt!', onPress: input => this.joinHuntClickHandle(input)},
            ],
            'plain-text'
          );
        }
      })
      .catch(err => {
        alert("Error trying to join game.");
      })
  }

  currentHunt() {
    AsyncStorage.getItem('game')
      .then(result => {
        // if the current user is the hunt creator, the page will head to NewHunt page where they can manage the game.
        // if the user is the hunt player, they will go to CurrentHunt game to continue playing
        if (! result) {
          alert("You are not currently in a hunt. Start hunt or join one.");
        } else {
          var parsedResult = JSON.parse(result);
          if (parsedResult.creatorID === this.state.id) {
            this.props.navigation.navigate('NewHunt');
          } else {
            this.props.navigation.navigate('JoinHunt');
          }
        }
      })
      .catch(err => {
        alert("Error getting current game.");
      })
  }

  logOut() {
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('game');
    this.props.navigation.navigate('Welcome');
  }

  joinHuntClickHandle(input) {
    this.setState({gameID: input});
    axios.post(url + 'joinHunt', {
      gameID: this.state.gameID,
      playerID: this.state.id,
    })
    .then(response => {
      if (! response.data.joined) {
        alert("Failed to join game.");
      } else {
        AsyncStorage.setItem('game', JSON.stringify({
          gameID: this.state.gameID,
          creatorID: response.data.creatorID,
        }));
        this.props.navigation.navigate('JoinHunt');
      }
    })
    .catch(err => {
      alert("Error joining game in backend.");
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.onLeftBox}>
          <TouchableOpacity style={styles.button} onPress={() => {this.startHunt()}}>
            <Text style={styles.buttonLabel}>ORGANIZE HUNT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.onRightBox}>
          <TouchableOpacity style={styles.button} onPress={() => this.joinHunt()}>
            <Text style={styles.buttonLabel}>JOIN HUNT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.onLeftBox}>
          <TouchableOpacity style={styles.button} onPress={() => this.currentHunt()}>
            <Text style={styles.buttonLabel}>CURRENT HUNT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logoutBox}>
          <TouchableOpacity onPress={() => this.logOut()}>
            <Text style={styles.logOutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a9f0ff',
    flexDirection: 'column',
  },
  box: {
    height: '33%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  onLeftBox: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  onRightBox: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  button: {
    height: '50%',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4d50'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Arial',
    color: 'white',
    fontWeight: 'bold'
  },
  logoutBox: {
    height: '10%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  logOutText: {
    color: '#ff4d50',
    fontWeight: 'bold',
    fontSize: 20,
  }
});

export default Home;
