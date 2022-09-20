package com.kycdaomobile

import com.facebook.react.bridge.*
import com.google.gson.Gson
import org.json.JSONObject

fun <T> Dynamic.toObject(classOfT : Class<T>) : T {
    val data = asMap().toHashMap()
    val gson = Gson()
    return gson.fromJson(gson.toJson(data), classOfT)
}

fun List<Any>.toNativeArray() : WritableArray {
    val gson = Gson()
    val array: WritableArray = WritableNativeArray()
    for (item in this) {
        array.pushMap(item.toNativeMap(gson))
    }
    return array
}

fun Any.toNativeMap(gson: Gson = Gson()) : WritableMap {
    return JSONObject(gson.toJson(this)).toNativeMap()
}

fun JSONObject.toNativeMap() : WritableMap {
    val map: WritableMap = WritableNativeMap()
    val iterator = keys()
    while (iterator.hasNext()) {
        val key = iterator.next()
        val value = this[key]
        if (value is JSONObject) {
            map.putMap(key, value.toNativeMap())
        } else if (value is Boolean) {
            map.putBoolean(key, value)
        } else if (value is Int) {
            map.putInt(key, value)
        } else if (value is Double) {
            map.putDouble(key, value)
        } else if (value is String) {
            map.putString(key, value)
        } else {
            map.putString(key, value.toString())
        }
    }
    return map
}
