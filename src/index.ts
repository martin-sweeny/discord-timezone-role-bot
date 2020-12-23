import { Client, Message, Role } from 'discord.js'

import { config as configureEnvironment } from 'dotenv'
import timezones from './data/timezones.json'

configureEnvironment()
const client = new Client()

enum BotStates {
	Bored,
	Waiting,
}

const log = (...message) => {
	if (process.env.DEBUG) console.log(...message)
}

class BotStateManager {
	public _state
	private _defaultState = BotStates.Bored

	constructor() {
		this.state = this._defaultState
	}

	public get state() {
		return this._state
	}

	public set state(newState: BotStates) {
		log('Setting bot state to:\t', newState)
		this._state = newState
	}

	public resetState() {
		log('Clean state reset')
		this.state = this._defaultState
	}

	public isDefaultState() {
		return this._state === this._defaultState
	}

	public isWaiting() {
		return this._state === BotStates.Waiting
	}
}

type Timezone = typeof timezones[0]

let botState = new BotStateManager()
let timeout: NodeJS.Timeout

client.once('ready', () => {
	log(`${timezones.length} timezones loaded`)
})

client.on('message', async (msg: Message) => {
	const { author, channel, guild } = msg

	const speak = async (message: string) => {
		log('msg.channel.send:\t' + message)
		await channel.send(message)
	}

	/**
	 * Time out if the user took too long
	 */
	const tookTooLong = async () => {
		speak('too long loser')
		log('Time out state reset')
		botState.state = BotStates.Bored
	}

	/**
	 * Create the timer
	 */
	const setWaitingTimer = () => {
		log('Setting timeout')
		const t = client.setTimeout(tookTooLong, 10000)
		log('Set timeout:\t\t' + t)
		return t
	}

	/**
	 * Clear the timer
	 */
	const clearWaitingTimer = (t: NodeJS.Timeout) => {
		log('Clearing timeout:\t' + t)
		client.clearTimeout(t)
	}

	// Bots send kind of "hidden" messages that we want to ignore
	if (author.bot) return

	log('Received message:\t' + msg.content)

	if (botState.isDefaultState() && msg.content === 'sup t') {
		speak('sup fam')
		speak('what timezone are you in')
		timeout = setWaitingTimer()
		botState.state = BotStates.Waiting
	}

	const tz: Timezone = timezones.find(tz => tz.abbr === msg.content)
	if (botState.isWaiting()) {
		let role: Role

		if (tz) {
			speak(msg.content + ' is based')

			role = await guild.roles.cache.find(({ name }) => name === msg.content)

			if (role) {
				speak('that role exists')
			} else {
				speak('that role does not exist')
				speak("let's make it")

				role = await guild.roles.create({
					data: {
						name: msg.content,
						color: 'BLUE',
					},
				})
			}

			const memberRole = await msg.member.roles.cache.find(
				({ name }) => name === msg.content,
			)

			if (memberRole) {
				speak('user has it')
			} else {
				await msg.member.roles.add(role)
				speak(`${msg.content} role added`)
			}

			clearWaitingTimer(timeout)
			botState.resetState()
		}
	}
})

client.login(process.env.DISCORD_AUTH_TOKEN)
