/**
 * Discord Welcome bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Permissions } = require("discord.js");
module.exports = {
    name: "test",
    //aliases: [],
    permissions: [Permissions.FLAGS.MANAGE_SERVER],
    description: "Test welcome message",
    args: false,
    guildOnly: true,
    category: "Miscellaneous",
    execute(message, args) {
        const greetUser = require("../../functions/greetUser");
        greetUser(message.member);
        message.react("👍");
    },
};