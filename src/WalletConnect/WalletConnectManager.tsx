import { EmitterSubscription, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { Wallet, WCURL, WalletConnectSessionInterface } from  "./WalletConnectModels";
import { Network, KycReactEvents, MintingProperties } from "./../KYC/KYCModels";
import { BaseWalletSession } from './../KYC/BaseWalletSession';

const LINKING_ERROR =
  `The package 'react-native-awesome-module' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RNWalletConnectManager = NativeModules.RNWalletConnectManager  ? NativeModules.RNWalletConnectManager  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export class WalletConnectManager {

    private static instance: WalletConnectManager;

    private constructor() { }

    public static getInstance(): WalletConnectManager {
        if (!WalletConnectManager.instance) {
            WalletConnectManager.instance = new WalletConnectManager();
        }

        return WalletConnectManager.instance;
    }

    public addSessionStartListener(listener: (walletSession: WalletSession) => void): EmitterSubscription {
        return this.getEventEmitter().addListener(KycReactEvents.WCSessionStarted, event => {
            var walletSessionData = event as WalletConnectSessionInterface
            if (walletSessionData !== undefined) {
                var walletSession = new WalletSession(walletSessionData.id,
                                                      walletSessionData.url, 
                                                      walletSessionData.chainId,
                                                      walletSessionData.walletId,
                                                      walletSessionData.accounts,
                                                      walletSessionData.icon,
                                                      walletSessionData.name);
                listener(walletSession);
            }
        });
    }

    public getEventEmitter(): NativeEventEmitter {
        return new NativeEventEmitter(RNWalletConnectManager);
    }

    public startListening(): Promise<string> {
        return RNWalletConnectManager.startListening();
    }

    public listWallets(): Promise<[Wallet]> {
        return RNWalletConnectManager.listWallets();
    }

    public connect(wallet: Wallet): Promise<void> {
        return RNWalletConnectManager.connect({ ...wallet });
    }

}

export class WalletSession extends BaseWalletSession {
    url: WCURL;
    walletId?: string;
    accounts?: [string];
    icon?: string;
    name?: string;

    // public get network(): Network | undefined {
    //     console.log("network from chainId");
    //     console.log(this.chainId);
    //     switch (this.chainId) {
    //         case 1:
    //             return Network.EthereumMainnet;
    //         case 42220:
    //             return Network.CeloMainnet;
    //         case 44787:
    //             return Network.CeloAlfajores;
    //         case 80001:
    //             return Network.PolygonMumbai;
    //         default:
    //             return undefined;
    //     }
    // }

    constructor(
        id: string,
        url: WCURL,  
        chainId: string,
        walletId?: string, 
        accounts?: [string], 
        icon?: string, 
        name?: string
    ) {
        super(id, chainId);
        this.url = url;
        this.walletId = walletId;
        this.accounts = accounts;
        this.icon = icon;
        this.name = name;
    }
    
    personalSign(walletAddress: string, message: string): Promise<string> {
        console.log(walletAddress);
        console.log(message);
        return RNWalletConnectManager.sign({ ...this }, walletAddress, message);
    }
    
    sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<string> {
        console.log(mintingProperties);
        console.log("REACT: send Minting Tx: ");
        // return RNWalletConnectManager.sign({ ...this }, walletAddress, "anyad");
        return RNWalletConnectManager.sendMintingTransaction({ ...this }, walletAddress, mintingProperties);
    }

    public test() {
        console.log("TESTING STUFF");
    }

}
