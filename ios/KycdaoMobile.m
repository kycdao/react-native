#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(KycdaoMobile, NSObject)

@end


@interface RCT_EXTERN_MODULE(RNWalletConnectManager, RCTEventEmitter)

RCT_EXTERN_METHOD(startListening:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(listWallets:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(connect:(NSDictionary)walletDict resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sign:(NSDictionary)sessionData account:(NSString)account message:(NSString)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendMintingTransaction:(NSDictionary)sessionData walletAddress:(NSString)walletAddress mintingProperties:(NSDictionary)mintingProperties resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end

@interface RCT_EXTERN_MODULE(RNVerificationManager, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary)configurationData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createSession:(NSString)walletAddress
                  walletSession:(NSDictionary)walletSessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasValidToken:(NSString)verificationTypeData
                  walletAddress:(NSString)walletAddress
                  chainId:(NSString)chainId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkVerifiedNetworks:(NSString)verificationTypeData
                  walletAddress:(NSString)walletAddress
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(login:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(acceptDisclaimer:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setPersonalData:(NSDictionary)sessionData
                  personalData:(NSDictionary)personalData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateEmail:(NSDictionary)sessionData
                  email:(NSString)email
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(resendConfirmationEmail:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(resumeOnEmailConfirmed:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startIdentification:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(resumeOnVerificationCompleted:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getNFTImages:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(regenerateNFTImages:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getMembershipCostPerYearText:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getMintingPrice:(NSDictionary)sessionData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(estimatePayment:(NSDictionary)sessionData
                  yearsPurchased:(nonnull NSNumber)yearsPurchased
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestMinting:(NSDictionary)sessionData
                  selectedImageId:(NSString)selectedImageId
                  membershipDuration:(nonnull NSNumber)membershipDuration
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
                  mintingTransactionResultData:(NSDictionary)mintingTransactionResultData)

RCT_EXTERN_METHOD(mintingTransactionFailure:(NSDictionary)walletSessionData
                  reason:(NSString)reason)

@end
