import { Events, Client } from "discord.js";
import { BaseEvent } from "../types/BaseEvent";

export const event: BaseEvent = {
	name: Events.ClientReady,
	once: true,
	execute: async (client:Client) => {
		console.log(`Client session is now valid`);
	}
};