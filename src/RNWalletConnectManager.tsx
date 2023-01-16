import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'kycdao-mobile' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

export const RNWalletConnectManager = NativeModules.RNWalletConnectManager  ? NativeModules.RNWalletConnectManager  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );
