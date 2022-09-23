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

@end

@interface RCT_EXTERN_MODULE(RNKYCManager, RCTEventEmitter)

RCT_EXTERN_METHOD(createSession:(NSString)walletAddress walletSession:(NSDictionary)walletSessionData resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(login:(NSDictionary)sessionData resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(personalSignSuccess:(NSDictionary)walletSessionData signature:(NSString)signature)
RCT_EXTERN_METHOD(personalSignFailure:(NSDictionary)walletSessionData reason:(NSString)reason)

RCT_EXTERN_METHOD(mintingTransactionSuccess:(NSDictionary)walletSessionData txHash:(NSString)txHash)
RCT_EXTERN_METHOD(mintingTransactionFailure:(NSDictionary)walletSessionData reason:(NSString)reason)

@end
