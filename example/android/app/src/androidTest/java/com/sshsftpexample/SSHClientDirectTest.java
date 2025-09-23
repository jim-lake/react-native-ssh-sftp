package com.sshsftpexample;

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

import java.util.Properties;

import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class SSHClientDirectTest {

    @Test
    public void testConnectToHost() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        String password = "password";
        
        System.out.println("=== SSH CONNECTION TEST ===");
        System.out.println("Connecting to: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        
        JSch jsch = new JSch();
        Session session = null;
        
        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(password);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            
            session.setTimeout(10000);
            session.connect();
            
            assertTrue("SSH connection should be established", session.isConnected());
            System.out.println("SUCCESS: Connected to SSH server " + host + ":" + port + " with user " + username);
            
        } catch (Exception e) {
            System.out.println("FAILED: Connection to " + host + ":" + port + " failed: " + e.getMessage());
            fail("Failed to connect to SSH server: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
    }

    @Test
    public void testAuthenticateWithPasswordSuccess() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        String password = "password";
        
        System.out.println("=== SSH PASSWORD AUTH SUCCESS TEST ===");
        System.out.println("Server: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        System.out.println("Expected: Authentication should succeed");
        
        JSch jsch = new JSch();
        Session session = null;
        
        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(password);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            
            session.setTimeout(10000);
            session.connect();
            
            assertTrue("SSH connection with password should be established", session.isConnected());
            System.out.println("SUCCESS: Authenticated with correct password for user " + username + " on " + host + ":" + port);
            
        } catch (Exception e) {
            System.out.println("FAILED: Authentication failed: " + e.getMessage());
            fail("Failed to authenticate with correct password: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
    }
}
