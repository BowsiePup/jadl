import Collection from '@discordjs/collection';
import { APIGuildMember, APIOverwrite, Snowflake } from 'discord-api-types/v9';
import { CachedGuild, DiscordEventMap } from '../typings/Discord';
export declare const bits: {
    createInvites: bigint;
    kick: bigint;
    ban: bigint;
    administrator: bigint;
    manageChannels: bigint;
    manageGuild: bigint;
    addReactions: bigint;
    auditLog: bigint;
    prioritySpeaker: bigint;
    stream: bigint;
    viewChannel: bigint;
    sendMessages: bigint;
    tts: bigint;
    manageMessages: bigint;
    embed: bigint;
    files: bigint;
    readHistory: bigint;
    mentionEveryone: bigint;
    externalEmojis: bigint;
    viewInsights: bigint;
    connect: bigint;
    speak: bigint;
    mute: bigint;
    deafen: bigint;
    move: bigint;
    useVoiceActivity: bigint;
    nickname: bigint;
    manageNicknames: bigint;
    manageRoles: bigint;
    webhooks: bigint;
    emojis: bigint;
    useApplicationCommands: bigint;
    requestToSpeak: bigint;
    manageThreads: bigint;
    createPublicThreads: bigint;
    createPrivateThreads: bigint;
    useExternalStickers: bigint;
    sendMessagesInThreads: bigint;
    startEmbeddedActivities: bigint;
    moderateMembers: bigint;
};
export declare const PermissionUtils: {
    bits: {
        createInvites: bigint;
        kick: bigint;
        ban: bigint;
        administrator: bigint;
        manageChannels: bigint;
        manageGuild: bigint;
        addReactions: bigint;
        auditLog: bigint;
        prioritySpeaker: bigint;
        stream: bigint;
        viewChannel: bigint;
        sendMessages: bigint;
        tts: bigint;
        manageMessages: bigint;
        embed: bigint;
        files: bigint;
        readHistory: bigint;
        mentionEveryone: bigint;
        externalEmojis: bigint;
        viewInsights: bigint;
        connect: bigint;
        speak: bigint;
        mute: bigint;
        deafen: bigint;
        move: bigint;
        useVoiceActivity: bigint;
        nickname: bigint;
        manageNicknames: bigint;
        manageRoles: bigint;
        webhooks: bigint;
        emojis: bigint;
        useApplicationCommands: bigint;
        requestToSpeak: bigint;
        manageThreads: bigint;
        createPublicThreads: bigint;
        createPrivateThreads: bigint;
        useExternalStickers: bigint;
        sendMessagesInThreads: bigint;
        startEmbeddedActivities: bigint;
        moderateMembers: bigint;
    };
    /**
     * Test a permission on a user
     * @param bit Combined permission
     * @param perm Permission name to test
     * @returns Whether or not the user has permissions
     */
    has(bit: number | bigint, perm: keyof typeof bits): boolean;
    /**
     * Adds multiple permission sources together
     * @param data Data filled with possible permission data
     * @returns Full permission bit
     */
    combine(data: {
        member: APIGuildMember;
        guild: CachedGuild;
        roleList?: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>;
        overwrites?: APIOverwrite[];
    }): bigint;
    /**
     * Test two bits together
     * @param perms Combined permissions
     * @param bit Number bit ermission to test
     * @returns Whether or not the user has permissions
     */
    hasPerms(perms: number | bigint, bit: number | bigint): boolean;
};
export declare const humanReadablePermissions: {
    [key in keyof typeof bits]: string;
};
