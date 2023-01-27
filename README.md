# ``KycDao``

Composable Compliance

## Overview

React Native SDK of [kycDAO](https://kycdao.xyz/)

With the kycDAO React Native SDK you can 
- check whether a wallet address have been verified and has a valid token. 
- go through the verification process from identification till kycNFT minting.

The SDK can be used by
- Wallets
- DApps
- Web2 Applications

### Documentation

The documentation of the SDK is available [here](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/).

### Installation

#### NPM

```sh
npm install kycdao-mobile
```

#### Importing to source file

Add an import at the top of your source file

With namespace import

```js
import * as KycDao from 'kycdao-mobile';
```

or with named import

```js
import {
  WalletConnectManager, 
  WalletConnectSession, 
  VerificationManager, 
  IdentityFlowResult, 
  VerificationStatus, 
  PersonalData, 
  VerificationType, 
  NetworkConfig,
  WCSessionError,
  Configuration,
  KycDaoEnvironment,
  BaseWalletSession,
  MintingTransactionResult
} from 'kycdao-mobile';
```

That's it. You can start coding.

### Configuration

Set up the environment and [Configure the SDK](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/configuresdk/) for your needs

> Important: It is recommended that you bring your own nodes when using the SDK, you can check the [Configure SDK](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/configuresdk/) article to see how to set your own RPC URLs for your supported networks.

### Example

An example React Native project for a DApp implementation is available in the [example](https://github.com/kycdao/react-native/tree/main/example) folder.

### Integration

Learn the [Wallet Integration](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/walletintegration/) or [DApp Integration](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/dappandweb2/) specific steps to use the SDK

Help your users getting verified by implementing the [Onboarding](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/onboarding/) flow

Deep dive into the SDK by visiting the [API documentation](https://docs.kycdao.xyz/mobilesdk/react-native-sdk/api/)

### Supported networks

Main | Test
--- | ---
Polygon | Polygon Mumbai
Celo | Celo Alfajores


### Other platforms

The SDK is also available on other mobile platforms (Android, iOS) and Web. 
You can browse our available SDKs [here](https://docs.kycdao.xyz/)

You can learn about [smart contract gating here](https://docs.kycdao.xyz/smartcontracts/onchaingating/)
