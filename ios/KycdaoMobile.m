#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(KycdaoMobile, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(printStuff:(NSString)stuff)

RCT_EXTERN_METHOD(launchKycFlow)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end


@interface RCT_EXTERN_MODULE(RNWalletConnectManager, RCTEventEmitter)

RCT_EXTERN_METHOD(startListening:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(listWallets:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(connect:(NSDictionary)walletDict resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sign:(NSDictionary)sessionData account:(NSString)account message:(NSString)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendMintingTransaction:(NSDictionary)sessionData walletAddress:(NSString)walletAddress mintingProperties:(NSDictionary)mintingProperties resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end

@interface RCT_EXTERN_MODULE(RNKYCManager, RCTEventEmitter)

RCT_EXTERN_METHOD(createSession:(NSString)walletAddress
                  walletSession:(NSDictionary)walletSessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(login:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(acceptDisclaimer:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateUser:(NSDictionary)sessionData
                  email:(NSString)email
                  residency:(NSString)residency
                  legalEntity:(BOOL)legalEntity
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendConfirmationEmail:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(continueWhenEmailConfirmed:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startIdentification:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(continueWhenIdentified:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getNFTImages:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(estimateGasForMinting:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestMinting:(NSDictionary)sessionData
                  selectedImageId:(NSString)selectedImageId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(mint:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(freshSessionData:(NSDictionary)oldSessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(personalSignSuccess:(NSDictionary)walletSessionData
                  signature:(NSString)signature)

RCT_EXTERN_METHOD(personalSignFailure:(NSDictionary)walletSessionData
                  reason:(NSString)reason)

RCT_EXTERN_METHOD(mintingTransactionSuccess:(NSDictionary)walletSessionData
                  txHash:(NSString)txHash)

RCT_EXTERN_METHOD(mintingTransactionFailure:(NSDictionary)walletSessionData
                  reason:(NSString)reason)

@end
