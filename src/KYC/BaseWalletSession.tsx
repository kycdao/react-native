
import { EventSubscription, NativeEventEmitter } from "react-native";
import { 
    WalletSessionInterface,
    KycReactEvents, 
    MethodMintingTransactionParams, 
    MethodPersonalSignParams,
    MintingProperties 
} from "./KYCModels";
import { RNKYCManager } from "./../RNKYCManager";

export abstract class BaseWalletSession implements WalletSessionInterface {

    id: string;
    chainId: string;
    private personalSignListener: EventSubscription;
    private mintingTransactionListener: EventSubscription;

    constructor(id: string,
                chainId: string
    ) {
        this.id = id;
        this.chainId = chainId;

        var eventEmitter = new NativeEventEmitter(RNKYCManager);

        this.personalSignListener = eventEmitter.addListener(KycReactEvents.MethodPersonalSign, async event => {
            var personalSignParams = event as MethodPersonalSignParams;
            if (personalSignParams !== undefined && personalSignParams.id == this.id) {
                try {
                    var signature = await this.personalSign(personalSignParams.walletAddress, personalSignParams.message);
                    RNKYCManager.personalSignSuccess({ ...this }, signature);
                } catch (error) {
                    console.error(error);
                    RNKYCManager.personalSignFailure({ ...this }, error);
                }
                
            }
        });

        this.mintingTransactionListener = eventEmitter.addListener(KycReactEvents.MethodMintingTransaction, async event => {
            console.log(event);
            var mintingTransactionParams = event as MethodMintingTransactionParams;
            if (mintingTransactionParams !== undefined && mintingTransactionParams.id == this.id) {
                try {
                    console.log(mintingTransactionParams);
                    console.log(mintingTransactionParams.mintingProperties);
                    var txHash = await this.sendMintingTransaction(mintingTransactionParams.walletAddress, mintingTransactionParams.mintingProperties);
                    console.log("TxHash");
                    console.log(txHash);
                    console.error("Success");
                    RNKYCManager.mintingTransactionSuccess({ ...this }, txHash);
                } catch (error) {
                    console.log("Ran into error");
                    console.error(error);
                    RNKYCManager.mintingTransactionFailure({ ...this }, error);
                }
            }
        });
    }

    abstract personalSign(walletAddress: string, message: string): Promise<string>;
    
    abstract sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<string>;

    release() {
        this.personalSignListener.remove()
        this.mintingTransactionListener.remove()
    }

}