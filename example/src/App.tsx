import * as React from 'react';

import { StyleSheet, View, Text, NativeEventEmitter, Button } from 'react-native';
import { launchKycFlow, multiply, printStuff, WalletConnectManager, WalletSession, KYCManager } from 'kycdao-mobile';

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
      await kycSession.login();
      console.log("Hurray");
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
