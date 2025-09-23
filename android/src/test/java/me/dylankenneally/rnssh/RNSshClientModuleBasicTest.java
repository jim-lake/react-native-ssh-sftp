package me.dylankenneally.rnssh;

import com.facebook.react.bridge.ReactApplicationContext;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class RNSshClientModuleBasicTest {

    @Mock
    private ReactApplicationContext mockReactContext;

    private RNSshClientModule sshModule;

    @Before
    public void setUp() {
        sshModule = new RNSshClientModule(mockReactContext);
    }

    @Test
    public void testModuleCreation() {
        assertNotNull("SSH module should be created", sshModule);
        assertEquals("Module name should be correct", "RNSshClient", sshModule.getName());
    }

    @Test
    public void testModuleName() {
        String moduleName = sshModule.getName();
        assertEquals("RNSshClient", moduleName);
    }
}
