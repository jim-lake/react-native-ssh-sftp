var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import SSHClient from './sshclient.js';
export default function App() {
    const [status, setStatus] = useState('Ready');
    const testConnection = () => __awaiter(this, void 0, void 0, function* () {
        setStatus('Testing...');
        try {
            yield SSHClient.connectWithPassword('127.0.0.1', 22, 'test', 'test');
            setStatus('Connected');
        }
        catch (error) {
            setStatus('Native call successful (connection failed as expected)');
            Alert.alert('Success', 'Native SSH module is working correctly!');
        }
    });
    const testDockerConnection = () => __awaiter(this, void 0, void 0, function* () {
        setStatus('Testing Docker SSH...');
        try {
            const client = yield SSHClient.connectWithPassword('127.0.0.1', 2222, 'user', 'password');
            setStatus('Docker SSH Connected!');
            client.disconnect();
            Alert.alert('Success', 'Connected to Docker SSH server!');
        }
        catch (error) {
            setStatus(`Docker SSH Failed: ${error.message}`);
            Alert.alert('Error', `Failed to connect to Docker SSH: ${error.message}`);
        }
    });
    return (<View style={styles.container} testID="main-container">
      <Text style={styles.title} testID="title">SSH SFTP Example</Text>
      <Text style={styles.status} testID="status">Status: {status}</Text>
      <Button title="Test SSH Connection" onPress={testConnection} testID="test-button"/>
      <Button title="Test Docker SSH" onPress={testDockerConnection} testID="docker-test-button"/>
    </View>);
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
//# sourceMappingURL=App.js.map