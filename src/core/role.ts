import { Collection, Role } from "discord.js";
import { getServerById, getGuildRefById } from "./server";

/**
 * Get a list of roles for a given server. If a keyword
 * is supplied, filter roles that match the supplied keyword
 * 
 * @param {string} serverId - id of the server to fetch roles
 * @param {string} [keywordMatch=null] - optionally match role names on a keyword
 * @returns list of roles
 */
export const getServerRolesAsync = async(serverId: string, keywordMatch: string = null): Promise<Collection<string, Role>> => {
    const server = getServerById(serverId);
    const roles = (await server.guild.fetch()).roles.cache;

    return keywordMatch == null
        ? roles
        : roles.filter(r => keywordMatch.indexOf(r.name) > -1);
}

/**
 * Set a role for a given member of a server
 * 
 * @param {string} serverId - id of the server which to find the member
 * @param {string} memberId - id of the member
 * @param {Role} role - role which to apply to the member
 */
export const addRoleToMemberAsync = async(serverId: string, memberId: string, role: Role): Promise<void> => {
    const server = getGuildRefById(serverId);
    const member = server.members.cache.find(m => m.id == memberId);
    member.roles.add(role);
}

/**
 * Remove a role for a given member of a server
 * 
 * @param {string} serverId - server which to find the member
 * @param {string} memberId - id of the member
 * @param {Role} role - role which to remove
 * @param {boolean} [removeFromServer=false] - optionally remove the role from the server once removed
 */
export const removeRoleFromMemberAsync = async(serverId: string, memberId: string, 
    role: Role, removeFromServer: boolean = false): Promise<void> => {

    const server = getGuildRefById(serverId);
    const member = server.members.cache.find(m => m.id == memberId);
    member.roles.remove(role);

    if (removeFromServer) {
        // hmm
    }
}