package com.sshsftpexample;

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class SimpleSSHTest {

    @Test
    public void testSSHClientModuleExists() {
        // Simple test to verify the SSH client module class exists
        try {
            Class<?> sshClientClass = Class.forName("me.dylankenneally.rnssh.RNSshClientModule");
            assertNotNull("SSH Client module class should exist", sshClientClass);
            assertTrue("SSH Client should be a class", !sshClientClass.isInterface());
        } catch (ClassNotFoundException e) {
            fail("SSH Client module class not found: " + e.getMessage());
        }
    }

    @Test
    public void testJSchLibraryExists() {
        // Test that JSch library is available
        try {
            Class<?> jschClass = Class.forName("com.jcraft.jsch.JSch");
            assertNotNull("JSch library should be available", jschClass);
        } catch (ClassNotFoundException e) {
            fail("JSch library not found: " + e.getMessage());
        }
    }

    @Test
    public void testBasicJavaFunctionality() {
        // Basic test to ensure test framework is working
        String testString = "SSH Client Test";
        assertEquals("Basic string test", "SSH Client Test", testString);
        assertTrue("Basic boolean test", true);
        assertFalse("Basic boolean test", false);
    }
}
