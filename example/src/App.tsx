import * as React from 'react';

import { StyleSheet, View, Text, NativeEventEmitter, Button } from 'react-native';
import { launchKycFlow, multiply, printStuff, WalletConnectManager, WalletSession, KYCManager, IdentityFlowResult, VerificationStatus, PersonalData } from 'kycdao-mobile';


export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);

    var walletConnectManager = WalletConnectManager.getInstance();
    this.eventListener = walletConnectManager.addSessionStartListener(async (event) => {
      var walletSession = event as WalletSession;
      console.log("Session received");
      console.log(walletSession);
      var kycManager = KYCManager.getInstance();
      var kycSession = await kycManager.createSession(walletSession.accounts[0]!, walletSession);
      console.log(kycSession);
      console.log("KYCSESSION CREATED");

      if (kycSession.loggedIn == false) {
        await kycSession.login();
        console.log("REACT DEBUG: LOGING  IN");

      }
      console.log("REACT DEBUG: LOGGED IN");


      if (kycSession.requiredInformationProvided == false) {
        await kycSession.acceptDisclaimer();
        console.log("REACT DEBUG: ACCEPT DISCLAIMER");
        var personalData = new PersonalData(
          "adam@bitraptors.com", "HU", false
        )
        await kycSession.setPersonalData(personalData);
        console.log("REACT DEBUG: UPDATE USER");
      }
      console.log("REACT DEBUG: REQUIRED INFORMATION AVAILABLE");

      if (kycSession.emailConfirmed == false) {
        await kycSession.sendConfirmationEmail();
        console.log("REACT DEBUG: SEND CONFIRM EMAIL");
        await kycSession.continueWhenEmailConfirmed();
        console.log("REACT DEBUG: CONTINUE WHEN EMAIL CONFIRMED");
      }
      console.log("REACT DEBUG: EMAIL IS OK");
      console.log(kycSession.verificationStatus);
      console.log(kycSession.verificationStatus === VerificationStatus.NotVerified);

      if (kycSession.verificationStatus == VerificationStatus.NotVerified) {
        console.log("REACT DEBUG: before identification");
        let identificationStatus = await kycSession.startIdentification();
        console.log("REACT DEBUG: startIdentification");
        console.log("REACT DEBUG:" + identificationStatus)
        console.log("REACT DEBUG:" + IdentityFlowResult.Completed)
        console.log("REACT DEBUG:" + identificationStatus == IdentityFlowResult.Completed)


        if (identificationStatus == IdentityFlowResult.Completed) {
          await kycSession.resumeOnVerificationCompleted();
          console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
        } else {
          console.log("REACT DEBUG: Identity flow cancelled!");
          return
        }
      }
      else if (kycSession.verificationStatus == VerificationStatus.Processing) {
        await kycSession.resumeOnVerificationCompleted();
        console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      }
      console.log("IT'S MINTING TIME")
      let images = await kycSession.getNFTImages();
      console.log("REACT DEBUG: GOT IMAGES " + images);
      await kycSession.requestMinting(images[0].id);
      console.log("REACT DEBUG: GOT MINTING AUTH");
      var estimation = await kycSession.estimateGasForMinting()
      console.log("REACT PRICE:"+estimation.feeInNative)
      var uri = await kycSession.mint();
      console.log("URI:"+uri)
      console.log("REACT DEBUG: Hurray");

    });

    return function cleanup() { 
      this.eventListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <Button
        title="Press me"
        color="#f194ff"
        onPress={ async () => {
          var walletConnectManager = WalletConnectManager.getInstance();
          var id = await walletConnectManager.startListening();
          printStuff(id);
          var wallets = await walletConnectManager.listWallets();
          console.log(wallets);
          console.debug(wallets.map(x => x.name));
          printStuff(wallets.map(x => x.name).join(","));
          console.debug(wallets);
          console.debug(wallets.find(x => x.name === "MetaMask"));
          var metamask = wallets.find(x => x.name === "MetaMask");
          if (metamask !== undefined) {
            await walletConnectManager.connect(metamask);
          }
         }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
