import { ChatInputCommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";
export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> 
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder,
    global: boolean,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}