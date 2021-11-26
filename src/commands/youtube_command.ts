import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { GaxiosResponse } from "gaxios";
import { google, youtube_v3 } from "googleapis";

import { getServerApiTokenAsync, logServerErrorAsync, TOKEN_YOUTUBE_API } from "../core";

const YT_WATCH_URL: string = "https://www.youtube.com/watch?v="

/**
 * @description
 * Allow users to quick search for a youtube video using a required keyword(s). The
 * message reference will then be stored in another fake cache so that event handling
 * for select menus can re-link other videos to the original message
 */
export const getYoutubeVideosAsync = async(interaction: CommandInteraction): Promise<void> => {
    try {
        const query = interaction.options.getString("keywords");
        const ytToken = await getServerApiTokenAsync(interaction.guildId, TOKEN_YOUTUBE_API);
        const youtube = google.youtube({
            version: "v3",
            auth: ytToken
        });

        const result = await youtube.search.list({
            part: ["id", "snippet"],
            q: query,
            maxResults: 10
        });

        result.data.items = result.data.items.filter(i => !!i.id.videoId);

        if (!result.data?.items?.length) {
            await interaction.reply("Could not locate any relevant youtube videos");
        } else {
            await interaction.reply({
                content: `${YT_WATCH_URL}${result.data.items[0].id.videoId}`,
                components: [createOtherVideoMenu(result)]
            });
        }
    } catch (e) {
        await logServerErrorAsync(interaction.guildId, e)
    }
}

/**
 * When linking the youtube result, set a select menu of the
 * next ~10 options from the youtube result
 * 
 * @param {GaxiosResponse<youtube_v3.Schema$SearchListResponse>} result - youtube api result
 * @returns Select menu action row to embed in the message
 */
const createOtherVideoMenu = (result: GaxiosResponse<youtube_v3.Schema$SearchListResponse>): MessageActionRow => {
    const row = new MessageActionRow();
    const options: MessageSelectOptionData[] = [];

    result.data.items.forEach(item => {
        const description = item.snippet.description?.length < 100
            ? item.snippet.description
            : `${item.snippet.description.substr(0, 80)}...`;

        const title = item.snippet.title?.length < 100
            ? item.snippet.title
            : `${item.snippet.title.substr(0, 80)}...`;

        const value = `${YT_WATCH_URL}${item.id.videoId}`;

        if (!options.find(o => o.value == value)) {
            options.push({
                label: title,
                description: description,
                value: value
            });
        }
    });

    const cmp = new MessageSelectMenu()
        .setCustomId("youtubeLinks")
        .setPlaceholder("Select another video")
        .addOptions(options);

    return row.addComponents(cmp);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yt")
        .setDescription("Search for a youtube video")
        .addStringOption(x => x
            .setName("keywords")
            .setDescription("Keywords used to perform the youtube search")
            .setRequired(true)),

    async execute(interaction: CommandInteraction) {
        await getYoutubeVideosAsync(interaction);
    }
}