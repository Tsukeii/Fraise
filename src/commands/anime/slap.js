const fetch = require("node-fetch");
const { userFromMention } = require("../../helpers/Util.js");
const { Embed, Command } = require("../../classes");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "slap",
                memberPerms: [],
                botPerms: [],
                requirements: {
                    args: true,
                },
                disabled: false,
                cooldown: 5,
                category: "Anime",
            },
            client
        );
    }

    async execute({ message, args }, t) {
        let res = await fetch("http://api.nekos.fun:8080/api/slap");
        res = await res.json();
        let user;
        if (args[0]) {
            if (args[0].startsWith("<@")) {
                user = userFromMention(
                    args[0] || `${message.author}`,
                    message.client
                );
            }
            if (!isNaN(parseInt(args[0]))) {
                user = message.client.users.cache.get(args[0]);
                if (!user) user = await message.client.users.fetch(args[0]);
            }
        }

        if (!user) {
            message.reply(t("errors:invalidUser"));
            return false;
        }
        if (user.id === message.author.id) {
            return message.reply(t("cmds:slap.errorYourself"));
        }
        const embed = new Embed()
            .setTitle(
                t("cmds:slap.success", {
                    author: message.author.tag,
                    user: user.tag,
                })
            )
            .setImage(res.image);
        message.reply({ embeds: [embed] });
    }
};
