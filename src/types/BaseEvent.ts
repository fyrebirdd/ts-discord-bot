import { Events } from 'discord.js';

export interface BaseEvent {
    name: Events;
	once: boolean;
	execute: (...args: any[]) => Promise<void> | void;
}