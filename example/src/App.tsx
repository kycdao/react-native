import * as React from 'react';

import { StyleSheet, Text, Button, SafeAreaView, TextInput, Alert } from 'react-native';
import { 
  multiply, 
  printStuff, 
  WalletConnectManager, 
  WalletSession, 
  VerificationManager, 
  IdentityFlowResult, 
  VerificationStatus, 
  PersonalData, 
  VerificationType, 
  NetworkConfig, 
  WalletConnectSessionInterface, 
  WCSessionError,
  Configuration,
  KycDaoEnvironment
} from 'kycdao-mobile';
// import type { WalletConnectSessionInterface } from 'src/WalletConnect/WalletConnectModels';

const configuration = new Configuration("", KycDaoEnvironment.Dev);

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const walletSessionRef = React.useRef<WalletConnectSessionInterface>();

  React.useEffect(() => {

    const configure = async () => {
      await VerificationManager.configure(configuration);
    }

    multiply(3, 7).then(setResult);
    console.log("REACT DEBUG: HERE AGAIN");
    configure().catch(console.error);;
    
    var walletConnectManager = WalletConnectManager.getInstance();
    // walletConnectManager.addCustomRpcURL(
    //   "eip155:80001", "https://polygon-rpc.com"
    // )

    this.sessionStartSubscription = walletConnectManager.subscribeOnSession(
      async (walletSession: WalletSession) => {

      }, 
      async (error: WCSessionError) => {

      });

    this.sessionStartSubscription = walletConnectManager.subscribeOnSession(async (walletSession: WalletSession) => {
      console.log("RECEIVED SESSION UPDATE");

      walletSessionRef.current = walletSession;

      var verificationManager = VerificationManager.getInstance();
      var verificationSession = await verificationManager.createSession(walletSession.accounts[0]!, walletSession);
      console.log(verificationSession);
      console.log("VERIFICATIONSESSION CREATED");

      if (verificationSession.loggedIn == false) {
        await verificationSession.login();
        console.log("REACT DEBUG: LOGING IN");

      }
      console.log("REACT DEBUG: LOGGED IN");


      if (verificationSession.requiredInformationProvided == false) {
        await verificationSession.acceptDisclaimer();
        console.log("REACT DEBUG: ACCEPT DISCLAIMER");
        var personalData = new PersonalData(
          "robin@bitraptors.com", "HU", false
        );
        await verificationSession.setPersonalData(personalData);
        console.log("REACT DEBUG: UPDATE USER");
      }
      console.log("REACT DEBUG: REQUIRED INFORMATION AVAILABLE");

      if (verificationSession.emailConfirmed == false) {
        console.log("REACT DEBUG: SEND CONFIRM EMAIL");
        await verificationSession.resumeOnEmailConfirmed();
        console.log("REACT DEBUG: CONTINUE WHEN EMAIL CONFIRMED");
      }
      console.log("REACT DEBUG: EMAIL IS OK");
      console.log(verificationSession.verificationStatus);
      console.log(verificationSession.verificationStatus === VerificationStatus.NotVerified);

      if (verificationSession.verificationStatus == VerificationStatus.NotVerified) {
        console.log("REACT DEBUG: before identification");
        let identificationStatus = await verificationSession.startIdentification();
        console.log("REACT DEBUG: startIdentification");
        console.log("REACT DEBUG:" + identificationStatus);
        console.log("REACT DEBUG:" + IdentityFlowResult.Completed);
        console.log("REACT DEBUG:" + identificationStatus == IdentityFlowResult.Completed);


        if (identificationStatus == IdentityFlowResult.Completed) {
          await verificationSession.resumeOnVerificationCompleted();
          console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
        } else {
          console.log("REACT DEBUG: Identity flow cancelled!");
          return;
        }
      }
      else if (verificationSession.verificationStatus == VerificationStatus.Processing) {
        await verificationSession.resumeOnVerificationCompleted();
        console.log("REACT DEBUG: CONTINUE WHEN IDENTIFIED");
      }
      console.log("IT'S MINTING TIME");
      let images = await verificationSession.getNFTImages();
      console.log("REACT DEBUG: GOT IMAGES " + images);
      await verificationSession.requestMinting(images[0].id);
      console.log("REACT DEBUG: GOT MINTING AUTH");
      var estimation = await verificationSession.estimateGasForMinting();
      console.log("REACT PRICE:" + estimation.feeInNative);
      var mintingResult = await verificationSession.mint();
      console.log("URI:" + mintingResult.explorerURL);
      console.log("REACT DEBUG: Hurray");

    },
    //Session start failure
    async (error: WCSessionError) => {
      console.error(error);
    });

    walletConnectManager.startListening();
    return function cleanup() {
      this.sessionStartSubscription.remove();
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
          try {
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
          if (walletSessionRef.current != undefined) {
            var res = await VerificationManager.getInstance()
              .hasValidToken(
                VerificationType.KYC,
                walletSessionRef.current.accounts[0],
                walletSessionRef.current
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
