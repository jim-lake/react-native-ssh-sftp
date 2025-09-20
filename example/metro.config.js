const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const moduleRoot = path.resolve(projectRoot, "../..", "react-native-ssh-sftp");

const config = {
  watchFolders: [moduleRoot],
  resolver: {
    alias: {
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    },
    extraNodeModules: {
      "react-native-ssh-sftp": moduleRoot,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);