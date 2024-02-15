import { ChatInputCommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";
export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> 
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}