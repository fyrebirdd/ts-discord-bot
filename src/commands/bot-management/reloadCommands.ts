import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from '../../types/BaseCommand';
import Commands from '../../utils/CommandLoader.js';

export const command: BaseCommand = {
	data: new SlashCommandBuilder()
	.setName('reload-commands')
	.setDescription('reloads the bots commands. admin only')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	execute: async (interaction) => {
        try{
            let commandsLoaded = await Commands.Load();
            await interaction.reply({content:`Reloaded ${commandsLoaded} commands.`, ephemeral: true});
        }
        catch (err){
            await interaction.reply({content:`Error: ${err}`, ephemeral: true});
        }
	}
};