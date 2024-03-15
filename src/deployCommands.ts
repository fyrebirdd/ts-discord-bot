import { REST, Routes } from 'discord.js';
import { BaseCommand } from './types/BaseCommand';
import Commands from './utils/CommandLoader.js';

const rest = new REST().setToken(process.env.TEMPLATE_TOKEN);

await Commands.Load();
PushCommands(Commands.GetList(), rest);

async function PushCommands(commands: Map<string, BaseCommand>, rest:REST){
	try {
		console.log(`Trying to deploy ${commands.size} commands.`);

        const commandsJson = [];
        commands.forEach((command, _) => {
            commandsJson.push(command.data.toJSON());
        });

		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID),
			{ body: commandsJson },
		);

        //  -- COMMENT ABOVE AND UNCOMMENT BELOW IF YOU WANT COMMANDS TO BE GLOBAL --

        // const data: any = await rest.put(
		// 	Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID),
		// 	{ body: commandsJson },
		// );

		console.log(`Deployed ${data.length} commands.`);
	} catch (error) {
		console.error(error);
	}
}