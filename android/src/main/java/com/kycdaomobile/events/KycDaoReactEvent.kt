package com.kycdaomobile.events

enum class KycDaoReactEvent(val stringForm: String) {
  WCSessionStarted("WC_SESSION_STARTED"),
  WCSessionFailed("WC_SESSION_FAILED"),
  MethodPersonalSign("METHOD_PERSONAL_SIGN"),
  MethodMintingTransaction("METHOD_MINTING_TRANSACTION"),
}
