var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Platform, NativeModules, NativeEventEmitter, } from 'react-native';
const NATIVE_EVENT_SHELL = 'Shell';
const NATIVE_EVENT_DOWNLOAD_PROGRESS = 'DownloadProgress';
const NATIVE_EVENT_UPLOAD_PROGRESS = 'UploadProgress';
const NATIVE_EVENT_SIGN_CALLBACK = 'SignCallback';
let RNSSHClient = NativeModules.RNSSHClient;
let RNSSHClientEmitter = new NativeEventEmitter(RNSSHClient);
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
 * SSH error codes based on libssh2 and JSch error constants
 */
export var SSHErrorCode;
(function (SSHErrorCode) {
    // Success
    SSHErrorCode[SSHErrorCode["SSH_OK"] = 0] = "SSH_OK";
    // Connection errors (libssh2)
    SSHErrorCode[SSHErrorCode["SSH_SOCKET_NONE"] = -1] = "SSH_SOCKET_NONE";
    SSHErrorCode[SSHErrorCode["SSH_BANNER_RECV"] = -2] = "SSH_BANNER_RECV";
    SSHErrorCode[SSHErrorCode["SSH_BANNER_SEND"] = -3] = "SSH_BANNER_SEND";
    SSHErrorCode[SSHErrorCode["SSH_INVALID_MAC"] = -4] = "SSH_INVALID_MAC";
    SSHErrorCode[SSHErrorCode["SSH_KEX_FAILURE"] = -5] = "SSH_KEX_FAILURE";
    SSHErrorCode[SSHErrorCode["SSH_ALLOC"] = -6] = "SSH_ALLOC";
    SSHErrorCode[SSHErrorCode["SSH_SOCKET_SEND"] = -7] = "SSH_SOCKET_SEND";
    SSHErrorCode[SSHErrorCode["SSH_KEY_EXCHANGE_FAILURE"] = -8] = "SSH_KEY_EXCHANGE_FAILURE";
    SSHErrorCode[SSHErrorCode["SSH_TIMEOUT"] = -9] = "SSH_TIMEOUT";
    SSHErrorCode[SSHErrorCode["SSH_HOSTKEY_INIT"] = -10] = "SSH_HOSTKEY_INIT";
    SSHErrorCode[SSHErrorCode["SSH_HOSTKEY_SIGN"] = -11] = "SSH_HOSTKEY_SIGN";
    SSHErrorCode[SSHErrorCode["SSH_DECRYPT"] = -12] = "SSH_DECRYPT";
    SSHErrorCode[SSHErrorCode["SSH_SOCKET_DISCONNECT"] = -13] = "SSH_SOCKET_DISCONNECT";
    SSHErrorCode[SSHErrorCode["SSH_PROTO"] = -14] = "SSH_PROTO";
    SSHErrorCode[SSHErrorCode["SSH_PASSWORD_EXPIRED"] = -15] = "SSH_PASSWORD_EXPIRED";
    SSHErrorCode[SSHErrorCode["SSH_FILE"] = -16] = "SSH_FILE";
    SSHErrorCode[SSHErrorCode["SSH_METHOD_NONE"] = -17] = "SSH_METHOD_NONE";
    SSHErrorCode[SSHErrorCode["SSH_AUTHENTICATION_FAILED"] = -18] = "SSH_AUTHENTICATION_FAILED";
    SSHErrorCode[SSHErrorCode["SSH_PUBLICKEY_UNVERIFIED"] = -19] = "SSH_PUBLICKEY_UNVERIFIED";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_OUTOFORDER"] = -20] = "SSH_CHANNEL_OUTOFORDER";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_FAILURE"] = -21] = "SSH_CHANNEL_FAILURE";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_REQUEST_DENIED"] = -22] = "SSH_CHANNEL_REQUEST_DENIED";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_UNKNOWN"] = -23] = "SSH_CHANNEL_UNKNOWN";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_WINDOW_EXCEEDED"] = -24] = "SSH_CHANNEL_WINDOW_EXCEEDED";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_PACKET_EXCEEDED"] = -25] = "SSH_CHANNEL_PACKET_EXCEEDED";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_CLOSED"] = -26] = "SSH_CHANNEL_CLOSED";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_EOF_SENT"] = -27] = "SSH_CHANNEL_EOF_SENT";
    SSHErrorCode[SSHErrorCode["SSH_SCP_PROTOCOL"] = -28] = "SSH_SCP_PROTOCOL";
    SSHErrorCode[SSHErrorCode["SSH_ZLIB"] = -29] = "SSH_ZLIB";
    SSHErrorCode[SSHErrorCode["SSH_SOCKET_TIMEOUT"] = -30] = "SSH_SOCKET_TIMEOUT";
    SSHErrorCode[SSHErrorCode["SSH_SFTP_PROTOCOL"] = -31] = "SSH_SFTP_PROTOCOL";
    SSHErrorCode[SSHErrorCode["SSH_REQUEST_DENIED"] = -32] = "SSH_REQUEST_DENIED";
    SSHErrorCode[SSHErrorCode["SSH_METHOD_NOT_SUPPORTED"] = -33] = "SSH_METHOD_NOT_SUPPORTED";
    SSHErrorCode[SSHErrorCode["SSH_INVAL"] = -34] = "SSH_INVAL";
    SSHErrorCode[SSHErrorCode["SSH_INVALID_POLL_TYPE"] = -35] = "SSH_INVALID_POLL_TYPE";
    SSHErrorCode[SSHErrorCode["SSH_PUBLICKEY_PROTOCOL"] = -36] = "SSH_PUBLICKEY_PROTOCOL";
    SSHErrorCode[SSHErrorCode["SSH_EAGAIN"] = -37] = "SSH_EAGAIN";
    SSHErrorCode[SSHErrorCode["SSH_BUFFER_TOO_SMALL"] = -38] = "SSH_BUFFER_TOO_SMALL";
    SSHErrorCode[SSHErrorCode["SSH_BAD_USE"] = -39] = "SSH_BAD_USE";
    SSHErrorCode[SSHErrorCode["SSH_COMPRESS"] = -40] = "SSH_COMPRESS";
    SSHErrorCode[SSHErrorCode["SSH_OUT_OF_BOUNDARY"] = -41] = "SSH_OUT_OF_BOUNDARY";
    SSHErrorCode[SSHErrorCode["SSH_AGENT_PROTOCOL"] = -42] = "SSH_AGENT_PROTOCOL";
    SSHErrorCode[SSHErrorCode["SSH_SOCKET_RECV"] = -43] = "SSH_SOCKET_RECV";
    SSHErrorCode[SSHErrorCode["SSH_ENCRYPT"] = -44] = "SSH_ENCRYPT";
    SSHErrorCode[SSHErrorCode["SSH_BAD_SOCKET"] = -45] = "SSH_BAD_SOCKET";
    SSHErrorCode[SSHErrorCode["SSH_KNOWN_HOSTS"] = -46] = "SSH_KNOWN_HOSTS";
    SSHErrorCode[SSHErrorCode["SSH_CHANNEL_WINDOW_FULL"] = -47] = "SSH_CHANNEL_WINDOW_FULL";
    SSHErrorCode[SSHErrorCode["SSH_KEYFILE_AUTH_FAILED"] = -48] = "SSH_KEYFILE_AUTH_FAILED";
    SSHErrorCode[SSHErrorCode["SSH_RANDGEN"] = -49] = "SSH_RANDGEN";
    SSHErrorCode[SSHErrorCode["SSH_MISSING_USERAUTH_BANNER"] = -50] = "SSH_MISSING_USERAUTH_BANNER";
    SSHErrorCode[SSHErrorCode["SSH_ALGO_UNSUPPORTED"] = -51] = "SSH_ALGO_UNSUPPORTED";
    // SFTP errors (libssh2)
    SSHErrorCode[SSHErrorCode["SFTP_EOF"] = 1] = "SFTP_EOF";
    SSHErrorCode[SSHErrorCode["SFTP_NO_SUCH_FILE"] = 2] = "SFTP_NO_SUCH_FILE";
    SSHErrorCode[SSHErrorCode["SFTP_PERMISSION_DENIED"] = 3] = "SFTP_PERMISSION_DENIED";
    SSHErrorCode[SSHErrorCode["SFTP_FAILURE"] = 4] = "SFTP_FAILURE";
    SSHErrorCode[SSHErrorCode["SFTP_BAD_MESSAGE"] = 5] = "SFTP_BAD_MESSAGE";
    SSHErrorCode[SSHErrorCode["SFTP_NO_CONNECTION"] = 6] = "SFTP_NO_CONNECTION";
    SSHErrorCode[SSHErrorCode["SFTP_CONNECTION_LOST"] = 7] = "SFTP_CONNECTION_LOST";
    SSHErrorCode[SSHErrorCode["SFTP_OP_UNSUPPORTED"] = 8] = "SFTP_OP_UNSUPPORTED";
    SSHErrorCode[SSHErrorCode["SFTP_INVALID_HANDLE"] = 9] = "SFTP_INVALID_HANDLE";
    SSHErrorCode[SSHErrorCode["SFTP_NO_SUCH_PATH"] = 10] = "SFTP_NO_SUCH_PATH";
    SSHErrorCode[SSHErrorCode["SFTP_FILE_ALREADY_EXISTS"] = 11] = "SFTP_FILE_ALREADY_EXISTS";
    SSHErrorCode[SSHErrorCode["SFTP_WRITE_PROTECT"] = 12] = "SFTP_WRITE_PROTECT";
    SSHErrorCode[SSHErrorCode["SFTP_NO_MEDIA"] = 13] = "SFTP_NO_MEDIA";
    SSHErrorCode[SSHErrorCode["SFTP_NO_SPACE_ON_FILESYSTEM"] = 14] = "SFTP_NO_SPACE_ON_FILESYSTEM";
    SSHErrorCode[SSHErrorCode["SFTP_QUOTA_EXCEEDED"] = 15] = "SFTP_QUOTA_EXCEEDED";
    SSHErrorCode[SSHErrorCode["SFTP_UNKNOWN_PRINCIPAL"] = 16] = "SFTP_UNKNOWN_PRINCIPAL";
    SSHErrorCode[SSHErrorCode["SFTP_LOCK_CONFLICT"] = 17] = "SFTP_LOCK_CONFLICT";
    SSHErrorCode[SSHErrorCode["SFTP_DIR_NOT_EMPTY"] = 18] = "SFTP_DIR_NOT_EMPTY";
    SSHErrorCode[SSHErrorCode["SFTP_NOT_A_DIRECTORY"] = 19] = "SFTP_NOT_A_DIRECTORY";
    SSHErrorCode[SSHErrorCode["SFTP_INVALID_FILENAME"] = 20] = "SFTP_INVALID_FILENAME";
    SSHErrorCode[SSHErrorCode["SFTP_LINK_LOOP"] = 21] = "SFTP_LINK_LOOP";
})(SSHErrorCode || (SSHErrorCode = {}));
/**
 * Creates an enhanced error object with errno and code if available
 */
function createSSHError(error) {
    var _a;
    if (typeof error === 'object' && error !== null) {
        if (error.message && typeof error.errno === 'number') {
            const sshError = new Error(error.message);
            sshError.errno = error.errno;
            sshError.code = (_a = SSHErrorCode[error.errno]) !== null && _a !== void 0 ? _a : 'UNKNOWN_ERROR';
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
    static setClient(new_client, new_emitter) {
        RNSSHClient = new_client;
        RNSSHClientEmitter = new_emitter;
    }
    static getKeyDetails(key) {
        return new Promise((resolve, reject) => {
            RNSSHClient.getKeyDetails(key)
                .then((result) => {
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
        console.log('=== SSHClient.handleEvent called ===');
        console.log('Event:', JSON.stringify(event, null, 2));
        console.log('Event name:', event.name);
        console.log('Event key:', event.key);
        console.log('This._key:', this._key);
        console.log('Keys match:', this._key === event.key);
        console.log('Handler exists for event name:', !!this._handlers[event.name]);
        if (this._handlers[event.name] && this._key === event.key) {
            console.log('Calling handler for event:', event.name);
            this._handlers[event.name](event.value, event);
        }
        else {
            console.log('Handler not called - handler exists:', !!this._handlers[event.name], 'keys match:', this._key === event.key);
        }
    }
    /**
     * Registers an event handler for the specified event.
     *
     * @param eventName - The name of the event.
     * @param handler - The event handler function.
     */
    on(eventName, handler) {
        console.log('=== SSHClient.on called ===');
        console.log('Event name:', eventName);
        console.log('Handler type:', typeof handler);
        console.log('Client key:', this._key);
        this._handlers[eventName] = handler;
        console.log('Handler registered for:', eventName);
        console.log('Total handlers:', Object.keys(this._handlers).length);
    }
    /**
     * Registers a native listener for the specified event name.
     *
     * @param eventName - The name of the event to listen for.
     */
    registerNativeListener(eventName) {
        console.log('=== registerNativeListener called ===');
        console.log('Event name:', eventName);
        console.log('Client key:', this._key);
        console.log('Existing listener:', !!this._listeners[eventName]);
        this._listeners[eventName] = RNSSHClientEmitter.addListener(eventName, this.handleEvent.bind(this));
        console.log('Listener registered for:', eventName);
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
    handleSignCallback(signCallback, _value, event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('=== handleSignCallback called ===');
            console.log('Event:', JSON.stringify(event, null, 2));
            console.log('SignCallback function:', typeof signCallback);
            console.log('Event key:', event.key);
            console.log('This key:', this._key);
            console.log('Keys match:', event.key === this._key);
            console.log('Event requestId:', event.requestId);
            console.log('Event data length:', event.data ? event.data.length : 0);
            console.log('Event data (first 100 chars):', event.data ? event.data.substring(0, 100) : 'null');
            try {
                console.log('Calling signCallback with data...');
                const signature = yield signCallback(event.data);
                console.log('SignCallback returned signature length:', signature ? signature.length : 0);
                console.log('Signature (first 100 chars):', signature ? signature.substring(0, 100) : 'null');
                console.log('Calling RNSSHClient.provideSignature...');
                RNSSHClient.provideSignature(event.requestId, signature);
                console.log('provideSignature call completed');
            }
            catch (error) {
                console.error('SignCallback error:', error);
                console.log('Providing empty signature due to error');
                RNSSHClient.provideSignature(event.requestId, '');
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
        console.log('=== authenticateWithSignCallback called ===');
        console.log('Public key length:', publicKey ? publicKey.length : 0);
        console.log('SignCallback type:', typeof signCallback);
        console.log('Client key:', this._key);
        return new Promise((resolve, reject) => {
            // Set up sign callback listener for both platforms
            console.log('Registering SignCallback listener...');
            this.registerNativeListener(NATIVE_EVENT_SIGN_CALLBACK);
            console.log('Setting up event handler...');
            this.on('SignCallback', this.handleSignCallback.bind(this, signCallback));
            console.log('Calling native authenticateWithSignCallback...');
            RNSSHClient.authenticateWithSignCallback(publicKey, this._key, (error) => {
                console.log('Native authenticateWithSignCallback callback called');
                console.log('Error:', error);
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