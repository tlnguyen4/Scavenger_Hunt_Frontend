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

class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      username: '',
      password: '',
      repeatPassword: ''
    }
  }

  checkUsername() {
    axios.post(url + 'checkUsername', {
      username: this.state.username,
    })
    .then(response => {
      if (! response.data.checked) {
        alert("Failed to check username for existing account");
      } else {
        if (response.data.existed) {
          alert("Username not available.");
        }
      }
    })
    .catch(err => {
      alert("Error in axios post trying to check username.");
    })
  }

  register() {
    if (! this.state.name || ! this.state.username || ! this.state.password || ! this.state.repeatPassword) {
      alert('Empty field.');
    } else if (this.state.repeatPassword !== this.state.password) {
      alert('Repeat password does not match password.')
    } else {
      axios.post(url + 'register', {
        name: this.state.name,
        username: this.state.username,
        password: this.state.password,
      })
      .then(response => {
        if (! response.data.register) {
          alert("Error registering user.");
        } else {
          AsyncStorage.setItem('user', JSON.stringify({
            username: response.data.user.username,
            name: response.data.user.name,
            id: response.data.user._id
          }));
          this.props.navigation.navigate('Home');
        }
      })
      .catch(err => {
        alert("Failed to register.");
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={[styles.input, styles.text]}
          placeholder="Display name"
          onChangeText={text => this.setState({name: text})}
        />
        <TextInput
          style={[styles.input, styles.text]}
          placeholder="Username"
          autoCapitalize="none"
          onChangeText={text => this.setState({username: text})}
          onEndEditing={this.checkUsername()}
        />
        <TextInput
          style={[styles.input, styles.text]}
          placeholder="Password"
          secureTextEntry={true}
          autoCapitalize="none"
          onChangeText={text => this.setState({password: text})}
        />
        <TextInput
          style={[styles.input, styles.text]}
          placeholder="Retype password"
          secureTextEntry={true}
          autoCapitalize="none"
          onChangeText={text => this.setState({repeatPassword: text})}
        />
        <TouchableOpacity style={styles.buttonLogin} onPress={() => this.register()}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    );
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
    height: 40,
  },
  buttonLogin: {
    height: 40,
    alignSelf: 'stretch',
    paddingTop: 30,
    paddingBottom: 30,
  },
  text: {
    color: 'black',
    fontFamily: 'Arial',
    fontSize: 20,
    textAlign: 'center'
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

export default Register;
