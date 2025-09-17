var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Platform, NativeModules, NativeEventEmitter, DeviceEventEmitter, } from 'react-native';
const { RNSSHClient } = NativeModules;
const RNSSHClientEmitter = new NativeEventEmitter(RNSSHClient);
const NATIVE_EVENT_SHELL = 'Shell';
const NATIVE_EVENT_DOWNLOAD_PROGRESS = 'DownloadProgress';
const NATIVE_EVENT_UPLOAD_PROGRESS = 'UploadProgress';
const NATIVE_EVENT_SIGN_CALLBACK = 'SignCallback';
/**
 * Represents the types of PTY (pseudo-terminal) for SSH connections.
 */
export var PtyType;
(function (PtyType) {
    PtyType["VANILLA"] = "vanilla";
    PtyType["VT100"] = "vt100";
    PtyType["VT102"] = "vt102";
    PtyType["VT220"] = "vt220";
    PtyType["ANSI"] = "ansi";
    PtyType["XTERM"] = "xterm";
})(PtyType || (PtyType = {}));
/**
 * Creates an enhanced error object with errno if available
 */
function createSSHError(error) {
    if (typeof error === 'object' && error !== null) {
        if (error.message && typeof error.errno === 'number') {
            const sshError = new Error(error.message);
            sshError.errno = error.errno;
            return sshError;
        }
    }
    if (typeof error === 'string') {
        return new Error(error);
    }
    return error;
}
/**
 * Represents an SSH client that can connect to a remote server and perform various operations.
 * Instances of SSHClient are created using the following factory functions:
 * - SSHClient.connect() - connects to host
 * - client.authenticateWithPassword() - authenticates with password
 * - client.authenticateWithKey() - authenticates with key
 * - client.authenticateWithSignCallback() - authenticates with sign callback
 *
 * Legacy methods (deprecated):
 * - SSHClient.connectWithKey()
 * - SSHClient.connectWithPassword()
 */
export default class SSHClient {
    /**
     * Retrieves the details of an SSH key.
     * @param key - The SSH private key as a string.
     * @returns A Promise that resolves to the details of the key, including its type and size.
     */
    static getKeyDetails(key) {
        return new Promise((resolve, reject) => {
            RNSSHClient.getKeyDetails(key)
                .then((result) => {
                /* eslint-disable no-console */
                console.log(result);
                /* eslint-enable no-console */
                resolve({ keyType: result.keyType, keySize: result.keySize || 0 });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    static generateKeyPair(type, passphrase, keySize, comment) {
        return new Promise((resolve, reject) => {
            RNSSHClient.generateKeyPair(type, passphrase, keySize, comment, (error, keys) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({
                        privateKey: keys.privateKey || '',
                        publicKey: keys.publicKey,
                    });
                }
            });
        });
    }
    /**
     * Connects to an SSH server without authentication.
     *
     * @param host - The hostname or IP address of the SSH server.
     * @param port - The port number of the SSH server.
     * @param username - The username for authentication.
     * @param callback - A callback function to handle the connection result (optional).
     *
     * @returns A Promise that resolves to an instance of SSHClient if the connection is successful.
     *          Otherwise, it rejects with an error.
     */
    static connect(host, port, username, callback) {
        return new Promise((resolve, reject) => {
            const result = new SSHClient(host, port, username, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
    /**
     * Connects to an SSH server using a sign callback for authentication.
     * @deprecated Use SSHClient.connect() followed by authenticateWithSignCallback()
     *
     * @param host - The hostname or IP address of the SSH server.
     * @param port - The port number of the SSH server.
     * @param username - The username for authentication.
     * @param publicKey - The public key for authentication.
     * @param signCallback - A callback function that signs data and returns the signature.
     * @param callback - A callback function to handle the connection result (optional).
     *
     * @returns A Promise that resolves to an instance of SSHClient if the connection is successful.
     *          Otherwise, it rejects with an error.
     */
    static connectWithSignCallback(host, port, username, publicKey, signCallback, callback) {
        return new Promise((resolve, reject) => {
            const result = new SSHClient(host, port, username, { publicKey, signCallback }, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
    /**
     * Connects to an SSH server using a private key for authentication.
     * @deprecated Use SSHClient.connect() followed by authenticateWithKey()
     *
     * @param host - The hostname or IP address of the SSH server.
     * @param port - The port number of the SSH server.
     * @param username - The username for authentication.
     * @param privateKey - The private key for authentication.
     * @param passphrase - The passphrase for the private key (optional).
     * @param callback - A callback function to handle the connection result (optional).
     *
     * @returns A Promise that resolves to an instance of SSHClient if the connection is successful.
     *          Otherwise, it rejects with an error.
     */
    static connectWithKey(host, port, username, privateKey, passphrase, callback) {
        return new Promise((resolve, reject) => {
            const result = new SSHClient(host, port, username, { privateKey, passphrase }, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
    /**
     * Connects to an SSH server using password authentication.
     * @deprecated Use SSHClient.connect() followed by authenticateWithPassword()
     *
     * @param host - The hostname or IP address of the SSH server.
     * @param port - The port number of the SSH server.
     * @param username - The username for authentication.
     * @param password - The password for authentication.
     * @param callback - Optional callback function to handle any errors during the connection process.
     * @returns A Promise that resolves to an instance of SSHClient if the connection is successful.
     * @throws If there is an error during the connection process.
     */
    static connectWithPassword(host, port, username, password, callback) {
        return new Promise((resolve, reject) => {
            const result = new SSHClient(host, port, username, password, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
    constructor(host, port, username, passwordOrKeyOrCallback, callback) {
        this._key = SSHClient.getRandomClientKey();
        this._listeners = {};
        this._counters = { download: 0, upload: 0 };
        this._activeStream = { sftp: false, shell: false };
        this._handlers = {};
        this.host = host;
        this.port = port;
        this.username = username;
        this._isAuthenticated = false;
        // Handle both new and legacy constructor signatures
        if (typeof passwordOrKeyOrCallback === 'function') {
            // New signature: connect only
            this.connectToHost(passwordOrKeyOrCallback);
        }
        else {
            // Legacy signature: connect and authenticate
            const passwordOrKey = passwordOrKeyOrCallback;
            const cb = callback;
            // Set up sign callback listener if needed
            if (typeof passwordOrKey === 'object' && passwordOrKey.signCallback) {
                this.registerNativeListener(NATIVE_EVENT_SIGN_CALLBACK);
                this.on('SignCallback', this.handleSignCallback.bind(this, passwordOrKey.signCallback));
            }
            this.connectAndAuthenticate(passwordOrKey, cb);
        }
    }
    /**
     * Generates a random client key, used to identify which callback match with which instance.
     * Uses crypto-secure random generation for better uniqueness.
     *
     * @returns A string representing the random client key.
     */
    static getRandomClientKey() {
        // Generate a crypto-secure random key using timestamp + random
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `${timestamp}-${random}`;
    }
    /**
     * Handles a native event (callback).
     *
     * @param event The native event to handle.
     */
    handleEvent(event) {
        if (this._handlers[event.name] && this._key === event.key) {
            this._handlers[event.name](event.value);
        }
    }
    /**
     * Registers an event handler for the specified event.
     *
     * @param eventName - The name of the event.
     * @param handler - The event handler function.
     */
    on(eventName, handler) {
        this._handlers[eventName] = handler;
    }
    /**
     * Registers a native listener for the specified event name.
     *
     * @param eventName - The name of the event to listen for.
     */
    registerNativeListener(eventName) {
        const listenerInterface = Platform.OS === 'ios' ? RNSSHClientEmitter : DeviceEventEmitter;
        this._listeners[eventName] = listenerInterface.addListener(eventName, this.handleEvent.bind(this));
    }
    /**
     * Unregisters a native listener for the specified event name.
     * @param eventName - The name of the event.
     */
    unregisterNativeListener(eventName) {
        const listener = this._listeners[eventName];
        if (listener) {
            listener.remove();
            delete this._listeners[eventName];
        }
    }
    /**
     * Handles a sign callback event from the native layer.
     *
     * @param signCallback - The sign callback function to use.
     * @param event - The sign callback event from native.
     */
    handleSignCallback(signCallback, event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signature = yield signCallback(event.data);
                RNSSHClient.provideSignature(event.requestId, signature);
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('Sign callback failed:', error);
                RNSSHClient.provideSignature(event.requestId, ''); // Provide empty signature on error
            }
        });
    }
    /**
     * Connects to the SSH server without authentication (new API).
     *
     * @param callback - The callback function to be called after the connection attempt.
     */
    connectToHost(callback) {
        RNSSHClient.connectToHost(this.host, this.port, this.username, this._key, (error) => {
            callback(error ? createSSHError(error) : null);
        });
    }
    /**
     * Connects to the SSH server using the provided password or key (legacy API).
     *
     * @param passwordOrKey - The password or key to authenticate with the server.
     * @param callback - The callback function to be called after the connection attempt.
     */
    connectAndAuthenticate(passwordOrKey, callback) {
        if (Platform.OS === 'android') {
            this.connectAndAuthenticateAndroid(passwordOrKey, callback);
            return;
        }
        // iOS - use legacy method
        this.connectAndAuthenticateIOS(passwordOrKey, callback);
    }
    /**
     * Android-specific connection and authentication logic.
     */
    connectAndAuthenticateAndroid(passwordOrKey, callback) {
        if (typeof passwordOrKey === 'string') {
            RNSSHClient.connectToHostByPassword(this.host, this.port, this.username, passwordOrKey, this._key, (error) => {
                if (!error)
                    this._isAuthenticated = true;
                callback(error ? createSSHError(error) : null);
            });
        }
        else {
            RNSSHClient.connectToHostByKey(this.host, this.port, this.username, passwordOrKey, this._key, (error) => {
                if (!error)
                    this._isAuthenticated = true;
                callback(error ? createSSHError(error) : null);
            });
        }
    }
    /**
     * iOS-specific connection and authentication logic.
     */
    connectAndAuthenticateIOS(passwordOrKey, callback) {
        if (typeof passwordOrKey === 'object' &&
            passwordOrKey.signCallback &&
            passwordOrKey.publicKey) {
            RNSSHClient.connectWithSignCallback(this.host, this.port, this.username, passwordOrKey.publicKey, this._key, (error) => {
                if (!error)
                    this._isAuthenticated = true;
                callback(error ? createSSHError(error) : null);
            });
        }
        else {
            RNSSHClient.connectToHostLegacy(this.host, this.port, this.username, passwordOrKey, this._key, (error) => {
                if (!error)
                    this._isAuthenticated = true;
                callback(error ? createSSHError(error) : null);
            });
        }
    }
    /**
     * Authenticates with the SSH server using a password.
     *
     * @param password - The password for authentication.
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithPassword(password, callback) {
        return new Promise((resolve, reject) => {
            RNSSHClient.authenticateWithPassword(password, this._key, (error) => {
                if (callback) {
                    callback(error ? createSSHError(error) : null);
                }
                if (error) {
                    return reject(createSSHError(error));
                }
                this._isAuthenticated = true;
                resolve();
            });
        });
    }
    /**
     * Authenticates with the SSH server using a private key.
     *
     * @param privateKey - The private key for authentication.
     * @param passphrase - The passphrase for the private key (optional).
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithKey(privateKey, passphrase, callback) {
        return new Promise((resolve, reject) => {
            const keyPair = { privateKey, passphrase };
            RNSSHClient.authenticateWithKey(keyPair, this._key, (error) => {
                if (callback) {
                    callback(error ? createSSHError(error) : null);
                }
                if (error) {
                    return reject(createSSHError(error));
                }
                this._isAuthenticated = true;
                resolve();
            });
        });
    }
    /**
     * Authenticates with the SSH server using a sign callback.
     *
     * @param publicKey - The public key for authentication.
     * @param signCallback - A callback function that signs data and returns the signature.
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithSignCallback(publicKey, signCallback, callback) {
        return new Promise((resolve, reject) => {
            // Set up sign callback listener for both platforms
            this.registerNativeListener(NATIVE_EVENT_SIGN_CALLBACK);
            this.on('SignCallback', this.handleSignCallback.bind(this, signCallback));
            RNSSHClient.authenticateWithSignCallback(publicKey, this._key, (error) => {
                if (callback) {
                    callback(error ? createSSHError(error) : null);
                }
                if (error) {
                    return reject(createSSHError(error));
                }
                this._isAuthenticated = true;
                resolve();
            });
        });
    }
    /**
     * Checks if the client is authenticated.
     * @returns true if authenticated, false otherwise.
     */
    isAuthenticated() {
        return this._isAuthenticated;
    }
    /**
     * Executes a command on the SSH server.
     * @param command The command to execute.
     * @param callback Optional callback function to handle the result asynchronously.
     * @returns A promise that resolves with the response from the server.
     */
    execute(command, callback) {
        if (!this._isAuthenticated) {
            const error = new Error('Client is not authenticated');
            if (callback)
                callback(error);
            return Promise.reject(error);
        }
        return new Promise((resolve, reject) => {
            RNSSHClient.execute(command, this._key, (error, response) => {
                if (callback) {
                    callback(error, response);
                }
                if (error) {
                    return reject(error);
                }
                resolve(response);
            });
        });
    }
    /**
     * Starts a shell session on the SSH server.
     * @param ptyType - The type of pseudo-terminal to use for the shell session.
     * @param callback - Optional callback function to handle the response.
     * @returns A promise that resolves with the response from the server.
     */
    startShell(ptyType, callback) {
        if (this._activeStream.shell) {
            return Promise.resolve('');
        }
        return new Promise((resolve, reject) => {
            this.registerNativeListener(NATIVE_EVENT_SHELL);
            RNSSHClient.startShell(this._key, ptyType, (error, response) => {
                if (callback) {
                    callback(error, response);
                }
                if (error) {
                    return reject(error);
                }
                this._activeStream.shell = true;
                resolve(response);
            });
        });
    }
    /**
     * Checks if the shell is active. If the shell is already active, it returns an empty string.
     * Otherwise, it starts a new shell and returns the result.
     * @param callback Optional callback function to handle errors.
     * @returns A promise that resolves to a string representing the result of the shell check.
     */
    checkShell(callback) {
        if (this._activeStream.shell) {
            return Promise.resolve('');
        }
        return this.startShell(PtyType.VANILLA)
            .then((res) => (res ? res + '\n' : ''))
            .catch((error) => {
            if (callback) {
                callback(error);
            }
            throw error;
        });
    }
    /**
     * Writes a command to the shell.
     * @param command - The command to write to the shell.
     * @param callback - Optional callback function to handle the response.
     * @returns A promise that resolves with the response from the shell.
     */
    writeToShell(command, callback) {
        return this.checkShell(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.writeToShell(command, this._key, (error, response) => {
                if (callback) {
                    callback(error, response);
                }
                if (error) {
                    return reject(error);
                }
                resolve(response);
            });
        }));
    }
    /**
     * Closes the SSH shell.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when the shell is closed.
     */
    closeShell(callback) {
        return new Promise((resolve, reject) => {
            this.unregisterNativeListener(NATIVE_EVENT_SHELL);
            // Try new callback-based method first, fallback to old method
            try {
                RNSSHClient.closeShell(this._key, (error) => {
                    this._activeStream.shell = false;
                    if (callback) {
                        callback(error);
                    }
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
            catch (_a) {
                // Fallback to old method without callback
                RNSSHClient.closeShell(this._key);
                this._activeStream.shell = false;
                if (callback)
                    callback(null);
                resolve();
            }
        });
    }
    /**
     * Connects to the SFTP server.
     *
     * It is not mandatory to call this method before calling any SFTP method.
     * @param callback - Optional callback function to be called after the connection is established.
     * @returns A promise that resolves when the connection is established successfully, or rejects with an error if the connection fails.
     */
    connectSFTP(callback) {
        if (!this._isAuthenticated) {
            const error = new Error('Client is not authenticated');
            if (callback)
                callback(error);
            return Promise.reject(error);
        }
        if (this._activeStream.sftp) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            RNSSHClient.connectSFTP(this._key, (error) => {
                this._activeStream.sftp = true;
                this.registerNativeListener(NATIVE_EVENT_DOWNLOAD_PROGRESS);
                this.registerNativeListener(NATIVE_EVENT_UPLOAD_PROGRESS);
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }
    /**
     * Checks if SFTP is active. If not, it connects to SFTP.
     * @param callback - Optional callback function to handle errors.
     * @returns A promise that resolves when SFTP is active or rejects with an error.
     */
    checkSFTP(callback) {
        if (this._activeStream.sftp) {
            return Promise.resolve();
        }
        return this.connectSFTP().catch((error) => {
            if (callback) {
                callback(error);
            }
            throw error;
        });
    }
    /**
     * Lists the files and directories in the specified path using SFTP.
     * @param path - The path to list.
     * @param callback - Optional callback function to handle the result asynchronously.
     * @returns A promise that resolves to the result of the SFTP listing operation.
     */
    sftpLs(path, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpLs(path, this._key, (error, _response) => {
                const response = _response
                    ? _response.map((p) => {
                        // eslint-disable-next-line no-control-regex -- Control characters are removed from the response, because they can make JSON.parse fail
                        return JSON.parse(p.replace(/[\u0000-\u001F]/g, ''));
                    })
                    : undefined;
                if (callback) {
                    callback(error, response);
                }
                if (error) {
                    return reject(error);
                }
                resolve(response);
            });
        }));
    }
    /**
     * Renames a file or directory on the remote server using SFTP.
     * @param oldPath The current path of the file or directory.
     * @param newPath The new path to rename the file or directory to.
     * @param callback An optional callback function to handle the result or error.
     * @returns A Promise that resolves when the file or directory is successfully renamed.
     */
    sftpRename(oldPath, newPath, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpRename(oldPath, newPath, this._key, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Creates a directory on the remote server using SFTP.
     * @param path - The path of the directory to create.
     * @param callback - An optional callback function to handle the result.
     * @returns A promise that resolves when the directory is created successfully.
     */
    sftpMkdir(path, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpMkdir(path, this._key, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Removes (unlinks) a file from the remote server using SFTP.
     * @param path - The path of the file to remove.
     * @param callback - An optional callback function to handle the result or error.
     * @returns A promise that resolves when the file is successfully removed.
     */
    sftpRm(path, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpRm(path, this._key, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Removes a directory on the remote server using SFTP.
     * @param path - The path of the directory to remove.
     * @param callback - Optional callback function to handle the result or error.
     * @returns A promise that resolves when the directory is successfully removed.
     */
    sftpRmdir(path, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpRmdir(path, this._key, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Changes the permissions of a file or directory on the remote server using SFTP.
     *
     * Only available on Android.
     * @param path - The path of the file or directory.
     * @param permissions - The new permissions to set.
     * @param callback - An optional callback function to handle the result or error.
     * @returns A Promise that resolves when the permissions are successfully changed.
     */
    sftpChmod(path, permissions, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            RNSSHClient.sftpChmod(path, permissions, this._key, (error) => {
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Uploads a file from the local file system to the remote file system using SFTP.
     * @param localFilePath - The path of the file on the local file system.
     * @param remoteFilePath - The path of the file on the remote file system.
     * @param callback - An optional callback function to be called after the upload is complete or an error occurs.
     * @returns A Promise that resolves when the upload is complete or rejects with an error.
     */
    sftpUpload(localFilePath, remoteFilePath, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            ++this._counters.upload;
            RNSSHClient.sftpUpload(localFilePath, remoteFilePath, this._key, (error) => {
                --this._counters.upload;
                if (callback) {
                    callback(error);
                }
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }));
    }
    /**
     * Cancels the ongoing SFTP upload.
     */
    sftpCancelUpload() {
        if (this._counters.upload > 0) {
            RNSSHClient.sftpCancelUpload(this._key);
        }
    }
    /**
     * Downloads a file from the remote server using SFTP.
     * @param remoteFilePath - The path of the file on the remote server.
     * @param localFilePath - The path where the file will be saved locally.
     * @param callback - An optional callback function to handle the result of the download.
     * @returns A promise that resolves with the response string when the download is complete.
     */
    sftpDownload(remoteFilePath, localFilePath, callback) {
        return this.checkSFTP(callback).then(() => new Promise((resolve, reject) => {
            ++this._counters.download;
            RNSSHClient.sftpDownload(remoteFilePath, localFilePath, this._key, (error, response) => {
                --this._counters.download;
                if (callback) {
                    callback(error, response);
                }
                if (error) {
                    return reject(error);
                }
                resolve(response);
            });
        }));
    }
    /**
     * Cancels the ongoing SFTP download operation.
     */
    sftpCancelDownload() {
        if (this._counters.download > 0) {
            RNSSHClient.sftpCancelDownload(this._key);
        }
    }
    /**
     * Disconnects the SFTP connection.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when SFTP is disconnected.
     */
    disconnectSFTP(callback) {
        return new Promise((resolve, reject) => {
            this.unregisterNativeListener(NATIVE_EVENT_DOWNLOAD_PROGRESS);
            this.unregisterNativeListener(NATIVE_EVENT_UPLOAD_PROGRESS);
            if (Platform.OS === 'ios') {
                // iOS doesn't have explicit SFTP disconnect, it's handled by main disconnect
                this._activeStream.sftp = false;
                if (callback)
                    callback(null);
                resolve();
                return;
            }
            // Android has explicit SFTP disconnect
            try {
                RNSSHClient.disconnectSFTP(this._key, (error) => {
                    this._activeStream.sftp = false;
                    if (callback) {
                        callback(error);
                    }
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
            catch (_a) {
                // Fallback to old method without callback
                RNSSHClient.disconnectSFTP(this._key);
                this._activeStream.sftp = false;
                if (callback)
                    callback(null);
                resolve();
            }
        });
    }
    /**
     * Disconnects the SSH client.
     * If a shell is active, it will be closed.
     * If an SFTP connection is active, it will be disconnected.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when disconnection is complete.
     */
    disconnect(callback) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Close shell if active
                if (this._activeStream.shell) {
                    yield this.closeShell();
                }
                // Disconnect SFTP if active
                if (this._activeStream.sftp) {
                    yield this.disconnectSFTP();
                }
                // Disconnect main session
                try {
                    RNSSHClient.disconnect(this._key, (error) => {
                        this._isAuthenticated = false;
                        if (callback) {
                            callback(error);
                        }
                        if (error) {
                            return reject(error);
                        }
                        resolve();
                    });
                }
                catch (_a) {
                    // Fallback to old method without callback
                    RNSSHClient.disconnect(this._key);
                    this._isAuthenticated = false;
                    if (callback)
                        callback(null);
                    resolve();
                }
            }
            catch (error) {
                if (callback) {
                    callback(error);
                }
                reject(error);
            }
        }));
    }
}
//# sourceMappingURL=sshclient.js.map