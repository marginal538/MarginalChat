class LocalGlobalChat {
    // сделать конфиги через класс JsonConfigFile
    static Options = {
        Chat: {
            Local: "[L] <{pl}> {msg}",
            Global: "[G] <{pl}> {msg}"
        },
        Distance: 15
    }

    static PluginMeta = {
        Name: "MarginalChat",
        Introduction: "Improved Local and Global chat with extra features.",
        Version: [1, 0, 0],
        Other: {
            Author: [
                "shishkevichd",
                "marginal538"
            ],
            License: "Apache License",
        },
    };

    static Utils = {
        getNearPlayers(player) {
            let nearPlayers = []

            mc.getOnlinePlayers().forEach(pl => {
                if (
                    (player.distanceToPos(pl.pos) != undefined && Math.round(player.distanceToPos(pl.blockPos)) <= LocalGlobalChat.Options.Distance)
                    &&
                    player.pos.dimid == pl.pos.dimid
                ) {
                    nearPlayers.push(pl)
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