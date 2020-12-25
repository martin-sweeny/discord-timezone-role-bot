import { Client, Message, Role } from 'discord.js'
import { config as configureEnvironment } from 'dotenv'

import timezones from './data/timezones.json'
import BotStateManager, { BotStates } from './utils/botState'
import log from './utils/log'
import TimerManager from './utils/timer'

configureEnvironment()

type Timezone = typeof timezones[0]

const botState = new BotStateManager()
const client = new Client()
const timer = new TimerManager(10000)

client.once('ready', () => {
	log(`${timezones.length} timezones loaded`)
})

client.on('message', async (msg: Message) => {
	const { author, channel, guild } = msg

	const speak = async (message: string) => {
		log('msg.channel.send:\t' + message)
		await channel.send(message)
	}

	// Bots send kind of "hidden" messages that we want to ignore
	if (author.bot) return

	log('Received message:\t' + msg.content)

	timer.callback = () => {
		speak('Too long loser')
		botState.state = BotStates.Bored
	}

	if (botState.isDefaultState() && msg.content === 'sup t') {
		speak('sup fam')
		speak('what timezone are you in')
		timer.start()
		botState.state = BotStates.Waiting
	}

	const tz: Timezone = timezones.find(zone => zone.abbr === msg.content)
	if (botState.isWaiting()) {
		let role: Role

		if (tz) {
			speak(msg.content + ' is based')

			role = guild.roles.cache.find(({ name }) => name === msg.content)

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

			const memberRole = msg.member.roles.cache.find(
				({ name }) => name === msg.content,
			)

			if (memberRole) {
				speak('user has it')
			} else {
				await msg.member.roles.add(role)
				speak(`${msg.content} role added`)
			}

			timer.clear()
			botState.resetState()
		}
	}
})

client.login(process.env.DISCORD_AUTH_TOKEN)
