import * as React from 'react';

import { StyleSheet, Text, Button, SafeAreaView, TextInput, Alert } from 'react-native';
import { multiply, printStuff, WalletConnectManager, WalletSession, KYCManager, IdentityFlowResult, VerificationStatus, PersonalData, VerificationType, NetworkOption } from 'kycdao-mobile';
import type { WalletConnectSessionInterface } from 'src/WalletConnect/WalletConnectModels';


export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const walletSessionRef = React.useRef<WalletConnectSessionInterface>();


  React.useEffect(() => {
    multiply(3, 7).then(setResult);
    console.log("REACT DEBUG: HERE AGAIN")
    var walletConnectManager = WalletConnectManager.getInstance();
    walletConnectManager.addCustomRpcURL(
      "eip155:80001", "https://polygon-rpc.com"
    )
    this.onSuccess = walletConnectManager.onSessionSuccessfullyEstablished(async (event) => {
      var walletSession = event as WalletSession;
      walletSessionRef.current = walletSession;

      // var kycManager = KYCManager.getInstance();
      // var kycSession = await kycManager.createSession(walletSession.accounts[0]!, walletSession);
      // console.log(kycSession);
      // console.log("KYCSESSION CREATED");

      // if (kycSession.loggedIn == false) {
      //   await kycSession.login();
      //   console.log("REACT DEBUG: LOGING IN");

      // }
      // console.log("REACT DEBUG: LOGGED IN");


      // if (kycSession.requiredInformationProvided == false) {
      //   await kycSession.acceptDisclaimer();
      //   console.log("REACT DEBUG: ACCEPT DISCLAIMER");
      //   var personalData = new PersonalData(
      //     "adam@bitraptors.com", "HU", false
      //   )
      //   await kycSession.setPersonalData(personalData);
      //   console.log("REACT DEBUG: UPDATE USER");
      // }
      // console.log("REACT DEBUG: REQUIRED INFORMATION AVAILABLE");

      // if (kycSession.emailConfirmed == false) {
      //   await kycSession.sendConfirmationEmail();
      //   console.log("REACT DEBUG: SEND CONFIRM EMAIL");
      //   await kycSession.continueWhenEmailConfirmed();
      //   console.log("REACT DEBUG: CONTINUE WHEN EMAIL CONFIRMED");
      // }
      // console.log("REACT DEBUG: EMAIL IS OK");
      // console.log(kycSession.verificationStatus);
      // console.log(kycSession.verificationStatus === VerificationStatus.NotVerified);

      // if (kycSession.verificationStatus == VerificationStatus.NotVerified) {
      //   console.log("REACT DEBUG: before identification");
      //   let identificationStatus = await kycSession.startIdentification();
      //   console.log("REACT DEBUG: startIdentification");
      //   console.log("REACT DEBUG:" + identificationStatus)
      //   console.log("REACT DEBUG:" + IdentityFlowResult.Completed)
      //   console.log("REACT DEBUG:" + identificationStatus == IdentityFlowResult.Completed)


      //   if (identificationStatus == IdentityFlowResult.Completed) {
      //     await kycSession.resumeOnVerificationCompleted();
      //     console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      //   } else {
      //     console.log("REACT DEBUG: Identity flow cancelled!");
      //     return
      //   }
      // }
      // else if (kycSession.verificationStatus == VerificationStatus.Processing) {
      //   await kycSession.resumeOnVerificationCompleted();
      //   console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      // }
      // console.log("IT'S MINTING TIME")
      // let images = await kycSession.getNFTImages();
      // console.log("REACT DEBUG: GOT IMAGES " + images);
      // await kycSession.requestMinting(images[0].id);
      // console.log("REACT DEBUG: GOT MINTING AUTH");
      // var estimation = await kycSession.estimateGasForMinting()
      // console.log("REACT PRICE:" + estimation.feeInNative)
      // var uri = await kycSession.mint();
      // console.log("URI:" + uri)
      // console.log("REACT DEBUG: Hurray");

    });
    this.onFailed = walletConnectManager.onSessionFailed(async (event) => {
      console.log("REACT DEBUG: WALLETCONNECTION FAILED")
    })
    walletConnectManager.startListening();
    return function cleanup() {
      this.onSuccess.remove();
      this.onFailed.remove();

    };
  }, []);
  const [text, onChangeText] = React.useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Result: {result}</Text>
      <Button
        title="Start flow"
        color="#f194ff"
        onPress={async () => {
          var walletConnectManager = WalletConnectManager.getInstance();
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
          if (walletSessionRef.current != undefined) {
            var res = await KYCManager.getInstance().hasValidTokenWalletSession(
              {
                verificationType: VerificationType.KYC,
                walletAddress: walletSessionRef.current.accounts[0],
                walletSession: walletSessionRef.current
              }
            )
            console.log(res)
            Alert.alert("Has valid token?", res ? "yes" : "no")
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
