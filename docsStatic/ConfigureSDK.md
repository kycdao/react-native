---
order: 950
icon: gear
---

# Configuring the SDK

Learn how to make the required configurations or customize the SDK for your needs before you use it

## Overview

In order to use the kycDAO React Native SDK, you must provide certain configurations before using it. Currently only an environment configuration is mandatory but an api key will be required in the near future as well. There are optional configurations, like setting custom RPC URLs to use with your supported networks.

## Setting your configurations

You can set the configurations by calling `VerificationManager.configure(_:)`. 

!!!warning Important
You have to call it exactly **once** per app launch. Calling it multiple times won't overwrite the previous configuration.
!!!

```js
const networkConfigs = [
	new NetworkConfig("eip155:89", "https://polygon-rpc.com"),
	new NetworkConfig("eip155:80001", "https://matic-mumbai.chainstacklabs.com")
];

const configuration = new Configuration(
  KycDaoEnvironment.Dev, 
  networkConfigs
);

await VerificationManager.configure(configuration)
```

## Environment types

`KycDaoEnvironment` `enum` defines the available environments.

`KycDaoEnvironment` | Implementation
--- | ---
`Production` | A live, production environment which uses the smart contracts on the main nets, with a live identity verification service and live kycDAO server environment.
`Development` | A developer environment which uses the smart contracts on the dev/test nets, with a sandbox identity verification service and staging kycDAO server environment.

## Network configurations

!!!
Network configs are optional, but it is recommended that you use your own node service and set the RPC URL appropriately. The SDK will default to preset RPC services otherwise.
!!!

`NetworkOption` describes a set of configurations for a particular network. The `chainId` identifies every set of option and relates them with the identified network's usage. It is in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md).

### RPC URL

You can set a custom RPC URL for the SDK to use during on-chain calls with a network.

```js
// Creates a network config, which sets the RPC URL used 
// by Mumbai testnet calls to `https://matic-mumbai.chainstacklabs.com`
const mumbaiConfig = new NetworkConfig("eip155:80001", "https://matic-mumbai.chainstacklabs.com");
```


