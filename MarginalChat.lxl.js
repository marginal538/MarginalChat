class LocalGlobalChat {
    static PluginConfig = new JsonConfigFile("./plugins/MarginalChat/config.json", JSON.stringify({
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
        GetNearPlayers(sourcePlayer) {
            let nearPlayers = []

            mc.getOnlinePlayers().forEach(onlinePlayer => {
                if (
                    (sourcePlayer.distanceToPos(onlinePlayer.pos) != undefined && Math.round(sourcePlayer.distanceToPos(onlinePlayer.blockPos)) <= LocalGlobalChat.PluginConfig.get("Distance"))
                    &&
                    sourcePlayer.pos.dimid == onlinePlayer.pos.dimid
                ) {
                    nearPlayers.push(onlinePlayer)
                }
            });

            return nearPlayers
        },
        GenerateMessage(sourcePlayer, msg, isGlobal = true) {
            /** @type {String} */
            let message;
            let resultMsg;

            let replaceDict = [
                {
                    placeholder: "{pl}",
                    result: sourcePlayer.realName
                },
                {
                    placeholder: "{msg}",
                    result: resultMsg
                },
                {
                    placeholder: "{Y}",
                    result: system.getTimeObj().Y
                },
                {
                    placeholder: "{M}",
                    result: system.getTimeObj().M
                },
                {
                    placeholder: "{D}",
                    result: system.getTimeObj().D
                },
                {
                    placeholder: "{h}",
                    result: system.getTimeObj().h
                },
                {
                    placeholder: "{m}",
                    result: system.getTimeObj().m
                },
                {
                    placeholder: "{s}",
                    result: system.getTimeObj().s
                },
            ]

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

            replaceDict.forEach(replaceString => {
                message = message.replace(replaceString.placeholder, replaceString.result)
            })

            return message
        }
    }

    static PreparePermissions() {
        if (!Permission.permissionExists("marginalchat:chat_access")) {
            Permission.registerPermission("marginalchat:chat_access", "MarginalChat: Access to chat")
        }

        if (!Permission.permissionExists("marginalchat:global_chat_access")) {
            Permission.registerPermission("marginalchat:global_chat_access", "MarginalChat: Ability to write in Global chat")
        }
    }

    static Init() {
        if (ll.requireVersion(2,7,0)) {
            ll.registerPlugin(
                this.PluginMeta.Name,
                this.PluginMeta.Introduction,
                this.PluginMeta.Version,
                this.PluginMeta.Other
            );
    
            this.PreparePermissions();
    
            this.Main();
    
            logger.info("Ready to work.")
        } else {
            logger.error("The plugin will not work on this version of LiteLoaderBDS.")
        }
    }

    static Main() {
        mc.listen("onChat", (pl, message) => {
            if (Permission.checkPermission(pl.xuid, "marginalchat:chat_access")) {
                if (message.startsWith(LocalGlobalChat.PluginConfig.get("GlobalSymbol"))) {
                    if (Permission.checkPermission(pl.xuid, "marginalchat:global_chat_access")) {
                        mc.getOnlinePlayers().forEach(player => {
                            player.tell(this.Utils.GenerateMessage(pl, message))
                        })
                    } else {
                        pl.tell(`${Format.Red}You do not have permission to write to the global chat.`)
                    }
                } else {
                    let nearPlayers = this.Utils.GetNearPlayers(pl)
    
                    nearPlayers.forEach(player => {
                        player.tell(this.Utils.GenerateMessage(pl, message, false))
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