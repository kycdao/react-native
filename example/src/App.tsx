import * as React from 'react';

import { StyleSheet, View, Text, NativeEventEmitter, Button } from 'react-native';
import { launchKycFlow, multiply, printStuff, WalletConnectManager, WalletSession, KYCManager, IdentityFlowResult, VerificationStatus } from 'kycdao-mobile';

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
      
      if (kycSession.isLoggedIn == false) {
        await kycSession.login();
        console.log("REACT DEBUG: LOGIN");
      }

      if (kycSession.requiredInformationProvided == false) {
        await kycSession.acceptDisclaimer();
        console.log("REACT DEBUG: ACCEPT DISCLAIMER");
        await kycSession.savePersonalInfo("robin+kyc@bitraptors.com", "HU", false);
        console.log("REACT DEBUG: UPDATE USER");
      }
      
      if (kycSession.emailConfirmed == false) {
        await kycSession.sendConfirmationEmail();
        console.log("REACT DEBUG: SEND CONFIRM EMAIL");
        await kycSession.continueWhenEmailConfirmed();
        console.log("REACT DEBUG: CONTINUE WHEN EMAIL CONFIRMED");
      }

      if (kycSession.verificationStatus == VerificationStatus.NotVerified) {
        let identificationStatus = await kycSession.startIdentification();
        console.log("REACT DEBUG: startIdentification");
        if (identificationStatus == IdentityFlowResult.Completed) {
          await kycSession.continueWhenIdentified();
          console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
        } else {
          console.log("REACT DEBUG: Identity flow cancelled!");
          return
        }
      } else if (kycSession.verificationStatus == VerificationStatus.Processing) {
        await kycSession.continueWhenIdentified();
        console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      }
      
      let images = await kycSession.getNFTImages();
      console.log("REACT DEBUG: GOT IMAGES " + images);
      await kycSession.requestMinting(images[0].id);
      console.log("REACT DEBUG: GOT MINTING AUTH");
      await kycSession.mint();
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
