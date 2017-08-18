import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  AsyncStorage
} from 'react-native';
import { StackNavigator } from 'react-navigation';

class Welcome extends React.Component {
  componentDidMount() {
    AsyncStorage.getItem('user')
      .then(result => {
        if (result) {
          this.props.navigation.navigate('Home');
        }
      })
  }

  login() {
    AsyncStorage.getItem('user')
      .then(result => {
        if (result) {
          this.props.navigation.navigate('Home');
        } else {
          this.props.navigation.navigate('Login');
        }
      })
  }

  register() {
    this.props.navigation.navigate('Register');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.welcome}>SCAVENGER HUNT</Text>
          <Text style={{fontSize: 40}}>🔍</Text>
        </View>
        <View style={styles.welcomeScreenButtonsContainer}>
          <TouchableOpacity style={[styles.buttonLoginWelcome, styles.buttonNavy]} onPress={() => this.login()}>
            <Text style={[styles.buttonLabel, styles.buttonLabelWhite]}>L O G  I N</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonLoginWelcome, styles.buttonWineRed]} onPress={() => this.register()}>
            <Text style={[styles.buttonLabel, styles.buttonLabelBlack]}>S I G N  U P</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#a9ffe3',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  welcomeScreenButtonsContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  welcome: {
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'Arial',
    color: '#00004a',
    fontWeight: 'bold'
  },
  buttonLoginWelcome: {
    alignSelf: 'stretch',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonNavy: {
    backgroundColor: '#4a006e',
  },
  buttonWineRed: {
    backgroundColor: '#e3a9ff',
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },
  buttonLabelBlack: {
    color: 'black'
  },
  buttonLabelWhite: {
    color: 'white'
  }
});

export default Welcome;
