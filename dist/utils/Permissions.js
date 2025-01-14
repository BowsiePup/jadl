"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanReadablePermissions = exports.PermissionUtils = exports.bits = void 0;
const v9_1 = require("discord-api-types/v9");
exports.bits = {
    createInvites: 1n << 0n,
    kick: 1n << 1n,
    ban: 1n << 2n,
    administrator: 1n << 3n,
    manageChannels: 1n << 4n,
    manageGuild: 1n << 5n,
    addReactions: 1n << 6n,
    auditLog: 1n << 7n,
    prioritySpeaker: 1n << 8n,
    stream: 1n << 9n,
    viewChannel: 1n << 10n,
    sendMessages: 1n << 11n,
    tts: 1n << 12n,
    manageMessages: 1n << 13n,
    embed: 1n << 14n,
    files: 1n << 15n,
    readHistory: 1n << 16n,
    mentionEveryone: 1n << 17n,
    externalEmojis: 1n << 18n,
    viewInsights: 1n << 19n,
    connect: 1n << 20n,
    speak: 1n << 21n,
    mute: 1n << 22n,
    deafen: 1n << 23n,
    move: 1n << 24n,
    useVoiceActivity: 1n << 25n,
    nickname: 1n << 26n,
    manageNicknames: 1n << 27n,
    manageRoles: 1n << 28n,
    webhooks: 1n << 29n,
    emojis: 1n << 30n,
    useApplicationCommands: 31n,
    requestToSpeak: 1n << 32n,
    manageThreads: 1n << 34n,
    createPublicThreads: 1n << 35n,
    createPrivateThreads: 1n << 36n,
    useExternalStickers: 1n << 37n,
    sendMessagesInThreads: 1n << 38n,
    startEmbeddedActivities: 1n << 39n,
    moderateMembers: 1n << 40n
};
exports.PermissionUtils = {
    bits: exports.bits,
    /**
     * Test a permission on a user
     * @param bit Combined permission
     * @param perm Permission name to test
     * @returns Whether or not the user has permissions
     */
    has(bit, perm) {
        return this.hasPerms(bit, BigInt(exports.bits[perm]));
    },
    /**
     * Adds multiple permission sources together
     * @param data Data filled with possible permission data
     * @returns Full permission bit
     */
    combine(data) {
        if (data.member.user?.id === data.guild.owner_id)
            return exports.PermissionUtils.bits.administrator;
        let result = data.roleList ? BigInt(data.roleList.get(data.guild.id)?.permissions ?? 0) : BigInt(0);
        if (data.roleList) {
            data.member.roles.forEach(role => {
                const r = data.roleList?.get(role);
                if (!r)
                    return;
                result |= BigInt(r.permissions);
            });
        }
        if (data.overwrites) {
            let allow = BigInt(0);
            let deny = BigInt(0);
            data.overwrites.filter(x => x.type === v9_1.OverwriteType.Role).forEach(overwrite => {
                if (overwrite.id === data.guild.id) {
                    result |= BigInt(overwrite.allow);
                    result &= ~BigInt(overwrite.deny);
                    return;
                }
                if (!data.member.roles.includes(overwrite.id))
                    return;
                allow |= BigInt(overwrite.allow);
                deny |= BigInt(overwrite.deny);
            });
            result &= ~deny;
            result |= allow;
            data.overwrites.filter(x => x.type === v9_1.OverwriteType.Member && data.member.user?.id === x.id).forEach(overwrite => {
                result &= ~BigInt(overwrite.deny);
                result |= BigInt(overwrite.allow);
            });
        }
        return result;
    },
    /**
     * Test two bits together
     * @param perms Combined permissions
     * @param bit Number bit ermission to test
     * @returns Whether or not the user has permissions
     */
    hasPerms(perms, bit) {
        if (Number(BigInt(perms) & BigInt(exports.bits.administrator)) !== 0)
            return true; // administrator
        if (Number(BigInt(perms) & BigInt(bit)) !== 0)
            return true;
        return false;
    }
};
exports.humanReadablePermissions = {
    createInvites: 'Create Invites',
    kick: 'Kick Members',
    ban: 'Ban Members',
    administrator: 'Administrator',
    manageChannels: 'Manage Channels',
    manageGuild: 'Manage Server',
    addReactions: 'Add Reactions',
    auditLog: 'View Audit Log',
    prioritySpeaker: 'Priority Speaker',
    stream: 'Stream',
    viewChannel: 'View Channel(s)',
    sendMessages: 'Send Messages',
    tts: 'Send Text-to-Speech Messages',
    manageMessages: 'Manage Messages',
    embed: 'Embed Links',
    files: 'Attach Files',
    readHistory: 'Read Message History',
    mentionEveryone: 'Mention \\@everyone, \\@here, and All Roles',
    externalEmojis: 'Use External Emoji',
    viewInsights: 'View Server Invites',
    connect: 'Connect (Voice)',
    speak: 'Speak (Voice)',
    mute: 'Mute (Voice)',
    deafen: 'Deafen (Voice)',
    move: 'Move (Voice)',
    useVoiceActivity: 'Use Voice Activity',
    nickname: 'Change Nickname',
    manageNicknames: 'Manage Nicknames',
    manageRoles: 'Manage Roles',
    webhooks: 'Manage Webhooks',
    emojis: 'Manage Emojis',
    useApplicationCommands: 'Use Application Commands',
    requestToSpeak: 'Request to Speak',
    manageThreads: 'Manage Threads',
    createPublicThreads: 'Create Public Threads',
    createPrivateThreads: 'Create Private Threads',
    sendMessagesInThreads: 'Send Messages in Threads',
    useExternalStickers: 'Use External Stickers',
    startEmbeddedActivities: 'Start Activities',
    moderateMembers: 'Timeout Members'
};
