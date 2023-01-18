import * as React from 'react';

import { StyleSheet, Text, Button, SafeAreaView, TextInput, Alert, EmitterSubscription, Platform } from 'react-native';
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
  BaseWalletSession
} from 'kycdao-mobile';

const configuration = new Configuration(
  KycDaoEnvironment.Dev, 
  [new NetworkConfig("eip155:80001", "https://matic-mumbai.chainstacklabs.com")]
);

export default function App() {
  const walletSessionRef = React.useRef<BaseWalletSession>();
  const sessionStartSubscription = React.useRef<EmitterSubscription>();
  const uriChangeSubscription = React.useRef<EmitterSubscription>();

  const verifyWallet = async () => {
    
    if (walletSessionRef.current !== undefined) {
      let walletSession = walletSessionRef.current as WalletConnectSession
      if (walletSession !== undefined) {

        let verificationManager = VerificationManager.getInstance();
      let verificationSession = await verificationManager.createSession(walletSession.accounts[0]!, walletSession);
      console.log(verificationSession);
      console.log("VERIFICATIONSESSION CREATED");

      if (verificationSession.loggedIn === false) {
        await verificationSession.login();
        console.log("REACT DEBUG: LOGING IN");
      }
      console.log("REACT DEBUG: LOGGED IN");

      console.log(verificationSession.disclaimerText);
      console.log(verificationSession.termsOfServiceURL);
      console.log(verificationSession.privacyPolicyURL);

      if (verificationSession.disclaimerAccepted === false) {
        await verificationSession.acceptDisclaimer();
      }

      if (verificationSession.requiredInformationProvided === false) {
        console.log("REACT DEBUG: ACCEPT DISCLAIMER");
        console.error("Change email from example@example.com to a valid email to test this. Comment out this and the next line of code when ready");
        throw Error("Email not configured in personal data");
        let personalData = new PersonalData(
          "example@example.com", "HU"
        );
        await verificationSession.setPersonalData(personalData);
        console.log("REACT DEBUG: UPDATE USER");
      }

      console.log("REACT DEBUG: REQUIRED INFORMATION AVAILABLE");

      if (verificationSession.emailConfirmed === false) {
        console.log("REACT DEBUG: SEND CONFIRM EMAIL");
        await verificationSession.resumeOnEmailConfirmed();
        console.log("REACT DEBUG: CONTINUE WHEN EMAIL CONFIRMED");
      }

      console.log("REACT DEBUG: EMAIL IS OK");
      console.log(verificationSession.verificationStatus);
      console.log(verificationSession.verificationStatus === VerificationStatus.NotVerified);

      if (verificationSession.verificationStatus === VerificationStatus.NotVerified) {
        console.log("REACT DEBUG: before identification");
        let identificationStatus = await verificationSession.startIdentification();
        console.log("REACT DEBUG: startIdentification");
        console.log("REACT DEBUG:" + identificationStatus);
        console.log("REACT DEBUG:" + IdentityFlowResult.Completed);
        console.log("REACT DEBUG:" + identificationStatus == IdentityFlowResult.Completed);

        if (identificationStatus === IdentityFlowResult.Completed) {
          await verificationSession.resumeOnVerificationCompleted();
          console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
        } else {
          console.log("REACT DEBUG: Identity flow cancelled!");
          return;
        }
      } else if (verificationSession.verificationStatus === VerificationStatus.Processing) {
        await verificationSession.resumeOnVerificationCompleted();
        console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      }

      if (verificationSession.hasMembership === false) {
        console.log("REACT DEBUG: DOES NOT HAVE MEMBERSHIP");
        let membershipCostPerYear = await verificationSession.getMembershipCostPerYearText();
        console.log(membershipCostPerYear);
        console.log("MEMBERSHIP COST PER YEAR: " + membershipCostPerYear);
        let paymentEstimation = await verificationSession.estimatePayment(3);
        console.log("PAYMENT ESTIMATION: " + paymentEstimation.paymentAmountText);
        console.log(paymentEstimation);
      }

      console.log("IT'S MINTING TIME"); //Bravo Vince
      let images = await verificationSession.getNFTImages();
      console.log("REACT DEBUG: GOT IMAGES " + images);
      await verificationSession.requestMinting(images[0].id, 3);
      console.log("REACT DEBUG: GOT MINTING AUTH");
      let estimation = await verificationSession.getMintingPrice();
      console.log("REACT PRICE:" + estimation.fullPriceText);
      console.log(estimation);

      let mintingResult = await verificationSession.mint();
      console.log(mintingResult);
      console.log("URI:" + mintingResult.explorerURL);
      console.log("REACT DEBUG: Hurray");

      }
    }
  };

  React.useEffect(() => {

    const configure = async () => {
      await VerificationManager.configure(configuration);
    }

    console.log("REACT DEBUG: HERE AGAIN");
    configure().catch(console.error);;
    
    let walletConnectManager = WalletConnectManager.getInstance();

    uriChangeSubscription.current = walletConnectManager.subscribeOnURIChange((uri?: string) => {
      console.log("NEW URI: " + uri);
    });

    sessionStartSubscription.current = walletConnectManager.subscribeOnSession(async (walletSession: WalletConnectSession) => {
      console.log("RECEIVED SESSION UPDATE");

      walletSessionRef.current = walletSession;
    },
    //Session start failure
    async (error: WCSessionError) => {
      console.error(error);
    });

    walletConnectManager.startListening();
    return function cleanup() {
      if (sessionStartSubscription.current !== undefined) {
        sessionStartSubscription.current.remove();
      }
      if (uriChangeSubscription.current !== undefined) {
        uriChangeSubscription.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Button
        title="Connect wallet"
        color="#f194ff"
        onPress={async () => {
          try {
            let walletConnectManager = WalletConnectManager.getInstance();
            if (Platform.OS === 'ios') {
              let wallets = await walletConnectManager.listWallets();
              console.debug(wallets.find(x => x.name === "MetaMask"));
              let metamask = wallets.find(x => x.name === "MetaMask");
              if (metamask !== undefined) {
                await walletConnectManager.connect(metamask);
              }
            } else {
              await walletConnectManager.connect();
            }
          } catch (error) {
            console.error(error);
          }
        }}
      />
      <Button
        title="Verify wallet"
        color="#f194ff"
        onPress={ verifyWallet }
      />
      <Button
        title='Check if wallet has token'
        color="#0907ab"
        onPress={async () => {
          console.log("Pressed:")
          console.log(walletSessionRef.current)
          if (walletSessionRef.current !== undefined) {
            let walletConnectSession = walletSessionRef.current as WalletConnectSession
            if (walletConnectSession !== undefined) {
              let res = await VerificationManager.getInstance()
                .hasValidToken(
                  VerificationType.KYC,
                  walletConnectSession.accounts[0],
                  walletConnectSession
                )
              console.log(res)
              Alert.alert("Has valid token?", res ? "yes" : "no")
            }
          }
        }}
      />
      <Button
        title='Check verified networks'
        color="#0907ab"
        onPress={async () => {
          console.log("Pressed:")
          console.log(walletSessionRef.current)
          if (walletSessionRef.current !== undefined) {
            let walletConnectSession = walletSessionRef.current as WalletConnectSession
            if (walletConnectSession !== undefined) {
              let res = await VerificationManager.getInstance()
                .checkVerifiedNetworks(
                  VerificationType.KYC,
                  walletConnectSession.accounts[0]
                );
              console.log(res);
              Alert.alert(JSON.stringify(res));
            }
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',

  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  input: {
    marginVertical: 20,
    height: 40,
    borderWidth: 1,
    padding: 10,
  },
});
