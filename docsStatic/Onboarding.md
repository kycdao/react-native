---
label: Onboarding
icon: chevron-right
order: 800
---

A guide for the verification process and kycNFT minting

## Overview

This guide will help you implementing the whole process of minting a kycNFT. The process consists of the following steps:

1. Login to kycDAO with your wallet
2. Make the user accept the disclaimer
3. Gather some personal information from the user
4. Confirm email
5. Verification
6. Select membership duration
7. Select kycNFT image to mint
8. Mint kycNFT

The user can end up at almost any point of the verification process. It is important to manage that users may interrupt the verification process and return later to complete the flow. You can determine the next step of the user using various state properties of the `VerificationSession`, for example `disclaimerAccepted`. Keep in mind that these values may change for an existing user. For example the disclaimer acceptance will be reseted if the contents of the disclaimer change and a new user consent is required.

## Requirements

Before you can implement the verification flow, you must follow either the [DApp and Web2 Integration](DappAndWeb2.md) guide for DApps or the [Wallet Integration](/build/SDKs/MobileSDKs/Android/WalletIntegration.md) guide.

## Steps

### 1. Login

Once you obtained a `VerificationSession` as shown in [DApp and Web2 Integration](DAppAndWeb2.md) and [Wallet Integration](WalletIntegration.md) guide, you can login your wallet to that session.

```js
await verificationSession.login()
```

### 2. Accepting the disclaimer

The user has to accept the disclaimer before being able to interact with kycDAO services. You can get the **disclaimer text** from `disclaimerText`, the **ToS** link from `termsOfService` and the **Privacy Policy** link from `privacyPolicy`.

```js
if (verificationSession.disclaimerAccepted === false) {
    await verificationSession.acceptDisclaimer()
}
```

!!!danger Important
When implementing the SDK, you are required to show the full disclaimer to the user, and make them able to visit the ToS and PP.
!!!

### 3. Supplying personal information

It can be checked whether this step was already completed or not by reading the value of `requiredInformationProvided`. If not, then the required informations have to be provided by the user and submited. This step will fail if the disclaimer is not yet accepted.

```js
if (verificationSession.requiredInformationProvided === false) {
    let personalData = PersonalData(
        email = "example@email.com",
        residency = "US", // Residency is in ISO 3166-2
    )
    await verificationSession.setPersonalData(personalData)
}
```

A user's email address can be changed with `updateEmail(newEmail: string)`, but ***only*** if the user never requested minting before.

!!! Confirmation email
Calling `setPersonalData(personalData: PersonalData)` will send a confirmation email to the provided email address automatically
!!!

### 4. Confirm email

After calling `setPersonalData(personalData: PersonalData)`, in order to proceed forward the email has to be confirmed by the user.

If the user failed to recive or lost the email, then it may be resent by calling the `resendConfirmationEmail()` function.
You could also let them edit their email address with `updateEmail(newEmail: string)` to correct an incorrect email address.

```js
await verificationSession.resendConfirmationEmail()
```

Listening for email confirmation is done by calling `resumeOnEmailConfirmed()`, this will suspend the coroutine until we receive a positive response, that the email has indeed been confirmed.

```js
if (verificationSession.emailConfirmed === false) {
    await verificationSession.resumeOnEmailConfirmed()
}
```

### 5. Verification

Verification is currently done through Persona. You can check whether the user already has an accepted verification using the property `verificationStatus`.

`VerificationStatus` | Meaning
--- | ---
`verified` | The user was successfully verified
`processing` | The user is under verification
`notVerified` | The user is not verified (missing or rejected verification)

The Persona identity verification process will launch a separate modal. You can launch the identity process by calling

```js
let status = await verificationSession.startIdentification()
switch (identificationStatus) {
    case IdentityFlowResult.Completed:
        // User completed Persona
        break;
    case IdentityFlowResult.Cancelled:
        // Persona was cancelled by the user
        break;
    default:
        throw new Error(`Non-existent IdentifiyFlowResult in switch: ${identificationStatus}`);
}
```

!!! Note
The result of `startIdentification()` does not indicate whether the verification was successful or not. It merely signals that the user completed the Persona identity process or not.
!!!

To wait for the identity verification to complete, use `resumeOnVerificationCompleted()`, which suspends the execution and resumes when the user becomes verified.

#### Logical flow for the verification

```js
if (verificationSession.verificationStatus === VerificationStatus.Processing) {
    
    await verificationSession.resumeOnVerificationCompleted();
    
} else if (verificationSession.verificationStatus === VerificationStatus.NotVerified) {
    
    let result = await verificationSession.startIdentification();
    
    if (result === IdentityFlowResult.Completed) {
        await verificationSession.resumeOnVerificationCompleted();
    } else {
        // Persona was cancelled by the user
        // Handle it gracefully, user should be able to relaunch the identification
    }
}
```

### 6. Select membership duration

In order to mint a kycNFT, you need to purchase a kycDAO membership. 

- Check the user's membership status with `hasMembership`.

If the user does not have a membership, they have to buy one. They can buy memberships that last from a one year minimum period till multiple years. 

The price of membership goes up linearly with the membership duration. It is currently set in cost per year. 

- Get the current cost by calling `getMembershipCostPerYear()`

Your user can receive a discount for a number of years, for example the first year can be free, regardless of how many years you purchase: if you purchase 1 year, your membership for that 1 year subscription will be free in this case. 

- Estimate the user's membership payment for any number of years by calling `estimatePayment(yearsPurchased:)`
- Get the number of discounted years granted to the user from `PaymentEstimation.discountYears`

!!! Important
If the user already has a membership, they can't purchase new memberships to extend their subscription periods. You should skip this step for them and make them continue with kycNFT selection. They can still remint their kycNFTs but they don't have to repurchase memberships for it.
!!!

```js
// Display yearly membership cost in dollars
let membershipCostPerYear = await verificationSession.getMembershipCostPerYear();

// Calculating membership payment estimation for 3 years
// then displaying the payment amount and applied discounts
let paymentEstimation = await verificationSession.estimatePayment(3);
// paymentEstimation.paymentAmountText contains a human readable payment amount with named currency
// paymentEstimation.discountYears contains the number of free years applied
```

The selected membership duration will be used to request minting with `requestMinting(selectedImageId:membershipDuration:)`

### 7. Select kycNFT image to mint

First you should obtain the possible kycNFT images by calling `getNFTImages()`. This returns an array of `TokenImage`s, which has an url field usable to preview the kycNFT images.

After the user selected their image of choice, the minting has to be authorized for that particular image and selected membership duration (in years) with `requestMinting(selectedImageId:membershipDuration:)`

In case the user already has membership, setting a membership duration will have no effect, but it is recommended to set it to 0 for them.

```js
let nftImages = await verificationSession.getNFTImages();
let selectedImage = nftImages[0]; // user selects a single TokenImage out of nftImages
let membershipDuration = 3; // get the membership duration based on the user's input
await verificationSession.requestMinting(selectedImage.id, membershipDuration);
```

!!! Note
`requestMinting(selectedImageId:membershipDuration:)` blocks the execution until the authorization finishes.
!!!

### 8. Mint kycNFT

#### Display mint price estimation to user

Call `getMintingPrice()` for mint price estimation, which includes: 
- membership payment amount for the selected duration
- gas fee
- currency information 
- full price of minting

```js
let estimation = await verificationSession.getMintingPrice();
// mintingPrice.fullPriceText contains the full price (payment + gas fee) in a human readable format
```

#### Mint

The returned `MintingResult` can be used to let the user view their transaction on the explorer linked by `explorerURL`, show them the kycNFT using `imageURL`, or write some custom logic around `tokenId` and `transactionId`.

```js
let mintingResult = await verificationSession.mint();
```
