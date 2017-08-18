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
  static navigationOptions = (props) => ({
    title: 'Joined Hunt',
  })

  render() {
    return (
      <View style={styles.container}>
        <Text>This is Join Hunt Screen</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffb8a9',
    flex: 1,
    flexDirection: 'column'
  },
})

export default JoinHunt;
