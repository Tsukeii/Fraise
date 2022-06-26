/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { MessageEmbed } = require("discord.js");
module.exports = class Embed extends MessageEmbed {
    constructor(opts = {}, data = {}) {
        super(data);
        this.setDesc = this.setDescription;
        let { color = null } = opts;
        const {
            tag = null,
            avatarURL = null,
            timestamp = true,
            footer = null,
        } = opts;
        switch (color?.toLowerCase?.()) {
            case "error":
                color = "#303136";
                break;
            case "red":
                color = "#303136";
                break;
            case "success":
                color = "#303136";
                break;
            case "blue":
                color = "#303136";
                break;
            case "green":
                color = "#303136";
                break;
            case "lightblue":
                color = "#303136";
                break;
            case "pink":
                color = "#303136";
                break;
            default:
                if (!color) color = "#303136";
                break;
        }
        this.setColor(color);
        if (tag && avatarURL) this.setAuthor(`${tag}`, `${avatarURL}`);
        else if (tag) this.setAuthor(`${tag}`);
        if (footer) this.setFooter(`${footer}`);
        if (timestamp) this.setTimestamp();
    }
};
