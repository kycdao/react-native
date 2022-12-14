---
label: Wallet Integration
icon: chevron-right
order: 850
---

## Overview

This article provides a guide for integrating the SDK into a wallet app.
The following topics will be discussed here:
- Handle wallet related tasks
- Checking the verification status of an address
- Starting the verification flow

## Handle wallet related tasks

The SDK requires that it has access to wallet related data and functions. The `BaseWalletSession` abstract class describes a communication session with your wallet, where these function and data requirements are defined. You have to inherit from this abstract class and provide an implementation of the signing and minting functions.

### Inheriting from BaseWalletSession

Properties   | Implementation
:--:    | ---
`id` | A unique identifier for your session. Assigning a random UUID at the initialization of your class should be enough.
`chainId` | The ID of the chain used specified in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md). For example eip155:1 is the chainId of Ethereum Mainnet.

### Functions

`abstract personalSign(walletAddress: string, message: string): Promise<string>`

In the implementation of this function your wallet is expected to sign a message (for EVM chains use the personal_sign call), with the given wallet address. The return value of this function should be the signed message.

`abstract sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<MintingTransactionResult>`

In the implementation of this function your wallet is expected to send a transaction (for EVM chains use eth_sendTransaction call), with the given wallet address using the minting properties. Returns the transaction hash wrapped in a `MintingTransactionResult` class.

## Checking the verification status of an address

### Using your WalletSession implementation

You have to pass your `BaseWalletSession` object to `VerificationManager.hasValidToken(verificationType:walletAddress:walletSession:)` along with a wallet address and verification type.

```js
let hasValidToken = await VerificationManager.getInstance()
    .hasValidToken(
        VerificationType.KYC,
        walletAddress,
        walletSession
    )
```

### Using existing wallet information

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

## Starting the onboarding flow

First you need to have an instance of an object you created at the ‘Inheriting from BaseWalletSession’ section. Once you obtained your wallet session instance, pass it along with a wallet address to `createSession(walletAddress: string, walletSession: BaseWalletSession)`

```js
let walletSession : BaseWalletSession = ... // Create an instance of your BaseWalletSession’ implementation
let verificationSession = await VerificationManager.getInstance()
    .createSession(walletAddress!, walletSession);
```

## Implementing the onboarding process

[!ref](Onboarding.md)