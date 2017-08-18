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
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Location, Permissions, MapView } from 'expo';
import axios from 'axios';
const url = "https://damp-falls-88401.herokuapp.com/";

class JoinHunt extends React.Component {
  render() {
    return (
      <View>
        <Text>This is Join Hunt Screen</Text>
      </View>
    )
  }
}

export default JoinHunt;
