import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  AsyncStorage
} from 'react-native';
import axios from 'axios';
const url = "https://damp-falls-88401.herokuapp.com/";

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: ''
    }
  }

  login() {
    if (! this.state.username || ! this.state.password) {
      alert('Empty field.');
    } else {
      axios.post(url + 'login', {
        username: this.state.username,
        password: this.state.password
      })
      .then(response => {
        if (! response.data.login) {
          alert(response.data.error);
        } else {
          AsyncStorage.setItem('user', JSON.stringify({
            username: response.data.user.username,
            name: response.data.user.name,
            id: response.data.user._id
          }));
          if (response.data.game) {
            AsyncStorage.setItem('game', JSON.stringify({
              gameID: response.data.game._id,
              creatorID: response.data.game.creatorID,
            }));
          }
          this.props.navigation.navigate('Home');
        }
      })
      .catch(err => {
        alert("Error in Login.js.");
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={[styles.input, styles.text]}
          autoCapitalize="none"
          placeholder="Username"
          onChangeText={text => this.setState({username: text})}
        />
        <TextInput
          style={[styles.input, styles.text]}
          autoCapitalize="none"
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={text => this.setState({password: text})}
        />
        <TouchableOpacity style={styles.buttonLogin} onPress={() => this.login()}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#a9c5ff',
    paddingTop: 40
  },
  input: {
    height: 40
  },
  buttonLogin: {
    height: 40,
    alignSelf: 'stretch',
    paddingTop: 30,
    paddingBottom: 30
  },
  text: {
    color: 'black',
    fontFamily: 'Arial',
    textAlign: 'center',
    fontSize: 20
  },
  buttonText: {
    color: '#00004a',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
})

export default Login;
