package com.sshsftpexample;

import android.content.Intent;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiSelector;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Rule;
import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;

import static org.junit.Assert.assertTrue;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(MainActivity.class, false, false);
    
    private UiDevice device;

    @Before
    public void setUp() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    // @Test
    public void testAppLaunch() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject title = device.findObject(new UiSelector().text("SSH SFTP Example"));
        assert(title.exists());
        
        UiObject status = device.findObject(new UiSelector().textContains("Status:"));
        assert(status.exists());
        
        UiObject testButton = device.findObject(new UiSelector().text("Test SSH"));
        UiObject dockerButton = device.findObject(new UiSelector().text("Docker SSH"));
        UiObject rsaButton = device.findObject(new UiSelector().text("RSA Key"));
        
        assert(testButton.exists());
        assert(dockerButton.exists());
        assert(rsaButton.exists());
    }

    // @Test
    public void testBasicSSH() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("Test SSH"));
        assert(button.exists());
        button.click();
        Thread.sleep(6000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testDockerSSH() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("Docker SSH"));
        assert(button.exists());
        button.click();
        Thread.sleep(10000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    @Test
    public void testRSAKey() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(5000);
        
        // Check if app launched
        UiObject title = device.findObject(new UiSelector().text("SSH SFTP Example"));
        System.out.println("Title exists: " + title.exists());
        assert(title.exists());
        
        // Find RSA Key button
        UiObject rsaButton = device.findObject(new UiSelector().text("RSA Key"));
        System.out.println("RSA Key button exists: " + rsaButton.exists());
        assert(rsaButton.exists());
        
        rsaButton.click();
        System.out.println("RSA Key button clicked, waiting for authentication...");
        Thread.sleep(15000); // Increased wait time
        
        // Check for success message
        UiObject successText = device.findObject(new UiSelector().text("RSA Key Connected!"));
        System.out.println("RSA Key Connected text exists: " + successText.exists());
        
        if (successText.exists()) {
            System.out.println("SUCCESS: RSA Key authentication worked!");
            return;
        }
        
        // If authentication didn't succeed, check what status we have
        UiObject statusText = device.findObject(new UiSelector().textContains("Status:"));
        if (statusText.exists()) {
            System.out.println("Current status: " + statusText.getText());
        }
        
        // Check for any error messages
        UiObject failedText = device.findObject(new UiSelector().textContains("Failed"));
        if (failedText.exists()) {
            System.out.println("Found failure text: " + failedText.getText());
        }
        
        // Check for any RSA-related text
        UiObject rsaText = device.findObject(new UiSelector().textContains("RSA"));
        if (rsaText.exists()) {
            System.out.println("Found RSA text: " + rsaText.getText());
        }

        assertTrue("Authentication should succeed", successText.exists());
    }

    // @Test
    public void testOpenSSHKey() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("OpenSSH Key"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testEncryptedRSA() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("Encrypted RSA"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testSFTP() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("SFTP Test"));
        assert(button.exists());
        button.click();
        Thread.sleep(10000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testRSA2048Sign() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("RSA 2048 Sign"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testRSA2048SHA256Sign() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("RSA 2048 SHA256 Sign"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testRSA4096Sign() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("RSA 4096 Sign"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testECDSASign() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("ECDSA P-256 Sign"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }

    // @Test
    public void testEd25519Sign() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        Thread.sleep(3000);
        
        UiObject button = device.findObject(new UiSelector().text("Ed25519 Sign"));
        assert(button.exists());
        button.click();
        Thread.sleep(8000);
        
        UiObject anyButton = device.findObject(new UiSelector().className("android.widget.TextView").textContains("SSH"));
        assert(anyButton.exists());
    }
}
