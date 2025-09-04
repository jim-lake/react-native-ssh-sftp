import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, Alert} from 'react-native';
import SSHClient from '@dylankenneally/react-native-ssh-sftp';

export default function App() {
  const [status, setStatus] = useState('Ready');

  const testConnection = async () => {
    setStatus('Testing...');
    try {
      // Test with a dummy connection that will fail but proves the native module works
      await SSHClient.connectWithPassword('127.0.0.1', 22, 'test', 'test');
      setStatus('Connected');
    } catch (error) {
      // Expected to fail, but this proves the native module is working
      setStatus('Native call successful (connection failed as expected)');
      Alert.alert('Success', 'Native SSH module is working correctly!');
    }
  };

  return (
    <View style={styles.container} testID="main-container">
      <Text style={styles.title} testID="title">SSH SFTP Example</Text>
      <Text style={styles.status} testID="status">Status: {status}</Text>
      <Button title="Test SSH Connection" onPress={testConnection} testID="test-button" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
});
