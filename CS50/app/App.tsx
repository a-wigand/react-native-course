import React, { FunctionComponent } from 'react';
import { View, StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import SoundTestScreen from './screens/SoundTestScreen';
import store from 'store';

/**
 * Main part of the app - redux is accessible here
 */
const AppMain = () => {

  return (
    <SoundTestScreen></SoundTestScreen>
  );
};

/**
 * Shell around the app which injects the global redux store
 */
const App: FunctionComponent = () => (
  <View>
    <StatusBar barStyle="light-content" />
    <NavigationContainer>
      <AppMain />
    </NavigationContainer>
  </View>
);
export default App;
