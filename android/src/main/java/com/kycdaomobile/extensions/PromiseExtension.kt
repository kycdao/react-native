package com.kycdaomobile.extensions

import com.facebook.react.bridge.Promise
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

fun Promise.launch(scope: CoroutineScope, block: suspend CoroutineScope.() -> Unit) {
	scope.launch(
		context = CoroutineExceptionHandler { _, exception ->
			exception.printStackTrace()
			this@launch.reject(exception)
		},
		block = block
	)
}
