import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { GaxiosResponse } from "gaxios";
import { google, youtube_v3 } from "googleapis";

import { getServerApiTokenAsync, logServerErrorAsync, TOKEN_YOUTUBE_API } from "../core";

const YT_WATCH_URL: string = "https://www.youtube.com/watch?v="

/**
 * 
 * @param interaction 
 */
export const getYoutubeVideosAsync = async(interaction: Message|Interaction): Promise<void> => {
    try {
        const message = <Message>interaction;
        const query = (<any>interaction).options.getString("keywords");

        const ytToken = await getServerApiTokenAsync(interaction.guildId, TOKEN_YOUTUBE_API);
        const youtube = google.youtube({
            version: "v3",
            auth: ytToken
        });

        const result = await youtube.search.list({
            part: ["id", "snippet"],
            q: query,
        });

        if (!result.data?.items?.length) {
            await message.reply("Could not locate any relevant youtube videos");
        } else {
            await message.reply({
                content: `${YT_WATCH_URL}${result.data.items[0].id.videoId}`,
                components: [createOtherVideoMenu(result)]
            });
        }
    } catch (e) {
        await logServerErrorAsync(interaction.guildId, e)
    }
}

/**
 * 
 * @param result 
 * @returns 
 */
const createOtherVideoMenu = (result: GaxiosResponse<youtube_v3.Schema$SearchListResponse>): MessageActionRow => {
    const row = new MessageActionRow();
    const options: MessageSelectOptionData[] = [];

    result.data.items.forEach(item => {
        const description = item.snippet.description?.length < 100
            ? item.snippet.description
            : `${item.snippet.description?.substr(0, 90)}...`;

        options.push({
            label: item.snippet.title,
            description: description,
            value: item.id.videoId
        });
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

    async execute(interaction: Message|Interaction) {
        await getYoutubeVideosAsync(interaction);
    }
}