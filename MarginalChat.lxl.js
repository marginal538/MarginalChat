class LocalGlobalChat {
    static Options = {
        Chat: {
            Local: "[L] <{pl}> {msg}",
            Global: "[G] <{pl}> {msg}"
        },
        Distance: 15
    }

    static PluginMeta = {
        Name: "LocalGlobalChat",
        Introduction: "Local and Global chat.",
        Version: [1, 0, 0],
        Other: {
            Author: "https://github.com/shishkevichd",
            License: "MIT",
        },
    };

    static Utils = {
        getNearPlayers(player) {
            let onlinePlayers = mc.getOnlinePlayers()

            let nearPlayers = []

            onlinePlayers.forEach(onlinePlayer => {
                if (
                    (player.distanceToPos(onlinePlayer.pos) != undefined && Math.round(player.distanceToPos(onlinePlayer.blockPos)) <= LocalGlobalChat.Options.Distance)
                    &&
                    player.pos.dimid == onlinePlayer.pos.dimid
                ) {
                    nearPlayers.push(onlinePlayer)
                }
            });

            return nearPlayers
        }
    }

    static Init() {
        ll.registerPlugin(
            this.PluginMeta.Name,
            this.PluginMeta.Introduction,
            this.PluginMeta.Version,
            this.PluginMeta.Other
        );

        this.Main();
    }

    static Main() {
        mc.listen("onChat", (pl, message) => {
            if (message.startsWith('!')) {
                mc.getOnlinePlayers().forEach(player => {
                    player.tell(this.Options.Chat.Global.replace("{pl}", pl.realName).replace("{msg}", message.substring(1)))
                })
            } else {
                let nearPlayers = this.Utils.getNearPlayers(pl)

                nearPlayers.forEach(player => {
                    player.tell(this.Options.Chat.Local.replace("{pl}", pl.realName).replace("{msg}", message))
                })
            }

            return false;
        })
    }
}

LocalGlobalChat.Init();