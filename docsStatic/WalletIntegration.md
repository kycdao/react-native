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

The SDK requires that it has access to wallet related data and functions. The `WalletSession` interface describes a communication session with your wallet, where these function and data requirements are defined. You have to create a conforming class to this interface and provide an implementation of the signing and minting functions.

### Conforming to WalletSession interface

Properties   | Implementation
:--:    | ---
`id` | A unique identifier for your session, assigning `UUID.randomUUID().toString()` to this property at the initialization of your implementation should be enough.
`chainId` | The ID of the chain used specified in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md). For example eip155:1 is the chainId of Ethereum Mainnet.

### Functions

`personalSign(walletAddress: String, message: String): String`

In the implementation of this function your wallet is expected to sign a message (for EVM chains use the personal_sign call), with the given wallet address. The return value of this function should be the signed message.

`sendMintingTransaction(walletAddress: String, mintingProperties: MintingProperties): MintingTransactionResult`

In the implementation of this function your wallet is expected to send a transaction (for EVM chains use eth_sendTransaction call), with the given wallet address using the minting properties. Returns the transaction hash wrapped in a `MintingTransactionResult` class.

## Checking the verification status of an address

When you already have the chain information of the user's wallet, you can use a chain id in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) format to check for a valid token.

```kotlin
val chainId = "eip155:80001"
val hasValidToken = VerificationManager.hasValidToken(
    verificationType = VerificationType.KYC,
    walletAddress = walletAddress,
    chainId = chainId
)
```

## Starting the onboarding flow

First you need to have an instance of an object you created at the ‘Conforming to WalletSession interface’ section. Once you obtained your wallet session instance, pass it along with a wallet address to `createSession(walletAddress: String, walletSession: WalletSession)`

```kotlin
val walletSessionImpl : WalletSession = ... // Create an instance of your WalletSession implementation
val verificationSession = VerificationManager.createSession(
    walletAddress = selectedAddress,
    walletSession = walletSessionImpl
)
```

## Implementing the onboarding process

[!ref](Onboarding.md)