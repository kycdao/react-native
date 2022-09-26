
import { EventSubscription, NativeEventEmitter } from "react-native";
import { 
    WalletSessionInterface, 
    Network, 
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
            var personalSignParams = event as MethodMintingTransactionParams;
            if (personalSignParams !== undefined && personalSignParams.id == this.id) {
                try {
                    var txHash = await this.sendMintingTransaction(personalSignParams.walletAddress, personalSignParams.mintingProperties);
                    RNKYCManager.mintingTransactionSuccess({ ...this }, txHash);
                } catch (error) {
                    console.error(error);
                    RNKYCManager.mintingTransactionFailure({ ...this }, error);
                }
            }
        });
    }

    abstract personalSign(walletAddress: string, message: string): Promise<string>;
    
    abstract sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<string>;

}