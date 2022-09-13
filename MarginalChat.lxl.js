class LocalGlobalChat {
    static PluginConfig = new JsonConfigFile("./plugins/MarginalChat/config.json", JSON.stringify({
        StartedFirst: true,
        Chat: {
            Global: "[G] <{pl}> {msg}",
            Local: "[L] <{pl}> {msg}"
        },
        Distance: 15,
        GlobalSymbol: "!",
    }))

    static PluginMeta = {
        Name: "MarginalChat",
        Introduction: "Improved Local and Global chat with extra features.",
        Version: [1, 0, 0],
        Other: {
            License: "Apache License",
        },
    };

    static Utils = {
        getNearPlayers(player) {
            let nearPlayers = []

            mc.getOnlinePlayers().forEach(pl => {
                if (
                    (player.distanceToPos(pl.pos) != undefined && Math.round(player.distanceToPos(pl.blockPos)) <= LocalGlobalChat.PluginConfig.get("Distance"))
                    &&
                    player.pos.dimid == pl.pos.dimid
                ) {
                    nearPlayers.push(pl)
                }
            });

            return nearPlayers
        },
        generateMessage(player, msg, isGlobal = true) {
            let message;
            let resultMsg;

            if (isGlobal) {
                message = LocalGlobalChat.PluginConfig.get("Chat").Global
            } else {
                message = LocalGlobalChat.PluginConfig.get("Chat").Local
            }

            if (isGlobal) {
                resultMsg = msg.substring(LocalGlobalChat.PluginConfig.get("GlobalSymbol").length) 
            } else {
                resultMsg = msg
            }

            return message.replace("{pl}", player.realName)
                          .replace("{msg}", resultMsg)
                          .replace("{Y}", system.getTimeObj().Y)
                          .replace("{M}", system.getTimeObj().M)
                          .replace("{D}", system.getTimeObj().D)
                          .replace("{h}", system.getTimeObj().h)
                          .replace("{m}", system.getTimeObj().m)
                          .replace("{s}", system.getTimeObj().s)
        }
    }

    static registerRoles() {
        if (!Permission.permissionExists("marginalchat:chat_access")) {
            Permission.registerPermission("marginalchat:chat_access", "MarginalChat: Access to chat")
        }

        if (!Permission.permissionExists("marginalchat:global_chat_access")) {
            Permission.registerPermission("marginalchat:global_chat_access", "MarginalChat: Ability to write in Global chat")
        }
    }

    static Init() {
        ll.registerPlugin(
            this.PluginMeta.Name,
            this.PluginMeta.Introduction,
            this.PluginMeta.Version,
            this.PluginMeta.Other
        );

        this.registerRoles();

        this.Main();

        logger.info("Plugin loaded")
    }

    static Main() {
        mc.listen("onChat", (pl, message) => {
            if (Permission.checkPermission(pl.xuid, "marginalchat:chat_access")) {
                if (message.startsWith(LocalGlobalChat.PluginConfig.get("GlobalSymbol"))) {
                    if (Permission.checkPermission(pl.xuid, "marginalchat:global_chat_access")) {
                        mc.getOnlinePlayers().forEach(player => {
                            player.tell(this.Utils.generateMessage(pl, message))
                        })
                    } else {
                        pl.tell(`${Format.Red}You do not have permission to write to the global chat.`)
                    }
                } else {
                    let nearPlayers = this.Utils.getNearPlayers(pl)
    
                    nearPlayers.forEach(player => {
                        player.tell(this.Utils.generateMessage(pl, message, false))
                    })
                }
            } else {
                pl.tell(`${Format.Red}You do not have permission to write to chat.`)
            }

            return false;
        })
    }
}

LocalGlobalChat.Init();