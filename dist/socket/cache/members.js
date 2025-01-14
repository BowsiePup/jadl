"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.members = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function members(events, worker) {
    worker.members = new collection_1.default();
    events.on('GUILD_MEMBER_ADD', (m) => {
        let member = Object.assign({}, m);
        let guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers) {
            guildMembers = new collection_1.default();
            worker.members.set(member.guild_id, guildMembers);
        }
        if (worker.options.cacheControl.members) {
            const newMember = {};
            worker.options.cacheControl.members.forEach(key => {
                newMember[key] = member[key];
            });
            newMember.guild_id = member.guild_id;
            newMember.user = member.user;
            member = newMember;
        }
        guildMembers.set(member.user?.id, member);
    });
    events.on('GUILD_MEMBER_UPDATE', (member) => {
        const guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers)
            return;
        const currentMember = guildMembers.get(member.user?.id);
        if (!currentMember)
            return;
        if (worker.options.cacheControl.members) {
            worker.options.cacheControl.members.forEach(key => {
                currentMember[key] = currentMember[key];
            });
            currentMember.guild_id = member.guild_id;
            currentMember.user = member.user;
        }
        else {
            Object.keys(member).forEach(key => {
                currentMember[key] = member[key];
            });
        }
        guildMembers.set(member.user?.id, currentMember);
    });
    events.on('GUILD_MEMBER_REMOVE', (member) => {
        const guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers)
            return;
        guildMembers.delete(member.user.id);
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.members.delete(guild.id);
    });
}
exports.members = members;
