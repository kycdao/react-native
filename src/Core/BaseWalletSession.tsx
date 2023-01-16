
import { EventSubscription, NativeEventEmitter } from "react-native";
import {
    KycDaoReactEvents,
    MethodMintingTransactionParams,
    MethodPersonalSignParams,
    MintingProperties,
} from "./Models";
import { RNVerificationManager } from "./../RNVerificationManager";
import type { MintingTransactionResult, WalletSessionInterface } from "src/WalletConnect/WalletConnectModels";

/**
 * An abstract class that describes a communication session with a wallet that can be used during the verification process.
 * 
 * #### Wallets
 * Use this protocol, when you want to integrate the kycDAO SDK to your wallet. Provide a concrete implementation of the protocol in a class. Learn more at <doc:WalletIntegration> about integrating the SDK to a wallet.
 * 
 * #### DApps
 * For DApps integrating the kycDAO SDK, you will likely won't have to use this protocol. WalletConnect should be used to connect your DApp to a supported Wallet. Learn more at <doc:WalletIntegration> about integrating the SDK to a DApp.
 */
export abstract class BaseWalletSession implements WalletSessionInterface {

    /** A unique identifier of the session */
    id: string;
    /** The ID of the chain used specified in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) */
    chainId: string;
    private personalSignListener: EventSubscription;
    private mintingTransactionListener: EventSubscription;

    constructor(
        id: string,
        chainId: string
    ) {
        this.id = id;
        this.chainId = chainId;

        var eventEmitter = new NativeEventEmitter(RNVerificationManager);

        this.personalSignListener = eventEmitter.addListener(KycDaoReactEvents.MethodPersonalSign, async event => {
            var personalSignParams = event as MethodPersonalSignParams;
            if (personalSignParams !== undefined && personalSignParams.id == this.id) {
                try {
                    var signature = await this.personalSign(personalSignParams.walletAddress, personalSignParams.message);
                    RNVerificationManager.personalSignSuccess({ ...this }, signature);
                } catch (error) {
                    console.error(error);
                    RNVerificationManager.personalSignFailure({ ...this }, error);
                }

            }
        });

        this.mintingTransactionListener = eventEmitter.addListener(KycDaoReactEvents.MethodMintingTransaction, async event => {
            console.log(event);
            var mintingTransactionParams = event as MethodMintingTransactionParams;
            if (mintingTransactionParams !== undefined && mintingTransactionParams.id == this.id) {
                try {
                    var txResult = await this.sendMintingTransaction(mintingTransactionParams.walletAddress, mintingTransactionParams.mintingProperties);
                    RNVerificationManager.mintingTransactionSuccess({ ...this }, txResult);
                } catch (error) {
                    console.error(error);
                    RNVerificationManager.mintingTransactionFailure({ ...this }, error);
                }
            }
        });
    }

    /**
     * A function used for signing a message with the wallet app
     * @param walletAddress The public address of the wallet we want to sign our data with
     * @param message The message we want the wallet app to sign
     * @returns The signed message returned by the wallet app
     */
    abstract personalSign(walletAddress: string, message: string): Promise<string>;

    /**
     * A function used for sending a minting transaction with the wallet app
     * @param walletAddress The public address of the wallet we want to send the minting transaction with
     * @param mintingProperties Data that describes a transaction used for minting
     * @returns The transaction hash
     */
    abstract sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<MintingTransactionResult>;

    /**
     * WalletSession objects must be cleaned up when they are no longer needed. 
     * Call [[release]] to safely remove the listeners used for native bridging
     */
    public release() {
        this.personalSignListener.remove()
        this.mintingTransactionListener.remove()
    }

}