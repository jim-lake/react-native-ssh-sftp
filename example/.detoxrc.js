module.exports = {
  testRunner: {
    args: {
      config: "tests/e2e/jest.config.js",
      maxWorkers: 1
    },
    jest: {
      setupFilesAfterEnv: [
        "<rootDir>/tests/e2e/init.js"
      ]
    }
  },
  apps: {
    "ios.release": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Release-iphonesimulator/SSHSFTPExample.app",
      build: "xcodebuild -workspace ios/SSHSFTPExample.xcworkspace -scheme SSHSFTPExample -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet"
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      testBinaryPath: "android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
    }
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 16"
      }
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_3a_API_36_ARM"
      }
    }
  },
  configurations: {
    "ios.sim.release": {
      device: "simulator",
      app: "ios.release"
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
      recordLogs: "all",
    }
  }
};
