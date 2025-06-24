import React, { useState } from 'react';
import { View, Button, Image, Text, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ImageTextExtractor() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();

    if (!mediaPerm.granted || !cameraPerm.granted) {
      Alert.alert("Permission Denied", "Camera and gallery access are required!");
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaType.IMAGE,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const captureImageFromCamera = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.16:5000/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to extract text.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonContainer}>
         <View style={{ marginVertical: 90 }} />
        <Button title="Pick from Gallery" onPress={pickImageFromGallery} />
        <View style={{ marginVertical: 8 }} />
        <Button title="Take Photo" onPress={captureImageFromCamera} />
      </View>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.image} />
      )}

      {image && (
        <View style={{ marginTop: 10 }}>
          <Button title="Extract Text" onPress={uploadImage} />
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Extracted Text:</Text>
          <Text selectable>{result.text}</Text>
          <Text style={styles.confidence}>Confidence: {result.confidence}%</Text>
          <Text>Character Count: {result.character_count}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginTop: 20,
    borderRadius: 10,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidence: {
    marginTop: 10,
    fontStyle: 'italic',
  },
});
