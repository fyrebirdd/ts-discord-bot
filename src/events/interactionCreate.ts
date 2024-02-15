import { Events, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { BaseEvent } from '../types/BaseEvent';
import { BaseCommand } from '../types/BaseCommand';
import Commands from '../utils/CommandLoader';

export const event: BaseEvent = {
	name: Events.InteractionCreate,
	once: false,
	execute: async (interaction: Interaction) => {
        //Other interactions can go here.
         
		if (interaction.isChatInputCommand()){
            interaction = interaction as ChatInputCommandInteraction;

		    const command: BaseCommand = Commands.Fetch(interaction.commandName);
		    if (!command) {
			    console.error(`No command matching ${interaction.commandName} was found.`);
			    return;
	    	}
		    try {
			    await command.execute(interaction);
		    } 
		    catch (error) {
			    console.error(error);
			    if (interaction.replied || interaction.deferred) {
				    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			    } else {
				    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			    }
		    }
        };
		
	}

}