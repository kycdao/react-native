import { EmitterSubscription, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { WCSessionError } from  "./WalletConnectModels";
import { Wallet, WCURL, WalletConnectSessionInterface } from  "./WalletConnectModels";
import { KycDaoReactEvents, MintingProperties, RNError } from "../Core/Models";
import { BaseWalletSession } from '../Core/BaseWalletSession';

const LINKING_ERROR =
  `The package 'react-native-awesome-module' doesn't seem to be linked. Make sure: \n\n` +
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

export class WalletConnectManager {

    private static instance: WalletConnectManager;

    private constructor() { }

    public static getInstance(): WalletConnectManager {
        if (!WalletConnectManager.instance) {
            WalletConnectManager.instance = new WalletConnectManager();
        
        }
        return WalletConnectManager.instance;
    }

    public subscribeOnSession(
        start: (walletSession?: WalletSession) => void, 
        failure: (err: WCSessionError) => void
    ): EmitterSubscription {

        return this.getEventEmitter().addListener(KycDaoReactEvents.WCSessionStarted, event => {
            
            console.log("RECEIVED EVENT SESSION");

            if (RNError.looksLike(event)) {

                console.log("RECEIVED EVENT SESSION 9");

                var errorObject = event as RNError;
                if ((errorObject.data as Wallet) !== undefined) {
                    var wallet = errorObject.data as Wallet;
                    var error = new WCSessionError(errorObject.message, wallet);
                    failure(error);
                }

            } else if (WalletConnectSessionInterface.looksLike(event)) {

                console.log("RECEIVED EVENT SESSION 2");

                var walletSessionData = event as WalletConnectSessionInterface;
                if (walletSessionData !== undefined) {
                    console.log("RECEIVED EVENT SESSION 3");
                    var walletSession = new WalletSession(walletSessionData.id,
                                                        walletSessionData.url, 
                                                        walletSessionData.chainId,
                                                        walletSessionData.walletId,
                                                        walletSessionData.accounts,
                                                        walletSessionData.icon,
                                                        walletSessionData.name);
                    console.log("WALLET SESSION CREATED: " + walletSession);
                    start(walletSession);
                }

            }
        });
    }

    // public onSessionFailed(listener: (error:ErrorEventBody) => void): EmitterSubscription {
    //     return this.getEventEmitter().addListener(KycDaoReactEvents.WCSessionFailed, event => {
    //             var error = event as ErrorEventBody;
    //             listener(error);
    //         });
    // }

    public getEventEmitter(): NativeEventEmitter {
        return new NativeEventEmitter(RNWalletConnectManager);
    }

    public startListening() {
        RNWalletConnectManager.startListening();
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
        return RNWalletConnectManager.sendMintingTransaction({ ...this }, walletAddress, mintingProperties);
    }

    public test() {
        console.log("TESTING STUFF");
    }

}
