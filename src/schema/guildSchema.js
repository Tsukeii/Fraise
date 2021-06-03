const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        required: true,
        default: "!w",
    },
    welcomeChannel: {
        type: String,
        required: true,
        default: "new-members",
    },
    welcomeMessage: {
        type: String,
        required: true,
        default: "Welcome {mention} to the {server} server",
    },
});

const Guild = new mongoose.model("Guild", guildSchema);

module.exports = Guild;