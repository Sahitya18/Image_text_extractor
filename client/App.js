import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ImageTextExtractor from './components/ImageTextExtractor';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageTextExtractor />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
