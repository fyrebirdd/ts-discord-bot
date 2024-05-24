import { SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from '../../types/BaseCommand';

export const command: BaseCommand = {
	data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Posts the bots ping.'),

	global: true,

	execute: async (interaction) => {
		interaction.channel.send('.').then (async (msg) =>{
			msg.delete()
			interaction.reply(`${msg.createdTimestamp - interaction.createdTimestamp}ms`);
		});
	}
}; 
