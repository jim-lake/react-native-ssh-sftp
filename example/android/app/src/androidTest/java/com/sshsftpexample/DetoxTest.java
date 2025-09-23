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

    @Test
    public void testRSAKey() throws Exception {
        Intent intent = new Intent();
        mActivityRule.launchActivity(intent);
        
        // Wait for app to launch with polling
        waitForElement(new UiSelector().text("SSH SFTP Example"), 10000, "App title should appear");
        
        // Find and click RSA Key button
        UiObject rsaButton = waitForElement(new UiSelector().text("RSA Key"), 5000, "RSA Key button should exist");
        rsaButton.click();
        System.out.println("RSA Key button clicked, waiting for authentication...");
        
        // Wait for authentication result with polling
        UiObject successText = waitForElement(new UiSelector().textContains("RSA Key Connected!"), 30000, "RSA Key authentication should succeed");
        System.out.println("SUCCESS: RSA Key authentication worked!");
    }
    
    private UiObject waitForElement(UiSelector selector, long timeoutMs, String errorMessage) throws Exception {
        long startTime = System.currentTimeMillis();
        int attempts = 0;
        int maxAttempts = (int) (timeoutMs / 500); // Check every 500ms
        
        while (attempts < maxAttempts) {
            UiObject element = device.findObject(selector);
            if (element.exists()) {
                System.out.println("Found element after " + (System.currentTimeMillis() - startTime) + "ms, " + attempts + " attempts");
                return element;
            }
            
            attempts++;
            Thread.sleep(500);
        }
        
        // Log current state for debugging
        UiObject statusText = device.findObject(new UiSelector().textContains("Status:"));
        if (statusText.exists()) {
            System.out.println("Current status: " + statusText.getText());
        }
        
        UiObject failedText = device.findObject(new UiSelector().textContains("Failed"));
        if (failedText.exists()) {
            System.out.println("Found failure text: " + failedText.getText());
        }
        
        throw new AssertionError(errorMessage + " (timeout after " + timeoutMs + "ms, " + attempts + " attempts)");
    }
}
