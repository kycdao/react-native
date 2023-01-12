import * as React from 'react';

import { StyleSheet, Text, Button, SafeAreaView, TextInput, Alert, EmitterSubscription } from 'react-native';
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
        let personalData = new PersonalData(
          "robin@bitraptors.com", "HU"
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
        let membershipCostPerYear = await verificationSession.getMembershipCostPerYear();
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
  const [text, onChangeText] = React.useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Result</Text>
      <Button
        title="Start flow"
        color="#f194ff"
        onPress={async () => {
          try {
            let walletConnectManager = WalletConnectManager.getInstance();
            let wallets = await walletConnectManager.listWallets();
            console.log(wallets);
            console.debug(wallets.map(x => x.name));
            console.debug(wallets);
            console.debug(wallets.find(x => x.name === "MetaMask"));
            let metamask = wallets.find(x => x.name === "MetaMask");
            if (metamask !== undefined) {
              await walletConnectManager.connect(metamask);
            }
          } catch (error) {
            console.error(error);
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder='wallet address'
        value={text}
        onChangeText={onChangeText}
      />
      <Button
        title='Check if address has token'
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
