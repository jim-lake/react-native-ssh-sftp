package com.sshsftpexample;

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.Identity;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.KeyPair;

import java.util.Properties;
import java.io.ByteArrayInputStream;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.math.BigInteger;
import java.util.Base64;

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

    @Test
    public void testAuthenticateWithRSACallback() throws Exception {
        String host = "127.0.0.1";
        int port = 2222;
        String username = "user";
        
        // RSA private key (PKCS#1 format)
        String privateKeyPem = "-----BEGIN RSA PRIVATE KEY-----\n" +
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
        
        System.out.println("=== SSH RSA SIGN CALLBACK AUTH TEST ===");
        System.out.println("Server: " + host + ":" + port);
        System.out.println("Username: " + username);
        System.out.println("Auth Type: RSA Sign Callback (SHA1withRSA)");
        System.out.println("Expected: Authentication should succeed");
        
        JSch jsch = new JSch();
        Session session = null;
        
        try {
            // Convert PKCS#1 to PKCS#8 format for Java
            PrivateKey privateKey = parseRSAPrivateKey(privateKeyPem);
            System.out.println("Parsed RSA private key successfully");
            
            // Extract public key from private key and validate
            RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) privateKey;
            BigInteger modulus = rsaPrivateKey.getModulus();
            BigInteger publicExponent = BigInteger.valueOf(65537); // Standard RSA public exponent
            
            RSAPublicKeySpec publicKeySpec = new RSAPublicKeySpec(modulus, publicExponent);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey calculatedPublicKey = keyFactory.generatePublic(publicKeySpec);
            
            System.out.println("Calculated public key from private key");
            System.out.println("Modulus length: " + modulus.bitLength() + " bits");
            System.out.println("Public exponent: " + publicExponent);
            
            // Validate against expected SSH public key
            String expectedPublicKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/XulQBQ2ms2sA+0QIe5XPWdmGDqb5oBzBjODFUQPIdF9etRRlEfQQDS6+YGailP/F+WGMWN3OvWHBTVwEXkxSzPc0qfG5sqdqeQf/1STvkN+I98SWYIaKEkv0IVe5eTAMr8atA8gzX3w9XHoqtg4aeeZtz5uBgd3q2YdG9RiRkTMJ4YHT5TzQSFJy+FCuV4SP4SaU/Zv5Q/grZTsMcBal1tziu3xnuYH5vJmvFXXDPwUiJ6da+oUYf7D+wsqlL8/KDyiRPg2VX+E9rIoNe2J56MWjUoqoa/45Y7TaND8zN9fxTw6bgU9W9Yre5JpLaR9KtvoETe6lIprc5IV54PWx test-agent@nmssh";
            byte[] expectedKeyBlob = Base64.getDecoder().decode(expectedPublicKey.split(" ")[1]);
            
            System.out.println("Expected SSH public key blob: " + expectedKeyBlob.length + " bytes");
            
            // Create custom identity with comprehensive logging
            Identity identity = new Identity() {
                private int callCount = 0;
                
                @Override
                public boolean setPassphrase(byte[] passphrase) throws JSchException {
                    System.out.println("=== Identity.setPassphrase() called ===");
                    System.out.println("Call #" + (++callCount));
                    if (passphrase != null) {
                        System.out.println("Passphrase length: " + passphrase.length + " bytes");
                    } else {
                        System.out.println("Passphrase: null");
                    }
                    System.out.println("Returning: true");
                    return true;
                }
                
                @Override
                public byte[] getPublicKeyBlob() {
                    System.out.println("=== Identity.getPublicKeyBlob() called ===");
                    System.out.println("Call #" + (++callCount));
                    try {
                        String[] parts = expectedPublicKey.trim().split("\\s+");
                        if (parts.length >= 2) {
                            String keyType = parts[0];
                            String keyData = parts[1];
                            
                            byte[] keyBytes = Base64.getDecoder().decode(keyData);
                            System.out.println("Key type: " + keyType);
                            System.out.println("Key data length: " + keyData.length() + " chars");
                            System.out.println("Decoded key blob: " + keyBytes.length + " bytes");
                            
                            // Log first 32 bytes for debugging
                            StringBuilder hex = new StringBuilder();
                            for (int i = 0; i < Math.min(keyBytes.length, 32); i++) {
                                hex.append(String.format("%02x ", keyBytes[i]));
                            }
                            System.out.println("Key blob (first 32 bytes): " + hex.toString());
                            
                            return keyBytes;
                        } else {
                            System.out.println("ERROR: Invalid public key format");
                            return null;
                        }
                    } catch (Exception e) {
                        System.out.println("ERROR: Failed to parse public key: " + e.getMessage());
                        e.printStackTrace();
                        return null;
                    }
                }
                
                @Override
                public byte[] getSignature(byte[] data) {
                    System.out.println("=== Identity.getSignature() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Data to sign length: " + data.length + " bytes");
                    
                    // Log first 32 bytes of data
                    StringBuilder dataHex = new StringBuilder();
                    for (int i = 0; i < Math.min(data.length, 32); i++) {
                        dataHex.append(String.format("%02x ", data[i]));
                    }
                    System.out.println("Data (first 32 bytes): " + dataHex.toString());
                    
                    try {
                        // Use SHA1withRSA signature
                        Signature signature = Signature.getInstance("SHA1withRSA");
                        signature.initSign(privateKey);
                        signature.update(data);
                        byte[] rawSignature = signature.sign();
                        
                        System.out.println("Generated raw signature: " + rawSignature.length + " bytes");
                        
                        // Log first 16 bytes of raw signature
                        StringBuilder sigHex = new StringBuilder();
                        for (int i = 0; i < Math.min(rawSignature.length, 16); i++) {
                            sigHex.append(String.format("%02x ", rawSignature[i]));
                        }
                        System.out.println("Raw signature (first 16 bytes): " + sigHex.toString());
                        
                        // Create SSH wire format signature: algorithm + signature
                        String algorithm = "ssh-rsa";
                        byte[] algorithmBytes = algorithm.getBytes();
                        
                        // SSH wire format: length + algorithm + length + signature
                        int totalLength = 4 + algorithmBytes.length + 4 + rawSignature.length;
                        byte[] sshSignature = new byte[totalLength];
                        
                        int offset = 0;
                        
                        // Algorithm name length (big-endian)
                        sshSignature[offset++] = (byte) ((algorithmBytes.length >> 24) & 0xff);
                        sshSignature[offset++] = (byte) ((algorithmBytes.length >> 16) & 0xff);
                        sshSignature[offset++] = (byte) ((algorithmBytes.length >> 8) & 0xff);
                        sshSignature[offset++] = (byte) (algorithmBytes.length & 0xff);
                        
                        // Algorithm name
                        System.arraycopy(algorithmBytes, 0, sshSignature, offset, algorithmBytes.length);
                        offset += algorithmBytes.length;
                        
                        // Signature length (big-endian)
                        sshSignature[offset++] = (byte) ((rawSignature.length >> 24) & 0xff);
                        sshSignature[offset++] = (byte) ((rawSignature.length >> 16) & 0xff);
                        sshSignature[offset++] = (byte) ((rawSignature.length >> 8) & 0xff);
                        sshSignature[offset++] = (byte) (rawSignature.length & 0xff);
                        
                        // Signature
                        System.arraycopy(rawSignature, 0, sshSignature, offset, rawSignature.length);
                        
                        System.out.println("Generated SSH wire signature: " + sshSignature.length + " bytes");
                        
                        // Log first 16 bytes of SSH signature
                        StringBuilder sshSigHex = new StringBuilder();
                        for (int i = 0; i < Math.min(sshSignature.length, 16); i++) {
                            sshSigHex.append(String.format("%02x ", sshSignature[i]));
                        }
                        System.out.println("SSH signature (first 16 bytes): " + sshSigHex.toString());
                        
                        // Try returning just the raw signature instead of SSH wire format
                        System.out.println("Returning raw signature instead of SSH wire format");
                        return rawSignature;
                    } catch (Exception e) {
                        System.out.println("ERROR: Sign callback failed: " + e.getMessage());
                        e.printStackTrace();
                        return null;
                    }
                }
                
                @Override
                public boolean decrypt() {
                    System.out.println("=== Identity.decrypt() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Returning: true");
                    return true;
                }
                
                @Override
                public String getAlgName() {
                    System.out.println("=== Identity.getAlgName() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Returning: ssh-rsa");
                    return "ssh-rsa";
                }
                
                @Override
                public String getName() {
                    System.out.println("=== Identity.getName() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Returning: rsa-callback-test");
                    return "rsa-callback-test";
                }
                
                @Override
                public boolean isEncrypted() {
                    System.out.println("=== Identity.isEncrypted() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Returning: false");
                    return false;
                }
                
                @Override
                public void clear() {
                    System.out.println("=== Identity.clear() called ===");
                    System.out.println("Call #" + (++callCount));
                    System.out.println("Clearing identity data");
                }
                
                // Additional methods that might be called
                public byte[] forSSHAgent() throws JSchException {
                    System.out.println("=== Identity.forSSHAgent() called ===");
                    System.out.println("Call #" + (++callCount));
                    return null;
                }
            };
            
            System.out.println("Created Identity with comprehensive logging");
            
            // Test signature generation before using with JSch
            byte[] testData = "test data for signing".getBytes();
            Signature testSig = Signature.getInstance("SHA1withRSA");
            testSig.initSign(privateKey);
            testSig.update(testData);
            byte[] testSignature = testSig.sign();
            
            System.out.println("Test signature generated: " + testSignature.length + " bytes");
            System.out.println("Key validation complete - proceeding with JSch authentication");
            
            jsch.addIdentity(identity, null);
            System.out.println("Added RSA sign callback identity to JSch");
            
            session = jsch.getSession(username, host, port);
            
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            config.put("PreferredAuthentications", "publickey");
            session.setConfig(config);
            
            session.setTimeout(10000);
            System.out.println("Attempting to connect with RSA sign callback...");
            session.connect();
            
            if (session.isConnected()) {
                System.out.println("SUCCESS: Authenticated with RSA sign callback for user " + username + " on " + host + ":" + port);
            } else {
                System.out.println("FAILED: Session not connected after authentication attempt");
                fail("SSH session not connected");
            }
            
        } catch (Exception e) {
            System.out.println("FAILED: RSA sign callback test failed: " + e.getMessage());
            e.printStackTrace();
            fail("Failed RSA sign callback test: " + e.getMessage());
        } finally {
            if (session != null && session.isConnected()) {
                session.disconnect();
                System.out.println("Disconnected from SSH server");
            }
        }
    }
    
    private PrivateKey parseRSAPrivateKey(String privateKeyPem) throws Exception {
        // Remove PEM headers and decode base64
        String privateKeyContent = privateKeyPem
            .replace("-----BEGIN RSA PRIVATE KEY-----", "")
            .replace("-----END RSA PRIVATE KEY-----", "")
            .replaceAll("\\s", "");
        
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyContent);
        
        // Convert PKCS#1 to PKCS#8 format
        byte[] pkcs8Key = convertPKCS1ToPKCS8(keyBytes);
        
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(pkcs8Key);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }
    
    private byte[] convertPKCS1ToPKCS8(byte[] pkcs1Key) {
        // PKCS#8 RSA private key header
        byte[] pkcs8Header = {
            0x30, (byte) 0x82, 0x00, 0x00, // SEQUENCE, length placeholder
            0x02, 0x01, 0x00, // INTEGER version = 0
            0x30, 0x0d, // SEQUENCE AlgorithmIdentifier
            0x06, 0x09, 0x2a, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01, // RSA OID
            0x05, 0x00, // NULL parameters
            0x04, (byte) 0x82, 0x00, 0x00 // OCTET STRING, length placeholder
        };
        
        int totalLength = pkcs8Header.length + pkcs1Key.length;
        byte[] pkcs8Key = new byte[totalLength];
        
        // Copy header
        System.arraycopy(pkcs8Header, 0, pkcs8Key, 0, pkcs8Header.length);
        
        // Set total length
        int outerLength = totalLength - 4;
        pkcs8Key[2] = (byte) ((outerLength >> 8) & 0xff);
        pkcs8Key[3] = (byte) (outerLength & 0xff);
        
        // Set OCTET STRING length
        pkcs8Key[pkcs8Header.length - 2] = (byte) ((pkcs1Key.length >> 8) & 0xff);
        pkcs8Key[pkcs8Header.length - 1] = (byte) (pkcs1Key.length & 0xff);
        
        // Copy PKCS#1 key
        System.arraycopy(pkcs1Key, 0, pkcs8Key, pkcs8Header.length, pkcs1Key.length);
        
        return pkcs8Key;
    }
}
