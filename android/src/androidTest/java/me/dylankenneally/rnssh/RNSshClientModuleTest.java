package me.dylankenneally.rnssh;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class RNSshClientModuleTest {

    private RNSshClientModule sshModule;
    private ReactApplicationContext reactContext;
    private CountDownLatch latch;
    private boolean callbackSuccess;
    private String callbackMessage;

    @Before
    public void setUp() {
        reactContext = new ReactApplicationContext(InstrumentationRegistry.getInstrumentation().getTargetContext());
        sshModule = new RNSshClientModule(reactContext);
        callbackSuccess = false;
        callbackMessage = null;
    }

    @Test
    public void testConnectToHost() throws InterruptedException {
        latch = new CountDownLatch(1);
        
        Callback callback = new Callback() {
            @Override
            public void invoke(Object... args) {
                if (args.length > 0) {
                    callbackSuccess = args[0] == null; // null means success
                    if (args.length > 1) {
                        callbackMessage = args[1].toString();
                    }
                }
                latch.countDown();
            }
        };

        // Test connection to SSH server (should succeed if server is running)
        sshModule.connectToHost("127.0.0.1", 2222, "user", "test-key", callback);
        
        assertTrue("Connection should complete within 10 seconds", 
                   latch.await(10, TimeUnit.SECONDS));
        assertTrue("Connection should succeed", callbackSuccess);
    }

    @Test
    public void testConnectToHostInvalidHost() throws InterruptedException {
        latch = new CountDownLatch(1);
        
        Callback callback = new Callback() {
            @Override
            public void invoke(Object... args) {
                if (args.length > 0) {
                    callbackSuccess = args[0] == null; // null means success
                    if (args.length > 1) {
                        callbackMessage = args[1].toString();
                    }
                }
                latch.countDown();
            }
        };

        // Test connection to invalid host (should fail)
        sshModule.connectToHost("invalid.host", 22, "user", "test-key", callback);
        
        assertTrue("Connection should complete within 10 seconds", 
                   latch.await(10, TimeUnit.SECONDS));
        assertFalse("Connection to invalid host should fail", callbackSuccess);
    }

    @Test
    public void testAuthenticateWithPasswordSuccess() throws InterruptedException {
        // First connect to host
        CountDownLatch connectLatch = new CountDownLatch(1);
        
        Callback connectCallback = new Callback() {
            @Override
            public void invoke(Object... args) {
                callbackSuccess = args[0] == null;
                connectLatch.countDown();
            }
        };

        sshModule.connectToHost("127.0.0.1", 2222, "user", "test-key", connectCallback);
        assertTrue("Connection should complete", connectLatch.await(10, TimeUnit.SECONDS));
        
        if (callbackSuccess) {
            // Now test password authentication
            latch = new CountDownLatch(1);
            
            Callback authCallback = new Callback() {
                @Override
                public void invoke(Object... args) {
                    if (args.length > 0) {
                        callbackSuccess = args[0] == null;
                        if (args.length > 1) {
                            callbackMessage = args[1].toString();
                        }
                    }
                    latch.countDown();
                }
            };

            sshModule.authenticateWithPassword("password", "test-key", authCallback);
            
            assertTrue("Authentication should complete within 10 seconds", 
                       latch.await(10, TimeUnit.SECONDS));
            assertTrue("Password authentication should succeed", callbackSuccess);
        }
    }

    @Test
    public void testAuthenticateWithPasswordFailure() throws InterruptedException {
        // First connect to host
        CountDownLatch connectLatch = new CountDownLatch(1);
        
        Callback connectCallback = new Callback() {
            @Override
            public void invoke(Object... args) {
                callbackSuccess = args[0] == null;
                connectLatch.countDown();
            }
        };

        sshModule.connectToHost("127.0.0.1", 2222, "user", "test-key", connectCallback);
        assertTrue("Connection should complete", connectLatch.await(10, TimeUnit.SECONDS));
        
        if (callbackSuccess) {
            // Now test password authentication with wrong password
            latch = new CountDownLatch(1);
            
            Callback authCallback = new Callback() {
                @Override
                public void invoke(Object... args) {
                    if (args.length > 0) {
                        callbackSuccess = args[0] == null;
                        if (args.length > 1) {
                            callbackMessage = args[1].toString();
                        }
                    }
                    latch.countDown();
                }
            };

            sshModule.authenticateWithPassword("wrongpassword", "test-key", authCallback);
            
            assertTrue("Authentication should complete within 10 seconds", 
                       latch.await(10, TimeUnit.SECONDS));
            assertFalse("Authentication with wrong password should fail", callbackSuccess);
        }
    }
}
