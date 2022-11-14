package com.kycdaomobile.models.event_bodies

data class PersonalSignEventBody(
	val id: String,
	val walletAddress : String,
	val message: String
)