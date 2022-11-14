package com.kycdaomobile.extensions

import com.facebook.react.bridge.ReadableMap
import com.google.gson.GsonBuilder

private val GSON by lazy {
	GsonBuilder().create()
}

fun <T> String.parse(classOfT: Class<T>): T {
	return GSON.fromJson(this, classOfT)
}

fun Any.toJson(): String {
	return GSON.toJson(this)
}

fun <T> ReadableMap.toType(type: Class<T>): T{
	return this.toHashMap().toJson().parse(type)
}