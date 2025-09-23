package com.sshsftpexample;

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

import java.util.Properties;
import java.io.ByteArrayInputStream;

import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class SSHClientDirectTest {

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

    @Test
    public void testAuthenticateWithRSAKeySuccess() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        
        // RSA private key content
        String privateKey = "-----BEGIN RSA PRIVATE KEY-----\n" +
            "MIIEowIBAAKCAQEAv17pUAUNprNrAPtECHuVz1nZhg6m+aAcwYzgxVEDyHRfXrUU\n" +
            "ZRH0EA0uvmBmopT/xflhjFjdzr1hwU1cBF5MUsz3NKnxubKnankH/9Uk75DfiPfE\n" +
            "lmCGihJL9CFXuXkwDK/GrQPIM198PVx6KrYOGnnmbc+bgYHd6tmHRvUYkZEzCeGB\n" +
            "0+U80EhScvhQrleEj+EmlP2b+UP4K2U7DHAWpdbc4rt8Z7mB+byZrxV1wz8FIien\n" +
            "WvqFGH+w/sLKpS/Pyg8okT4NlV/hPayKDXtieejFo1KKqGv+OWO02jQ/MzfX8U8O\n" +
            "m4FPVvWK3uSaS2kfSrb6BE3upSKa3OSFeeD1sQIDAQABAoIBAAiXPCYJdAltuHn8\n" +
            "zZsL4TfDss4fzkMaeu/9YQG6l07iWn2n51h6K9ikntqQ/UqDIdBDV6uzOZHUUpUY\n" +
            "4e6YRRjadqZ4ko9hg7513HQRn2zZtg8yADM39hIwrBQzgvqihBOtuF9/8fbMbIlc\n" +
            "o2dTcOKjYkK/tR1lNQ8b4MTAr++o3xGcKXtnVkQdQSDYvV5CL1lwzer2Vq5hmxXF\n" +
            "f/VMcbLgZc3yGqywcKKaP6AUTolcQQryVJ0T5epUbLBFGLinHXCjy1KWMrfAnySE\n" +
            "buPF0yJmSzbx/AKu+5+KpkjjhReprcswVW/ogGOUoz9y30GCTtkcQvG12T2EvxwY\n" +
            "8et1JzkCgYEA7tVspyFilW8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GI\n" +
            "GR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpX\n" +
            "cnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8CgYEAzSAp\n" +
            "Z1o0iuL1pjo202TczOBDf1c/Anno5hJw3NslWJIekrQqRE+UqovKTd4RRjG07Zb6\n" +
            "38fS1TmWltkFwYBDtSgqJ5cWWxZygffcSaXsKjDHaxy1bDtiIyQbHo5SQYs6Nkkt\n" +
            "lstPBezzZuKbNf3I7AS7x2bu59qrk+guBbfRl/8CgYBr0am1YZrxvyaiT8PqE9R+\n" +
            "4cfPoTI8mdMeGSFOrcOJhTUVMn5tihS40rPxeLPT98h+KYX4qASXD9ztAKmMZPBF\n" +
            "tNWPwJEsMkMfGGtJS1lpZXs9nnsTxPYpUj+3gsudgJ050ODLcqNCi67ykhFRBfId\n" +
            "nhd5ByzxPkIZnfdNv546fQKBgQCU0+b2g+5nbrCIwOgSjLXfOEAA3o5q/4TJmUum\n" +
            "EqKQFsRz8KBSG+NjsjVANgUWhu4dDFRNlTAVYMkv/Zo9gRCfGdssCmVABZNjVTDR\n" +
            "hr9JBUdLIfNH6fYURRggHWb1A01jIckgBbb6N6eKWJQAonfrNqv/y2E/e9rNX8I0\n" +
            "h+BchQKBgFkO4+5fL/7sB2EG9VBw1AaQwM2esO07Zv0emOYojXqVKShAL2xD7dw1\n" +
            "HYI/V6f7UiJ+EL+LJUjkPYx0GLU1hO24xZlK3TjVzYLuEGxtRVLvT9hOx26s28cE\n" +
            "gQT51sWj0C7S5tkmVWqRbuKLPLNTa4IW+Ls30yReijz95DWMHf0X\n" +
            "-----END RSA PRIVATE KEY-----";
        
        System.out.println("=== SSH RSA KEY AUTH SUCCESS TEST ===");
        System.out.println("Server: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Key Type: RSA Private Key (no passphrase)");
        System.out.println("Expected: Authentication should succeed");
        
        JSch jsch = new JSch();
        Session session = null;
        
        try {
            // Add the private key to JSch
            byte[] keyBytes = privateKey.getBytes();
            jsch.addIdentity("test-rsa-key", keyBytes, null, null);
            System.out.println("Added RSA private key to JSch identity");
            
            session = jsch.getSession(username, host, port);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            config.put("PreferredAuthentications", "publickey");
            session.setConfig(config);
            
            session.setTimeout(10000);
            System.out.println("Attempting to connect with RSA key authentication...");
            session.connect();
            
            assertTrue("SSH connection with RSA key should be established", session.isConnected());
            System.out.println("SUCCESS: Authenticated with RSA key for user " + username + " on " + host + ":" + port);
            
        } catch (Exception e) {
            System.out.println("FAILED: RSA key authentication failed: " + e.getMessage());
            e.printStackTrace();
            fail("Failed to authenticate with RSA key: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
    }

    @Test
    public void testAuthenticateWithBadPassword() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        String badPassword = "wrongpassword";
        
        System.out.println("=== SSH BAD PASSWORD AUTH TEST ===");
        System.out.println("Server: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Password: " + badPassword);
        System.out.println("Expected: Authentication should fail");
        
        JSch jsch = new JSch();
        Session session = null;
        boolean authFailed = false;
        
        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(badPassword);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            
            session.setTimeout(10000);
            session.connect();
            
            System.out.println("UNEXPECTED: Authentication succeeded with bad password");
            fail("Authentication should have failed with bad password");
            
        } catch (Exception e) {
            authFailed = true;
            System.out.println("SUCCESS: Authentication correctly failed with bad password: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
        
        assertTrue("Authentication should fail with bad password", authFailed);
    }

    @Test
    public void testAuthenticateWithUnknownRSAKey() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        
        // Unknown RSA private key (valid but not authorized on server)
        String unknownPrivateKey = "-----BEGIN RSA PRIVATE KEY-----\n" +
            "MIIEpAIBAAKCAQEAm6cF1sNiTu72wmaJSbEcNMTTIt8HUiIQjZbX6wEV2Tq2RZBZ\n" +
            "QnXM+AhbCJXGSyJ6iNadhzaNlgHvPN88nPgTUGYjuYJSy+E9VsmcGdVNMe8eD8b/\n" +
            "fsfrwW5wGLomzEfvS9SBnFD+egI96ZtHrghJAbhvSdu/cFHUPHlPX/d8BDmi5FfA\n" +
            "6c7T3y5UX1YV39v/kYddF/r+XckWmaRyxLBYq2r9lGDwpQR2a75/yn5Hgm+aA02Q\n" +
            "VI8VqZejAMvH46aG2rKbYLhMybbFilV4m0fvyOnw/h2LwiC9dL0raqp6Ld5TEn8r\n" +
            "M52Xz2GgeOkQlqgIuMZkvstgDp1ws3xO0BvuhQIDAQABAoIBAHBX/wjhgOVD6Oqr\n" +
            "I1AC+z7DCTlUDG6lk5j+VN2TrPdbPw+6fhJQAB7NuRbbM4IrYpG9hXmAUHUC9G/V\n" +
            "GGSbUSVoc0SD4cqxyZoIbhjfMZZm5iWxFdul5G16joHqafJrwTXULbBrbSEW2STx\n" +
            "JK1h4X/SZNDEQMqK5Uq4rCex8tsAtlcpVOD7ZYYz+AHQnNJho8po/UCoBuafpWIb\n" +
            "01nqY9feq+8pPKOrpArfN6xKTwYUDJP4kHT0KZ4hBSIjRbr4GzQu/IJGy5mCibCi\n" +
            "Pz0Hqump3Gxcsc3EGU4fiL8vt+0qCARqyQXej4I0okbnBTREf/WCloaTnSQV6vLa\n" +
            "7j2KdUkCgYEAzlPc1UPTn7e/mKZGit8YczbzUhqhWVn9/A2cIn4xsNAvQjq0r1IB\n" +
            "3wGrcIJgTcn36BM+MhUNvriLXhA9XGOL3t2lUVsc/6uD8DdshK++ITJrMAIfn7CX\n" +
            "wQOa+HeLfcUMeiBJfm16Q8sq2qh2JjHvKwH10XtcIwJlC5fnhphYRT8CgYEAwSAC\n" +
            "UYtfzMPEbSFphR7BPeaVV/jqjHvk7gzzjlIAi7klQxtMWuLDVlDN5BXkvdQ0LotV\n" +
            "/i0fY7kmJI8B9OvkHOBCROq7+AzK7/op7i0o43tgbKGVToAEUg8gwTTdKKdJH0zV\n" +
            "0esrXO5soXKpgvktAc/0wolg/tqxyADIDL4QxzsCgYBAlVuQnfSGEBw3CgUWvxKG\n" +
            "LfMoBhHvSA4KcbAn09x1/hRs5LdeEYtoZLtnMkg20Tt6N1vGjXSJ+HYXcXnji31i\n" +
            "u3pd5ulC1kssTAz505DuDzwiAOgpMjuuPRSrJbBSI/Xt3GFk45vb0KKPYx/ogMTe\n" +
            "b3Skp7qFcuByKpBcPx+SPQKBgQCpo5NFy7Zv6Dp/Xc0RmM1HsWbXqpdkpWOXUxsR\n" +
            "lahTE2POyYjNgMjy5fGk+zI9KMxZYh08MqiS8Uy26kNev2JVlwu++633Gk2cdFMm\n" +
            "mtaC05oEcf7zwHGLHyy3adcmYaNSciyTww4JCIm1W0HZAUVuhRvLUd84niNxunX+\n" +
            "82lLhwKBgQCVgm7/FnQSfxas3DAgkAaQOe3Gqgw6zvp1euvmM5++glMHwn0gTk1i\n" +
            "ahzLGgwKJ15XWtjUwH8GGUmQH5EspSMWrjokHoC28F6tl+GchBQ/qM/wyK7h4ktp\n" +
            "NjciwmgISzfoJ4AAs6zIfPI9XWpPaBbP3J+9st86VvDDe+Nrs9mJSw==\n" +
            "-----END RSA PRIVATE KEY-----";
        
        System.out.println("=== SSH UNKNOWN RSA KEY AUTH TEST ===");
        System.out.println("Server: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Key Type: Unknown RSA Private Key (not authorized)");
        System.out.println("Expected: Authentication should fail");
        
        JSch jsch = new JSch();
        Session session = null;
        boolean authFailed = false;
        
        try {
            // Add the unknown private key to JSch
            byte[] keyBytes = unknownPrivateKey.getBytes();
            jsch.addIdentity("unknown-rsa-key", keyBytes, null, null);
            System.out.println("Added unknown RSA private key to JSch identity");
            
            session = jsch.getSession(username, host, port);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            config.put("PreferredAuthentications", "publickey");
            session.setConfig(config);
            
            session.setTimeout(10000);
            System.out.println("Attempting to connect with unknown RSA key...");
            session.connect();
            
            System.out.println("UNEXPECTED: Authentication succeeded with unknown RSA key");
            fail("Authentication should have failed with unknown RSA key");
            
        } catch (Exception e) {
            authFailed = true;
            System.out.println("SUCCESS: Authentication correctly failed with unknown RSA key: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
        
        assertTrue("Authentication should fail with unknown RSA key", authFailed);
    }
}
