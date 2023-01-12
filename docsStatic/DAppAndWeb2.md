---
label: DApp and Web2 Integration
icon: chevron-right
order: 900
---

# DApp and Web2 integration

## Overview

This article provides a guide for integrating the SDK into an app which is not a wallet. Signing and minting will be performed by a separate wallet app, which will have to be connected to the SDK. For this task, the SDK uses WalletConnect.

Three main topics will be discussed here:

- Connecting to a wallet
- Checking the verification status of an address
- Initializing a verification flow

## Connecting to a wallet

Connecting to wallets starts with the `WalletConnectManager` having to actively listen for peers which will accept our session offer.

The `WalletConnectManager` has to be used through a singleton instance. You can obtain it using

```js
let walletConnectManager = WalletConnectManager.getInstance()
```

To start listening for incoming connections, use

```js
walletConnectManager.startListening()
```

!!!warning
When you no longer want to connect to new wallets, you should call ``WalletConnectManager.stopListening()``
!!!

The `WalletConnectManager` will keep waiting for new connections and emit session start and session failure events. 

!!!warning
This subscription has to be stored and when you no longer need it, call `subscription.remove()`
!!!

```js
let subscription = walletConnectManager.subscribeOnSession(
    async (walletSession: WalletConnectSession) => {
        // Successfull connection
    },
    async (error: WCSessionError) => {
        // The connection failed or it was declined
    });
```

The user's wallet can be connected via the following two options:

- Present them a QR code which they can scan to connect
- Open a wallet
    - Android: Rely on the built in intent mechanism to oppen them
    - iOS: Show them a list of supported wallet apps, where they can manually select their own

### Connecting through QR Code

The QR Code for WalletConnect is an URI. This URI will change with every attempt at connecting to a wallet, regerdless if it was a successful or not. This is needed to ensure that the system is always ready for new connections.
You can subscribe to these URI change events. Here's an example how to handle the incoming URI changes:

```js
walletConnectManager.subscribeOnURIChange((uri?: string) => {
    console.log("NEW URI: " + uri);
    // Encode URI as a QR code
    // Set imageView content to the QR code
});
```

Once the user scans the QR code and accepts the prompt shown by the wallet, the `subscribeOnSession` will emit the successfully established `WalletConnectSession`s, and `subscribeOnURIChange` will emit the URI for the next possible connection.

### Connecting by opening the wallet app

On iOS, the user has to select a wallet app they wish to connect to from a list that is based on [WalletConnect V1 registry](https://registry.walletconnect.com/api/v1/wallets).

On Android if the wallet that the user wishes to connect to is installed on the same device as the SDK is running on, the target wallet will appear on a system sheet where you can select it.

```js
if (Platform.OS === 'ios') {
    let wallets = await walletConnectManager.listWallets();
    let selectedWallet = wallets[0]; // User selects wallet
    await walletConnectManager.connect(selectedWallet);
} else {
    await walletConnectManager.connect();
}
```

!!!warning
Before doing this make sure that the `WalletConnectManager` is listening for connection.
!!!

Once the wallet is launched and the user accepts the connection, `subscribeOnSession` will emit the established `WalletConnectSession`, and `subscribeOnURIChange` will emit the URI for the next possible connection.

## Check verification status of an address

Depending on your usecase, there are two options to choose from.

First, if you already obtained the user's wallet address, you can use it to check if they have a valid token or not. With this option you have to provide the chainID on which you want to check, yourself.

In case the user’s wallet address is unknown, you can get a connection through `WalletConnectManager` to their wallet and use the `WalletConnectSession` object to ask for their verification status.

### Using exixting wallet information

When you already have the chain information of the user's wallet, you can use a chain id in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) format to check for a valid token.

```js
const chainId = "eip155:80001"
let hasValidToken = await VerificationManager.getInstance()
    .hasValidToken(
        VerificationType.KYC,
        walletAddress,
        chainId
    )
```

### Using WalletConnectSession

`WalletConnectSession` contains a blockchain account list (wallet addresses), with all the accounts returned by WalletConnect for the connection with the wallet app. The user should select their address from accounts if there are more than one, otherwise the one available address can be used.

Once we obtained the wallet address, we can call

```js
let hasValidToken = await VerificationManager.getInstance()
    .hasValidToken(
        VerificationType.KYC,
        walletAddress,
        walletSession
    )
```

## Starting the verification flow

The requirements before starting the verification process are that you need to have a `WalletConnectSession` and a selected wallet address from the available accounts.

```js
let verificationSession = await VerificationManager.getInstance()
    .createSession(walletAddress!, walletSession);
```

## Implementing the onboarding process

[!ref](Onboarding.md)

## Summary

```js
Summary code
```
