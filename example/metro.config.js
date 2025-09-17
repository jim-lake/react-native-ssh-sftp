const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const moduleRoot = path.resolve(projectRoot, "../..", "react-native-ssh-sftp");

const config = {
  watchFolders: [moduleRoot],
  resolver: {
    extraNodeModules: {
      // This package points explicitly to its source, not the whole parent
      "react-native-ssh-sftp": moduleRoot,
      // Force Metro to use THIS react-native, not any other copy
      "react-native": path.resolve(projectRoot, "node_modules/react-native"),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);