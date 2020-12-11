import timezones from './data/timezones.json'
import { config as configureEnvironment } from 'dotenv'
import { Client, Guild, Message, Role, RoleManager } from 'discord.js'

configureEnvironment()
const client = new Client()

enum BotStates {
	Bored,
	WaitingForTimezoneResponse,
}

let botState = BotStates.Bored

client.once('ready', () => {
	console.log(`${timezones.length} timezones loaded`)
})

client.on('message', async (msg: Message) => {
	const resetBotState = () => {
		msg.channel.send('too long loser')
		botState = BotStates.Bored
	}

	if (msg.author.bot) return

	if (botState === BotStates.Bored && msg.content === 'sup t') {
		msg.channel.send('sup fam')
		msg.channel.send('what timezone are you in')
		botState = BotStates.WaitingForTimezoneResponse
	}

	if (botState === BotStates.WaitingForTimezoneResponse) {
		const t = setTimeout(resetBotState, 10000)

		const tz = await timezones.find(tz => tz.abbr === msg.content)
		let role

		if (tz) {
			msg.channel.send(msg.content + ' is based')

			role = await msg.guild.roles.cache.find(
				({ name }) => name === msg.content,
			)
			if (role) {
				msg.channel.send('that role exists')
			} else {
				msg.channel.send('that role does not exist')
				msg.channel.send("let's make it")

				role = await msg.guild.roles.create({
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
				msg.channel.send('user has it')
				clearTimeout(t)
			} else {
				msg.member.roles.add(role)
				msg.channel.send(`${msg.content} role added`)
				clearTimeout(t)
			}
		}
	}
})

client.login(process.env.DISCORD_AUTH_TOKEN)
