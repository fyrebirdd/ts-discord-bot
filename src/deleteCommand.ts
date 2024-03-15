import { REST, Routes } from 'discord.js';

const rest = new REST().setToken(process.env.TEMPLATE_TOKEN);

if (process.argv.length != 4){
    throw new Error("Proper usage without brackets: npm run delete [guild or global] [all or command id]");
}
Delete(rest, process.argv[2] == 'global'? true : false, process.argv[3] =='all'? null : process.argv[3]);

async function Delete(rest:REST, global:boolean, commandToDelete:string){
	try {
        if (!commandToDelete){
            if (global){
                rest.put(Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID), { body: [] })
                    .then(() => console.log('Successfully deleted all application commands.'))
                    .catch(console.error);
            }
            else{
                rest.put(Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID), { body: [] })
                    .then(() => console.log('Successfully deleted all guild commands.'))
                    .catch(console.error);
            }
        }

	} catch (error) {
		console.error(error);
	}
}