#import <React/RCTUtils.h>
#import "RNSSHClient.h"
#import "SSHClient.h"

@implementation RNSSHClient {
    NSMutableDictionary* _clientPool;
    NSMutableDictionary* _pendingSignRequests;
}

RCT_EXPORT_MODULE(RNSSHClient);

- (instancetype)init {
    if (self = [super init]) {
        NSLog(@"RNSSHClient initialized: %@", self);
    }
    return self;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_queue_create("reactnative.sshclient", DISPATCH_QUEUE_SERIAL);
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"Shell", @"DownloadProgress", @"UploadProgress", @"SignCallback"];
}

- (NSMutableDictionary*) clientPool {
    if (!_clientPool) {
        _clientPool = [NSMutableDictionary new];
    }
    return _clientPool;
}

- (NSMutableDictionary*) pendingSignRequests {
    if (!_pendingSignRequests) {
        _pendingSignRequests = [NSMutableDictionary new];
    }
    return _pendingSignRequests;
}

- (SSHClient*) clientForKey:(nonnull NSString*)key {
    return [[self clientPool] objectForKey:key];
}

- (BOOL)isConnected:(NMSSHSession *)session
       withCallback:(RCTResponseSenderBlock)callback {
    if (session && session.isConnected && session.isAuthorized) {
        return true;
    } else {
        NSLog(@"Session not connected");
        callback(@[@"Session not connected"]);
        return false;
    }
}

- (BOOL)isSFTPConnected:(NMSFTP *)sftpSesion
           withCallback:(RCTResponseSenderBlock)callback {
    if (sftpSesion) {
        return true;
    } else {
        NSLog(@"SFTP not connected");
        callback(@[@"SFTP not connected"]);
        return false;
    }
}

RCT_EXPORT_METHOD(connectWithSignCallback:(NSString *)host
                  port:(NSInteger)port
                  withUsername:(NSString *)username
                  publicKey:(NSString *)publicKey
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    NMSSHSession* session = [[NMSSHSession alloc] initWithHost:host port:port andUsername:username];
    if (!session) {
        NSString* errorMsg = [NSString stringWithFormat:@"Failed to initialize session for host %@", host];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(-2)
        };
        callback(@[errorDict]);
        return;
    }
    
    int connectResult = [session connect];
    if (connectResult == 0 && session.isConnected) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData *publicKeyData = [publicKey dataUsingEncoding:NSUTF8StringEncoding];
            
            int authResult = [session authenticateByInMemoryPublicKey:publicKeyData
                                                            signCallback:^int(NSData * _Nonnull data, NSData * _Nullable * _Nonnull signature) {
                // Convert NSData to base64 string for JS callback
                NSString *dataString = [data base64EncodedStringWithOptions:0];
                NSString *requestId = [[NSUUID UUID] UUIDString];
                
                // Create a semaphore to wait for JS callback
                dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
                
                // Store the semaphore and result pointer for this request
                [[self pendingSignRequests] setObject:@{
                    @"semaphore": semaphore,
                    @"signature": [NSNull null]
                } forKey:requestId];
                
                // Call JS callback on main thread
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self sendEventWithName:@"SignCallback" body:@{
                        @"key": key,
                        @"name": @"SignCallback",
                        @"requestId": requestId,
                        @"data": dataString
                    }];
                });
                
                // Wait for JS to call back with signature (timeout after 30 seconds)
                dispatch_time_t timeout = dispatch_time(DISPATCH_TIME_NOW, 30 * NSEC_PER_SEC);
                if (dispatch_semaphore_wait(semaphore, timeout) == 0) {
                    NSDictionary *request = [[self pendingSignRequests] objectForKey:requestId];
                    if (request && ![request[@"signature"] isEqual:[NSNull null]]) {
                        NSData *resultSignature = request[@"signature"];
                        *signature = resultSignature;
                        [[self pendingSignRequests] removeObjectForKey:requestId];
                        return 0; // Success
                    }
                }
                
                [[self pendingSignRequests] removeObjectForKey:requestId];
                return -1; // Failure or timeout
            }];

            if (authResult == 0 && session.isAuthorized) {
                SSHClient* client = [[SSHClient alloc] init];
                client._session = session;
                client._key = key;
                [[self clientPool] setObject:client forKey:key];
                NSLog(@"Session connected with sign callback");
                callback(@[]);
            } else {
                NSString* errorMsg = [NSString stringWithFormat:@"Authentication to host %@ failed with error code %d", host, authResult];
                NSLog(@"%@", errorMsg);
                NSDictionary* errorDict = @{
                    @"message": errorMsg,
                    @"errno": @(authResult)
                };
                callback(@[errorDict]);
            }
        });
    } else {
        NSString* errorMsg = [NSString stringWithFormat:@"Connection to host %@ failed with error code %d", host, connectResult];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(connectResult)
        };
        callback(@[errorDict]);
    }
}

RCT_EXPORT_METHOD(provideSignature:(NSString *)requestId
                  signature:(NSString *)signatureBase64) {
    NSMutableDictionary *request = [[[self pendingSignRequests] objectForKey:requestId] mutableCopy];
    if (request) {
        NSData *signatureData = [[NSData alloc] initWithBase64EncodedString:signatureBase64 options:0];
        if (signatureData) {
            request[@"signature"] = signatureData;
            [[self pendingSignRequests] setObject:request forKey:requestId];
            
            // Signal the semaphore to wake up the waiting thread
            dispatch_semaphore_t semaphore = request[@"semaphore"];
            dispatch_semaphore_signal(semaphore);
        }
    }
}

RCT_EXPORT_METHOD(connectToHost:(NSString *)host
                  port:(NSInteger)port
                  withUsername:(NSString *)username
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    NMSSHSession* session = [[NMSSHSession alloc] initWithHost:host port:port andUsername:username];
    if (!session) {
        NSString* errorMsg = [NSString stringWithFormat:@"Failed to initialize session for host %@", host];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(-2)
        };
        callback(@[errorDict]);
        return;
    }
    
    int connectResult = [session connect];
    if (connectResult == 0 && session.isConnected) {
        SSHClient* client = [[SSHClient alloc] init];
        client._session = session;
        client._key = key;
        [[self clientPool] setObject:client forKey:key];
        NSLog(@"Session connected (not authenticated)");
        callback(@[]);
    } else {
        NSString* errorMsg = [NSString stringWithFormat:@"Connection to host %@ failed with error code %d", host, connectResult];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(connectResult)
        };
        callback(@[errorDict]);
    }
}

RCT_EXPORT_METHOD(authenticateWithPassword:(NSString *)password
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    SSHClient* client = [self clientForKey:key];
    if (client && client._session && client._session.isConnected) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            int authResult = [client._session authenticateByPassword:password];
            if (authResult == 0 && client._session.isAuthorized) {
                NSLog(@"Password authentication successful");
                callback(@[]);
            } else {
                NSString* errorMsg = [NSString stringWithFormat:@"Password authentication failed with error code %d", authResult];
                NSLog(@"%@", errorMsg);
                NSDictionary* errorDict = @{
                    @"message": errorMsg,
                    @"errno": @(authResult)
                };
                callback(@[errorDict]);
            }
        });
    } else {
        NSDictionary* errorDict = @{
            @"message": @"Client not connected",
            @"errno": @(-1)
        };
        callback(@[errorDict]);
    }
}

RCT_EXPORT_METHOD(authenticateWithKey:(NSDictionary *)keyPair
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    SSHClient* client = [self clientForKey:key];
    if (client && client._session && client._session.isConnected) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            int authResult = [client._session authenticateByInMemoryPublicKey:[keyPair objectForKey:@"publicKey"] 
                                                                   privateKey:[keyPair objectForKey:@"privateKey"] 
                                                                  andPassword:[keyPair objectForKey:@"passphrase"]];
            if (authResult == 0 && client._session.isAuthorized) {
                NSLog(@"Key authentication successful");
                callback(@[]);
            } else {
                NSString* errorMsg = [NSString stringWithFormat:@"Key authentication failed with error code %d", authResult];
                NSLog(@"%@", errorMsg);
                NSDictionary* errorDict = @{
                    @"message": errorMsg,
                    @"errno": @(authResult)
                };
                callback(@[errorDict]);
            }
        });
    } else {
        NSDictionary* errorDict = @{
            @"message": @"Client not connected",
            @"errno": @(-1)
        };
        callback(@[errorDict]);
    }
}

RCT_EXPORT_METHOD(authenticateWithSignCallback:(NSString *)publicKey
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    SSHClient* client = [self clientForKey:key];
    if (client && client._session && client._session.isConnected) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData *publicKeyData = [[NSData alloc] initWithBase64EncodedString:publicKey options:0];
            int authResult = [client._session authenticateByInMemoryPublicKey:publicKeyData
                                                            signCallback:^int(NSData * _Nonnull data, NSData * _Nullable * _Nonnull signature) {
                // Convert NSData to base64 string for JS callback
                NSString *dataString = [data base64EncodedStringWithOptions:0];
                NSString *requestId = [[NSUUID UUID] UUIDString];
                
                // Create a semaphore to wait for JS callback
                dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
                
                // Store the semaphore and result pointer for this request
                [[self pendingSignRequests] setObject:@{
                    @"semaphore": semaphore,
                    @"signature": [NSNull null]
                } forKey:requestId];
                
                // Call JS callback on main thread
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self sendEventWithName:@"SignCallback" body:@{
                        @"key": key,
                        @"name": @"SignCallback",
                        @"requestId": requestId,
                        @"data": dataString
                    }];
                });
                
                // Wait for JS to call back with signature (timeout after 30 seconds)
                dispatch_time_t timeout = dispatch_time(DISPATCH_TIME_NOW, 30 * NSEC_PER_SEC);
                if (dispatch_semaphore_wait(semaphore, timeout) == 0) {
                    NSDictionary *request = [[self pendingSignRequests] objectForKey:requestId];
                    if (request && ![request[@"signature"] isEqual:[NSNull null]]) {
                        NSData *resultSignature = request[@"signature"];
                        *signature = resultSignature;
                        [[self pendingSignRequests] removeObjectForKey:requestId];
                        return 0; // Success
                    }
                }
                
                [[self pendingSignRequests] removeObjectForKey:requestId];
                return -1; // Failure or timeout
            }];

            if (authResult == 0 && client._session.isAuthorized) {
                NSLog(@"Sign callback authentication successful");
                callback(@[]);
            } else {
                NSString* errorMsg = [NSString stringWithFormat:@"Sign callback authentication failed with error code %d", authResult];
                NSLog(@"%@", errorMsg);
                NSDictionary* errorDict = @{
                    @"message": errorMsg,
                    @"errno": @(authResult)
                };
                callback(@[errorDict]);
            }
        });
    } else {
        NSDictionary* errorDict = @{
            @"message": @"Client not connected",
            @"errno": @(-1)
        };
        callback(@[errorDict]);
    }
}

// Legacy method - now calls the separated methods
RCT_EXPORT_METHOD(connectToHostLegacy:(NSString *)host
                  port:(NSInteger)port
                  withUsername:(NSString *)username
                  passwordOrKey:(id) passwordOrKey
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    NMSSHSession* session = [[NMSSHSession alloc] initWithHost:host port:port andUsername:username];
    if (!session) {
        NSString* errorMsg = [NSString stringWithFormat:@"Failed to initialize session for host %@", host];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(-2)
        };
        callback(@[errorDict]);
        return;
    }
    
    int connectResult = [session connect];
    if (connectResult == 0 && session.isConnected) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            int authResult;
            if ([passwordOrKey isKindOfClass:[NSString class]]) {
                authResult = [session authenticateByPassword:passwordOrKey];
            } else {
                authResult = [session authenticateByInMemoryPublicKey:[passwordOrKey objectForKey:@"publicKey"] 
                                                           privateKey:[passwordOrKey objectForKey:@"privateKey"] 
                                                          andPassword:[passwordOrKey objectForKey:@"passphrase"]];
            }

            if (authResult == 0 && session.isAuthorized) {
                SSHClient* client = [[SSHClient alloc] init];
                client._session = session;
                client._key = key;
                [[self clientPool] setObject:client forKey:key];
                NSLog(@"Session connected");
                callback(@[]);
            } else {
                NSString* errorMsg = [NSString stringWithFormat:@"Authentication to host %@ failed with error code %d", host, authResult];
                NSLog(@"%@", errorMsg);
                NSDictionary* errorDict = @{
                    @"message": errorMsg,
                    @"errno": @(authResult)
                };
                callback(@[errorDict]);
            }
        });
    } else {
        NSString* errorMsg = [NSString stringWithFormat:@"Connection to host %@ failed with error code %d", host, connectResult];
        NSLog(@"%@", errorMsg);
        NSDictionary* errorDict = @{
            @"message": errorMsg,
            @"errno": @(connectResult)
        };
        callback(@[errorDict]);
    }
}

RCT_EXPORT_METHOD(execute:(NSString *)command
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        NMSSHSession* session = client._session;
        if ([self isConnected:session withCallback:callback]) {
            NSError* error = nil;
            NSString* response = [session.channel execute:command error:&error timeout:@10];
            if (error) {
                NSLog(@"Error executing command: %@", error);
                callback(@[RCTJSErrorFromNSError(error)]);
            } else {
                callback(@[[NSNull null], response]);
            }
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(startShell:(nonnull NSString*)key
                  ptyType:(NSString *)ptyType // vanilla, vt100, vt102, vt220, ansi, xterm
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        client.delegate = self;
//        NSError* error = nil;
        __block NSError *error = nil;
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            [client startShell:ptyType error:&error];
            if (error) {
                NSLog(@"Error starting shell: %@", error);
                callback(@[RCTJSErrorFromNSError(error)]);
            } else {
                callback(@[]);
            }
        });
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(writeToShell:(NSString *)command
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback]) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NSError* error = nil;
                [client._session.channel write:command error:&error timeout:@10];
                if (error) {
                    NSLog(@"Error writing to shell: %@", error);
                    callback(@[RCTJSErrorFromNSError(error)]);
                } else {
                    callback(@[]);
                }
            });
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

- (void) shellEvent:(NSString *)event withKey:(NSString *)key {
    [self sendEventWithName:@"Shell" body:@{@"name": @"Shell", @"key": key, @"value": event}];
}

RCT_EXPORT_METHOD(closeShell:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client && client._session && client._session.channel) {
        [client._session.channel closeShell];
        callback(@[]);
    } else {
        callback(@[@"No active shell to close"]);
    }
}

RCT_EXPORT_METHOD(connectSFTP:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback]) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NMSFTP* sftpSession = [NMSFTP connectWithSession:client._session];
                if (sftpSession) {
                    client._sftpSession = sftpSession;
                    callback(@[]);
                } else {
                    callback(@[@"Failed to connect SFTP"]);
                }
            });
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(sftpLs:(NSString *)path
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {

            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NSArray* fileList = [client._sftpSession contentsOfDirectoryAtPath:path];
                if (fileList) {
                    NSString* str = @"";
                    NSMutableArray* array = [NSMutableArray array];
                    for (NMSFTPFile* file in fileList) {
                        str = [NSString stringWithFormat:
                               @"{\"filename\":\"%@\","
                               "\"isDirectory\":%d,"
                               "\"modificationDate\":\"%@\","
                               "\"lastAccess\":\"%@\","
                               "\"fileSize\":%llu,"
                               "\"ownerUserID\":%lu,"
                               "\"ownerGroupID\":%lu,"
                               "\"permissions\":\"%@\","
                               "\"flags\":%lu}",
                               file.filename,
                               file.isDirectory,
                               file.modificationDate,
                               file.lastAccess,
                               [file.fileSize longLongValue],
                               file.ownerUserID,
                               file.ownerGroupID,
                               file.permissions,
                               file.flags];
                        [array addObject:str];
                    }
                    callback(@[[NSNull null], array]);
                } else {
                    callback(@[[NSString stringWithFormat:@"Failed to list path  %@",path]]);
                }
            });
        } else {
            callback(@[@"Unknown client"]);
        }
    }
}

RCT_EXPORT_METHOD(sftpRename:(NSString *)oldPath
                  newPath:(NSString *)newPath
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
            if ([client._sftpSession moveItemAtPath:oldPath toPath:newPath]) {
                callback(@[]);
            } else {
                callback(@[[NSString stringWithFormat:@"Failed to rename path %@ to %@", oldPath, newPath]]);
            }
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(sftpMkdir:(NSString *)path
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback){
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
            if([client._sftpSession createDirectoryAtPath:path]) {
                callback(@[]);
            } else {
                callback(@[[NSString stringWithFormat:@"Failed to create directory %@", path]]);
            }
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(sftpRm:(NSString *)path
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
            if([client._sftpSession removeFileAtPath:path]) {
                callback(@[]);
            } else {
                callback(@[[NSString stringWithFormat:@"Failed to remove %@", path]]);
            }
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(sftpRmdir:(NSString *)path
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
            if([client._sftpSession removeDirectoryAtPath:path]) {
                callback(@[]);
            } else {
                callback(@[[NSString stringWithFormat:@"Failed to remove %@", path]]);
            }
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

RCT_EXPORT_METHOD(sftpChmod:(NSString *)path
                  withPermissions:(NSInteger)permissions
                  withKey:(nonnull NSString*) key
                  withCallback:(RCTResponseSenderBlock)callback) {
    callback(@[@"Not implemented"]);
}

RCT_EXPORT_METHOD(sftpDownload:(NSString *)path
                  toPath:(NSString *)toPath
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
//            NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//            NSString* documentsDirectory = [paths objectAtIndex:0];
//            NSString* filePath = [NSString stringWithFormat:@"%@/%@", documentsDirectory, [path lastPathComponent]];
            NSString* filePath = [NSString stringWithFormat:@"%@%@", toPath, [path lastPathComponent]];

            NSLog(@"%@", filePath);

            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                client.delegate = self;
                NSError* error = nil;
                [client sftpDownload:path toPath:filePath error:&error];
                if (error) {
                    callback(@[RCTJSErrorFromNSError(error)]);
                } else if (client._downloadContinue) {
                    callback(@[[NSNull null], filePath]);
                } else {
                    callback(@[@"Download canceled"]);
                }
            });
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

- (void) downloadProgressEvent:(int)event withKey:(NSString *)key {
    [self sendEventWithName:@"DownloadProgress" body:@{@"name": @"DownloadProgress", @"key": key, @"value": [NSString stringWithFormat:@"%d", event]}];
}

RCT_EXPORT_METHOD(sftpCancelDownload:(nonnull NSString*)key) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        client._downloadContinue = false;
    }
}

RCT_EXPORT_METHOD(sftpUpload:(NSString *)filePath
                  toPath:(NSString *)path
                  withKey:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        if ([self isConnected:client._session withCallback:callback] &&
            [self isSFTPConnected:client._sftpSession withCallback:callback]) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                client.delegate = self;
                BOOL result = [client sftpUpload:filePath toPath:path];
                if (result) {
                    callback(@[]);
                } else {
                    if (client._uploadContinue) {
                        NSLog(@"Error uploading file");
                        callback(@[[NSString stringWithFormat:@"Failed to upload %@ to %@", filePath, path]]);
                    } else {
                        callback(@[@"Upload canceled"]);
                    }
                }
            });
        }
    } else {
        callback(@[@"Unknown client"]);
    }
}

- (void) uploadProgressEvent:(int)event withKey:(NSString *)key {
    [self sendEventWithName:@"UploadProgress" body:@{@"name": @"UploadProgress", @"key": key, @"value": [NSString stringWithFormat:@"%d", event]}];
}

RCT_EXPORT_METHOD(sftpCancelUpload:(nonnull NSString*)key) {
    SSHClient* client = [self clientForKey:key];
    if (client) {
        client._uploadContinue = false;
    }
}

RCT_EXPORT_METHOD(disconnectSFTP:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client && client._sftpSession) {
        [client._sftpSession disconnect];
        callback(@[]);
    } else {
        callback(@[@"No active SFTP session to disconnect"]);
    }
}

RCT_EXPORT_METHOD(disconnect:(nonnull NSString*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
    SSHClient* client = [self clientForKey:key];
    if (client && client._session) {
        [client._session disconnect];
        [[self clientPool] removeObjectForKey:key];
        callback(@[]);
    } else {
        callback(@[@"No active session to disconnect"]);
    }
}

@end
