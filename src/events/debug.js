module.exports = {
    name: "debug",
    once: false,
    execute(client, info) {
        if (
            !info.match(/\b(?:heartbeat|token|connect)\b/gi) &&
            client.debug &&
            client.debugLevel > 0
        )
            client.logger.log(info, "debug", ["DISCORD"]);
    },
};
