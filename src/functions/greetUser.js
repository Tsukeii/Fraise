const { nth } = require("../helpers/Util.js");
const { Embed } = require("../classes");
module.exports = async (member) => {
    const { client } = member;
    const guildDB = await client.db.findOrCreateGuild(member.guild.id);
    if (
        !guildDB.plugins.welcome.enabled ||
        guildDB.disabled.includes("welcome")
    )
        return "disabled";
    let channel;
    if (isNaN(guildDB.plugins.welcome.channel)) {
        channel = member.guild.channels.cache.find(
            (ch) => ch.name === guildDB.plugins.welcome.channel
        );
    } else {
        channel = member.guild.channels.cache.find(
            (ch) => ch.id === guildDB.plugins.welcome.channel
        );
    }
    if (!channel) {
        return "channelNotFound";
    }
    channel.sendTyping();
    let msg = guildDB.plugins.welcome.message;
    //Replace Placeholders with their values
    msg = msg
        .replace("{mention}", `${member}`)
        .replace("{tag}", `${member.user.tag}`)
        .replace("{username}", `${member.user.username}`)
        .replace("{server}", `${member.guild.name}`)
        .replace("{members}", `${member.guild.memberCount}`)
        .replace(
            "{members_formatted}",
            `${member.guild.memberCount}${nth(member.guild.memberCount)}`
        );
    const embed = new Embed({ color: "green" })
        .setAuthor(
            member.user.tag,
            member.user.displayAvatarURL({
                size: 512,
                dynamic: true,
                format: "png",
            })
        )
        .setTitle(`Bienvenue ${member.user.tag}!`)
        .setDescription(msg)
        .setFooter(`Membres total: ${member.guild.memberCount}`);
    const sent = await channel
        .send({ content: `${member.user}`, embeds: [embed] })
        .catch(() => {});
    return sent;
