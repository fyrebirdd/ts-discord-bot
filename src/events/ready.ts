import { Events, Client } from "discord.js";
import { BaseEvent } from "../types/BaseEvent";

export const event: BaseEvent = {
	name: Events.ClientReady,
	once: true,
	execute: (client:Client) => {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};