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

client.on('message', (msg: Message) => {
	if (msg.author.bot) return

	if (botState === BotStates.Bored && msg.content === 'sup t') {
		msg.channel.send('sup fam')
		msg.channel.send('what timezone are you in')
		botState = BotStates.WaitingForTimezoneResponse
	}

	if (botState === BotStates.WaitingForTimezoneResponse) {
		if (timezones.find(tz => tz.abbr === msg.content)) {
			msg.channel.send(msg.content + ' is based')

			if (msg.guild.roles.cache.find((role: Role) => role.name === msg.content))
				msg.channel.send('that role exists')
			else msg.channel.send('that role does not exist')
		}

		setTimeout(() => (botState = BotStates.Bored), 5000)
	}
})

client.login(process.env.DISCORD_AUTH_TOKEN)
