package com.kycdaomobile.models.event_bodies

import com.kycdaomobile.models.RNEventTypes

data class ErrorEventBody(
	val message: String,
	val errorType: RNEventTypes
)