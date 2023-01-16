import { RNWalletConnectManager } from '../RNWalletConnectManager';
import { EmitterSubscription, NativeEventEmitter, Platform } from 'react-native';
import { Wallet, WCURL, WalletConnectSessionInterface, WCSessionError, MintingTransactionResult } from  "./WalletConnectModels";
import { KycDaoReactEvents, MintingProperties, RNError } from "../Core/Models";
import { BaseWalletSession } from '../Core/BaseWalletSession';

export { WCSessionError, MintingTransactionResult };

/**
 * A WalletConnect V1 compatibility support class. Use this, if you want to connect the verification flow to a wallet through WalletConnect
 */
export class WalletConnectManager {

    private static instance: WalletConnectManager;

    private constructor() { }

    /**
     * WalletConnectManager singleton instance
     * @returns WalletConnectManager
     */
    public static getInstance(): WalletConnectManager {
        if (!WalletConnectManager.instance) {
            WalletConnectManager.instance = new WalletConnectManager();
        
        }
        return WalletConnectManager.instance;
    }

    /**
     * Subscribe to WalletConnect session start and failure events
     * @param start A handler for successfully started [[WalletConnectSession]]s
     * @param failure A handler that is called when the connection is rejected which resulted in a failure to start a session
     * @returns A subscription that should be kept until it is being used. Call `remove()` on the subscription when it is no longer needed.
     */
    public subscribeOnSession(
        start: (walletSession: WalletConnectSession) => void, 
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
                    var walletSession = new WalletConnectSession(walletSessionData.id,
                                                        walletSessionData.url, 
                                                        walletSessionData.chainId,
                                                        walletSessionData.accounts,
                                                        walletSessionData.walletId,
                                                        walletSessionData.icon,
                                                        walletSessionData.name);
                    console.log("WALLET SESSION CREATED: " + walletSession);
                    start(walletSession);
                }

            }
        });
    }

    /**
     * Subscribe to WalletConnect URI change events. WalletConnect component is awaiting new connections on the last received URI.
     * @param changedTo A handler where you get the current URI
     * @returns A subscription that should be kept until it is being used. Call `remove()` on the subscription when it is no longer needed.
     */
    public subscribeOnURIChange(changedTo: (uri?: string) => void): EmitterSubscription {

        return this.getEventEmitter().addListener(KycDaoReactEvents.WCSessionURIChanged, event => {
            if (event === undefined || typeof event === "string") {
                changedTo(event);
            }
        });

    }

    private getEventEmitter(): NativeEventEmitter {
        return new NativeEventEmitter(RNWalletConnectManager);
    }

    /** Start listening for incoming connections from wallets */
    public startListening() {
        RNWalletConnectManager.startListening();
    }

    /**
     * Provides a list of usable wallets for WalletConnect services based on the [WalletConnect V1 registry](https://registry.walletconnect.com/api/v1/wallets)
     * 
     * !!!danger iOS Only
     * This function is only available on iOS. 
     * iOS requires direct linking to wallets because of the fundamental differences in how iOS and Android handle deeplinks.
     * Due to this, iOS has to call the [[connect]] function with explicitly selected wallet objects, while Android must use the function without a wallet object.
     * !!!
     * !!!secondary Note
     * This is a filtered list of wallets, and may not contain every wallet the registry returns
     * !!!
     * 
     * @returns The list of compatible mobile wallets
     */
    public listWallets(): Promise<[Wallet]> {
        return RNWalletConnectManager.listWallets();
    }

    /**
     * Used for connecting to a ***wallet app***.
     * If the wallet is installed, it will be opened with a connection request prompt.
     * If the wallet is not installed, it will launch the AppStore where the user can download it.
     * 
     * !!!danger iOS Only Parameter
     * The [[Wallet]] parameter is reuired on iOS but unused on Android. You don't need a wallet app selector on Android, the system handles the deeplinking.
     * !!!
     * 
     * !!!warning Warning
     * This method should only be called from the **main thread**.
     * !!!
     * 
     * !!!secondary Note
     * When a wallet in the WalletConnect registry does not have an associated *universal link*, and only provides a *deep link*, and the user does not have the selected wallet installed, this method will do nothing
     * !!!
     * 
     * @param wallet The selected wallet you want to connect with
     * @returns 
     */
    public connect(wallet?: Wallet): Promise<void> {
        if (wallet === undefined && Platform.OS === 'ios') {
            throw new Error("You have to provide a wallet object for connecting on iOS");
        }
        return RNWalletConnectManager.connect({ ...wallet });
    }

}

/** A class representing a session with a WalletConnect wallet */
export class WalletConnectSession extends BaseWalletSession {
    /** The wallet connect URL as provided by [WalletConnectSwift](https://github.com/WalletConnect/WalletConnectSwift/blob/master/Sources/PublicInterface/WCURL.swift) */
    url: WCURL;
    /**
     * ID of a [[Wallet]] object belonging to the [[BaseWalletSession]]
     * !!!secondary Note
     * If the session was established as a result of [[WalletConnectManager.connect]], it will contain the id, otherwise `null`
     * !!!
     * !!!danger iOS Only
     * This value is unused on Android and always null
     * !!!
     */
    walletId?: string;
    /** List of blockchain accounts/wallet addresses accessible through the session */
    accounts: [string];
    /** URL for an icon of the wallet app the session belongs to */
    icon?: string;
    /** Name of the wallet app the session belongs to */
    name?: string;

    /** @internal */
    constructor(
        id: string,
        url: WCURL,  
        chainId: string,
        accounts: [string],
        walletId?: string, 
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
    
    /**
     * A function used for signing a message with the wallet app
     * @param walletAddress The public address of the wallet we want to sign our data with
     * @param message The message we want the wallet app to sign
     * @returns The signed message returned by the wallet app
     */
    personalSign(walletAddress: string, message: string): Promise<string> {
        console.log(walletAddress);
        console.log(message);
        return RNWalletConnectManager.sign({ ...this }, walletAddress, message);
    }
    
    /**
     * A function used for sending a minting transaction with the wallet app
     * @param walletAddress The public address of the wallet we want to send the minting transaction with
     * @param mintingProperties Data that describes a transaction used for minting
     * @returns The transaction hash
     */
    sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<MintingTransactionResult> {
        console.log(mintingProperties);
        console.log("REACT: send Minting Tx: ");
        return RNWalletConnectManager.sendMintingTransaction({ ...this }, walletAddress, mintingProperties);
    }

}
