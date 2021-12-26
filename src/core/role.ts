import { CreateRoleOptions, GuildMember, GuildMemberRoleManager, MessageEmbed, Role } from "discord.js";

import { logInfoAsync, sendEmbedToChannelAsync } from "./channel";
import { getServerById, getGuildRefById } from "./server";

/**
 * Get a list of roles for a given server. If a keyword
 * is supplied, filter roles that match the supplied keyword
 * 
 * @param {string} serverId - id of the server to fetch roles
 * @param {string} [keywordMatch=null] - optionally match role names on a keyword
 * @returns list of roles
 */
export const getServerRolesAsync = async(serverId: string, keywordMatch: string = null): Promise<Role[]> => {
    const roleArr = [];
    const server = getServerById(serverId);
    const roles = (await server.guild.fetch()).roles.cache;
    const kwt = keywordMatch?.toLowerCase().trim();

    roles.forEach(r => {
        if (kwt) {
            const rnt = r.name.toLowerCase().trim();
            if (rnt.includes(kwt))
                roleArr.push(r);
        } else {
            roleArr.push(r);
        }
    });

    return roleArr;
}

/**
 * Set a role for a given member of a server
 * 
 * @param {string} serverId - id of the server which to find the member
 * @param {string} memberId - id of the member
 * @param {Role} role - role which to apply to the member
 */
export const addRoleToMemberAsync = async(serverId: string, memberId: string, role: Role): Promise<void> => {
    const guild = getGuildRefById(serverId);
    const member = guild.members.cache.find(m => m.id == memberId);
    member.roles.add(role);
}

/**
 * Remove a set of roles matching a keyword for a given member of a server
 * 
 * @param {GuildMember} member - member which to remove roles
 * @param {string} keyword - optionally match role names on a keyword
 * @param {boolean} [exactKeywordMatch=false] - require an exact match on keyword
 * @param {boolean} [removeFromServer=false] - optionally remove the role from the server once removed
 */
export const removeRolesFromMemberAsync = async(member: GuildMember, keyword: string, 
    exactKeywordMatch: boolean = false,
    removeFromServer: boolean = false): Promise<void> => {

    const memberRoles = <GuildMemberRoleManager>member.roles;
    const rolesToRemove = memberRoles.cache.filter(r => r.name.includes(keyword)).map(r => r);
    const srv = getServerById(member.guild.id);

    rolesToRemove.forEach(role => {
        let remove: boolean = true;

        if (keyword) {
            remove = exactKeywordMatch
                ? role.name == keyword
                : role.name.includes(keyword);
        } 

        if (remove) {
            member.roles.remove(role);
            logInfoAsync(srv, `Removing role \`${role.name}\` from user ${member.user.username}`);

            if (removeFromServer && role.members.map(m => m).length <= 1) {
                const embed = new MessageEmbed()
                    .setColor(role.color)
                    .setTitle("Role Removed")
                    .setDescription(`Removing role \`${role.name}\` from server`)

                sendEmbedToChannelAsync(srv, srv.config?.channels?.log, embed);
                role.delete();
            }
        }
    });
}

/**
 * Create a role for a given server
 * 
 * @param {string} serverId - server which to create the role
 * @param {Role} role - new role to create
 * @param {number} [position=1] - optional position, default 1
 * @returns newly created role
 */
export const createRoleAsync = async(serverId: string, role: CreateRoleOptions, position: number = 1): Promise<Role> => {
    const srv = getServerById(serverId);
    const guild = getGuildRefById(serverId);

    if (!role.position)
        role.position = position;

    const newRole = await guild.roles.create(role);
    await logInfoAsync(srv, `Created new role: ${role.name}`);

    return newRole;
}