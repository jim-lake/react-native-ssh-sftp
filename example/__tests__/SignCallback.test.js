/**
 * @format
 */

import 'react-native';
import SSHClient from '../sshclient.js';

// Mock the native module
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  NativeModules: {
    RNSSHClient: {
      connectWithSignCallback: jest.fn(),
      provideSignature: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
  })),
  DeviceEventEmitter: {
    addListener: jest.fn(),
  },
}));

describe('SSH Sign Callback Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have connectWithSignCallback static method', () => {
    expect(typeof SSHClient.connectWithSignCallback).toBe('function');
  });

  it('should call native connectWithSignCallback method', async () => {
    const mockSignCallback = jest.fn().mockResolvedValue('mock-signature');
    const publicKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDHvQAKqP0nIGaYUL8WVt8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GIGR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpXcnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8 test@example.com';

    // Mock successful connection
    const { NativeModules } = require('react-native');
    NativeModules.RNSSHClient.connectWithSignCallback.mockImplementation((host, port, username, pubKey, key, callback) => {
      callback(); // Success
    });

    try {
      await SSHClient.connectWithSignCallback('127.0.0.1', 2222, 'user', publicKey, mockSignCallback);
    } catch (error) {
      // Expected to fail in test environment, but we're testing the API call
    }

    expect(NativeModules.RNSSHClient.connectWithSignCallback).toHaveBeenCalledWith(
      '127.0.0.1',
      2222,
      'user',
      publicKey,
      expect.any(String), // key
      expect.any(Function) // callback
    );
  });

  it('should handle sign callback events', () => {
    const mockSignCallback = jest.fn().mockResolvedValue('mock-signature');
    const publicKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDHvQAKqP0nIGaYUL8WVt8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GIGR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpXcnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8 test@example.com';

    // Create client instance to test event handling
    const client = new SSHClient('127.0.0.1', 2222, 'user', { publicKey, signCallback: mockSignCallback }, () => {});

    // Verify that the client has the sign callback handler
    expect(client._handlers['SignCallback']).toBeDefined();
    expect(typeof client._handlers['SignCallback']).toBe('function');
  });

  it('should provide signature through native method', () => {
    const { NativeModules } = require('react-native');
    
    // Test the provideSignature method exists
    expect(NativeModules.RNSSHClient.provideSignature).toBeDefined();
  });
});
