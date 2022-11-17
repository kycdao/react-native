import { NativeModules, Platform } from 'react-native';
export { WalletConnectManager, WalletSession } from './WalletConnect/WalletConnectManager';
export {KYCManager, KYCSession, Network, IdentityFlowResult, VerificationStatus, PersonalData } from './KYC/KYCManager';
export {NetworkOption, VerificationType} from './KYC/KYCModels'

const LINKING_ERROR =
  `The package 'react-native-awesome-module' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const KycdaoMobile = NativeModules.KycdaoMobile  ? NativeModules.KycdaoMobile  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return KycdaoMobile.multiply(a, b);
}

export function printStuff(stuff: string) {
  KycdaoMobile.printStuff(stuff);
}

export function launchKycFlow() {
  KycdaoMobile.launchKycFlow();
}
