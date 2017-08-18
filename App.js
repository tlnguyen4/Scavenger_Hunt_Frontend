import React from 'react';
import { StackNavigator } from 'react-navigation';
import LoginScreen from './components/Login';
import WelcomeScreen from './components/Welcome';
import RegisterScreen from './components/Register';
import HomeScreen from './components/Home';
import NewHuntScreen from './components/NewHunt';

//Navigator
export default StackNavigator({
  Welcome: {
    screen: WelcomeScreen,
    navigationOptions: {
      headerLeft: null,
    }
  },
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerLeft: null,
    }
  },
  NewHunt: {
    screen: NewHuntScreen,
  },
}, {initialRouteName: 'Welcome'});
