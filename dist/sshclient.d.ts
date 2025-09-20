import { NativeEventEmitter } from 'react-native';
declare let RNSSHClient: any;
declare let RNSSHClientEmitter: NativeEventEmitter;
/**
 * Represents the types of PTY (pseudo-terminal) for SSH connections.
 */
export declare enum PtyType {
    VANILLA = "vanilla",
    VT100 = "vt100",
    VT102 = "vt102",
    VT220 = "vt220",
    ANSI = "ansi",
    XTERM = "xterm"
}
type CBError = any;
/**
 * Enhanced error type that includes errno from native layer
 */
export interface SSHError extends Error {
    errno?: number;
}
/**
 * Represents a callback function with an optional response.
 * @template T The type of the response.
 * @param error The error object, if any.
 * @param response The response object, if any.
 */
export type CallbackFunction<T> = (error: CBError, response?: T) => void;
/**
 * Represents an event handler function.
 * @param value - The value passed to the event handler.
 */
export type EventHandler = (value: any, event: any) => void;
/**
 * Represents the result of a directory listing operation.
 */
export interface LsResult {
    filename: string;
    isDirectory: boolean;
    modificationDate: string;
    lastAccess: string;
    fileSize: number;
    ownerUserID: number;
    ownerGroupID: number;
    flags: number;
}
/**
 * Represents a key pair used for SSH authentication.
 */
export interface KeyPair {
    privateKey?: string;
    publicKey?: string;
    passphrase?: string;
    signCallback?: SignCallback;
}
export interface genKeyPair {
    privateKey: string;
    publicKey?: string;
}
export interface keyDetail {
    keyType: string;
    keySize?: number;
}
/**
 * Represents a sign callback event from the native layer.
 */
export interface SignCallbackEvent {
    key: string;
    requestId: string;
    data: string;
}
/**
 * Represents a sign callback function that returns a signature.
 */
export type SignCallback = (data: string) => Promise<string>;
/**
 * Represents a password or key for authentication.
 */
export type PasswordOrKey = string | KeyPair;
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
    static setClient(new_client: typeof RNSSHClient, new_emitter: typeof RNSSHClientEmitter): void;
    static getKeyDetails(key: string): Promise<{
        keyType: string;
        keySize: number;
    }>;
    static generateKeyPair(type: string, passphrase?: string, keySize?: number, comment?: string): Promise<genKeyPair>;
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
    static connect(host: string, port: number, username: string, callback?: CallbackFunction<SSHClient>): Promise<SSHClient>;
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
    static connectWithSignCallback(host: string, port: number, username: string, publicKey: string, signCallback: SignCallback, callback?: CallbackFunction<SSHClient>): Promise<SSHClient>;
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
    static connectWithKey(host: string, port: number, username: string, privateKey: string, passphrase?: string, callback?: CallbackFunction<SSHClient>): Promise<SSHClient>;
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
    static connectWithPassword(host: string, port: number, username: string, password: string, callback?: CallbackFunction<SSHClient>): Promise<SSHClient>;
    private _key;
    private _listeners;
    private _counters;
    private _activeStream;
    private _handlers;
    private host;
    private port;
    private username;
    private _isAuthenticated;
    /**
     * Creates a new SSHClient instance and connects to the host.
     * Should not be called directly; use the `connect` factory function instead.
     * @param host The hostname or IP address of the SSH server.
     * @param port The port number of the SSH server.
     * @param username The username for authentication.
     * @param callback The callback function to be called after the connection is established.
     */
    constructor(host: string, port: number, username: string, callback: CallbackFunction<void>);
    /**
     * Legacy constructor for backward compatibility.
     * @deprecated Use the new constructor with separate authentication
     */
    constructor(host: string, port: number, username: string, passwordOrKey: PasswordOrKey, callback: CallbackFunction<void>);
    /**
     * Generates a random client key, used to identify which callback match with which instance.
     * Uses crypto-secure random generation for better uniqueness.
     *
     * @returns A string representing the random client key.
     */
    private static getRandomClientKey;
    /**
     * Handles a native event (callback).
     *
     * @param event The native event to handle.
     */
    private handleEvent;
    /**
     * Registers an event handler for the specified event.
     *
     * @param eventName - The name of the event.
     * @param handler - The event handler function.
     */
    on(eventName: string, handler: EventHandler): void;
    /**
     * Registers a native listener for the specified event name.
     *
     * @param eventName - The name of the event to listen for.
     */
    private registerNativeListener;
    /**
     * Unregisters a native listener for the specified event name.
     * @param eventName - The name of the event.
     */
    private unregisterNativeListener;
    /**
     * Handles a sign callback event from the native layer.
     *
     * @param signCallback - The sign callback function to use.
     * @param event - The sign callback event from native.
     */
    private handleSignCallback;
    /**
     * Connects to the SSH server without authentication (new API).
     *
     * @param callback - The callback function to be called after the connection attempt.
     */
    private connectToHost;
    /**
     * Connects to the SSH server using the provided password or key (legacy API).
     *
     * @param passwordOrKey - The password or key to authenticate with the server.
     * @param callback - The callback function to be called after the connection attempt.
     */
    private connectAndAuthenticate;
    /**
     * Android-specific connection and authentication logic.
     */
    private connectAndAuthenticateAndroid;
    /**
     * iOS-specific connection and authentication logic.
     */
    private connectAndAuthenticateIOS;
    /**
     * Authenticates with the SSH server using a password.
     *
     * @param password - The password for authentication.
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithPassword(password: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Authenticates with the SSH server using a private key.
     *
     * @param privateKey - The private key for authentication.
     * @param passphrase - The passphrase for the private key (optional).
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithKey(privateKey: string, passphrase?: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Authenticates with the SSH server using a sign callback.
     *
     * @param publicKey - The public key for authentication.
     * @param signCallback - A callback function that signs data and returns the signature.
     * @param callback - Optional callback function to handle the result.
     * @returns A Promise that resolves when authentication is successful.
     */
    authenticateWithSignCallback(publicKey: string, signCallback: SignCallback, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Checks if the client is authenticated.
     * @returns true if authenticated, false otherwise.
     */
    isAuthenticated(): boolean;
    /**
     * Executes a command on the SSH server.
     * @param command The command to execute.
     * @param callback Optional callback function to handle the result asynchronously.
     * @returns A promise that resolves with the response from the server.
     */
    execute(command: string, callback?: CallbackFunction<string>): Promise<string>;
    /**
     * Starts a shell session on the SSH server.
     * @param ptyType - The type of pseudo-terminal to use for the shell session.
     * @param callback - Optional callback function to handle the response.
     * @returns A promise that resolves with the response from the server.
     */
    startShell(ptyType: PtyType, callback?: CallbackFunction<string>): Promise<string>;
    /**
     * Checks if the shell is active. If the shell is already active, it returns an empty string.
     * Otherwise, it starts a new shell and returns the result.
     * @param callback Optional callback function to handle errors.
     * @returns A promise that resolves to a string representing the result of the shell check.
     */
    private checkShell;
    /**
     * Writes a command to the shell.
     * @param command - The command to write to the shell.
     * @param callback - Optional callback function to handle the response.
     * @returns A promise that resolves with the response from the shell.
     */
    writeToShell(command: string, callback?: CallbackFunction<string>): Promise<string>;
    /**
     * Closes the SSH shell.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when the shell is closed.
     */
    closeShell(callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Connects to the SFTP server.
     *
     * It is not mandatory to call this method before calling any SFTP method.
     * @param callback - Optional callback function to be called after the connection is established.
     * @returns A promise that resolves when the connection is established successfully, or rejects with an error if the connection fails.
     */
    connectSFTP(callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Checks if SFTP is active. If not, it connects to SFTP.
     * @param callback - Optional callback function to handle errors.
     * @returns A promise that resolves when SFTP is active or rejects with an error.
     */
    private checkSFTP;
    /**
     * Lists the files and directories in the specified path using SFTP.
     * @param path - The path to list.
     * @param callback - Optional callback function to handle the result asynchronously.
     * @returns A promise that resolves to the result of the SFTP listing operation.
     */
    sftpLs(path: string, callback?: CallbackFunction<LsResult[]>): Promise<LsResult[]>;
    /**
     * Renames a file or directory on the remote server using SFTP.
     * @param oldPath The current path of the file or directory.
     * @param newPath The new path to rename the file or directory to.
     * @param callback An optional callback function to handle the result or error.
     * @returns A Promise that resolves when the file or directory is successfully renamed.
     */
    sftpRename(oldPath: string, newPath: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Creates a directory on the remote server using SFTP.
     * @param path - The path of the directory to create.
     * @param callback - An optional callback function to handle the result.
     * @returns A promise that resolves when the directory is created successfully.
     */
    sftpMkdir(path: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Removes (unlinks) a file from the remote server using SFTP.
     * @param path - The path of the file to remove.
     * @param callback - An optional callback function to handle the result or error.
     * @returns A promise that resolves when the file is successfully removed.
     */
    sftpRm(path: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Removes a directory on the remote server using SFTP.
     * @param path - The path of the directory to remove.
     * @param callback - Optional callback function to handle the result or error.
     * @returns A promise that resolves when the directory is successfully removed.
     */
    sftpRmdir(path: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Changes the permissions of a file or directory on the remote server using SFTP.
     *
     * Only available on Android.
     * @param path - The path of the file or directory.
     * @param permissions - The new permissions to set.
     * @param callback - An optional callback function to handle the result or error.
     * @returns A Promise that resolves when the permissions are successfully changed.
     */
    sftpChmod(path: string, permissions: number, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Uploads a file from the local file system to the remote file system using SFTP.
     * @param localFilePath - The path of the file on the local file system.
     * @param remoteFilePath - The path of the file on the remote file system.
     * @param callback - An optional callback function to be called after the upload is complete or an error occurs.
     * @returns A Promise that resolves when the upload is complete or rejects with an error.
     */
    sftpUpload(localFilePath: string, remoteFilePath: string, callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Cancels the ongoing SFTP upload.
     */
    sftpCancelUpload(): void;
    /**
     * Downloads a file from the remote server using SFTP.
     * @param remoteFilePath - The path of the file on the remote server.
     * @param localFilePath - The path where the file will be saved locally.
     * @param callback - An optional callback function to handle the result of the download.
     * @returns A promise that resolves with the response string when the download is complete.
     */
    sftpDownload(remoteFilePath: string, localFilePath: string, callback?: CallbackFunction<string>): Promise<string>;
    /**
     * Cancels the ongoing SFTP download operation.
     */
    sftpCancelDownload(): void;
    /**
     * Disconnects the SFTP connection.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when SFTP is disconnected.
     */
    disconnectSFTP(callback?: CallbackFunction<void>): Promise<void>;
    /**
     * Disconnects the SSH client.
     * If a shell is active, it will be closed.
     * If an SFTP connection is active, it will be disconnected.
     * @param callback - Optional callback function to handle completion.
     * @returns A promise that resolves when disconnection is complete.
     */
    disconnect(callback?: CallbackFunction<void>): Promise<void>;
}
export {};
//# sourceMappingURL=sshclient.d.ts.map