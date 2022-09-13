import * as React from 'react';

import { StyleSheet, View, Text, NativeEventEmitter, Button } from 'react-native';
import { KycReactEvents, launchKycFlow, listWallets, multiply, printStuff, startListening, RNWalletConnectManager, connect, WalletSession, createSession, sign, login, Network } from 'kycdao-mobile';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);

    const eventEmitter = new NativeEventEmitter(RNWalletConnectManager);
    this.eventListener = eventEmitter.addListener(KycReactEvents.WCSessionStarted, async (event) => {
      var walletSession = event as WalletSession;
      var network = walletSession.chainId;
      console.log(network);
      if (walletSession !== undefined) {
        console.log("session started event");
        console.log(walletSession.name); // "someValue"
        console.log(walletSession);
        console.log(walletSession.accounts[0]!);
        console.log(network);
        var kycSession = await createSession(walletSession.accounts[0]!, network);
        console.log(kycSession);
        var signature = await sign(walletSession, walletSession.accounts[0]!, kycSession.loginProof);
        console.log(signature);
        await login(kycSession, signature);
        console.log("Hurray")
      }
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
          var id = await startListening();
          printStuff(id);
          var wallets = await listWallets();
          console.debug(wallets.map(x => x.name));
          console.debug(wallets);
          console.debug(wallets.find(x => x.name === "MetaMask"));
          var metamask = wallets.find(x => x.name === "MetaMask");
          if (metamask !== undefined) {
            await connect(metamask);
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
