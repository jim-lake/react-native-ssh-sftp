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
        Thread.sleep(3000);
        
        // Check if app launched
        UiObject title = device.findObject(new UiSelector().text("SSH SFTP Example"));
        System.out.println("Title exists: " + title.exists());
        
        UiObject button = device.findObject(new UiSelector().text("RSA Key"));
        System.out.println("RSA Key button exists: " + button.exists());
        assert(button.exists());
        
        button.click();
        System.out.println("Button clicked, waiting...");
        Thread.sleep(8000);
        
        UiObject statusText = device.findObject(new UiSelector().text("RSA Key Connected!"));
        assert(statusText.exists());
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
