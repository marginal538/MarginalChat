class MarginalChat {
    static PluginConfig = new JsonConfigFile("./plugins/MarginalChat/config.json", JSON.stringify({
        Chat: {
            Global: "[G] <{pl}> {msg}",
            Local: "[L] <{pl}> {msg}"
        },
        CensoredWords: {
            Enabled: false,
            Words: ["niga", "niggers", "nigga"]
        },
        Distance: 15,
        GlobalSymbol: "!",
    }))

    static PluginMeta = {
        Name: "MarginalChat",
        Introduction: "Local and Global chat for your server.",
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
                    (sourcePlayer.distanceToPos(onlinePlayer.pos) != undefined && Math.round(sourcePlayer.distanceToPos(onlinePlayer.blockPos)) <= MarginalChat.PluginConfig.get("Distance"))
                    &&
                    sourcePlayer.pos.dimid == onlinePlayer.pos.dimid
                ) {
                    nearPlayers.push(onlinePlayer)
                }
            });

            return nearPlayers
        },
        GenerateMessage(sourcePlayer, msg, isGlobal = true) {
            let message;
            let resultMsg;

            if (isGlobal) {
                message = MarginalChat.PluginConfig.get("Chat").Global
            } else {
                message = MarginalChat.PluginConfig.get("Chat").Local
            }

            if (isGlobal) {
                resultMsg = msg.substring(MarginalChat.PluginConfig.get("GlobalSymbol").length) 
            } else {
                resultMsg = msg
            }

            let replaceDict = [
                {
                    placeholder: "{pl}",
                    result: sourcePlayer.realName
                },
                {
                    placeholder: "{plping}",
                    result: sourcePlayer.getDevice().avgPing
                },
                {
                    placeholder: "{plos}",
                    result: sourcePlayer.getDevice().os
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

            replaceDict.forEach(replaceString => {
                message = message.replace(replaceString.placeholder, replaceString.result)
            })

            return message
        },
        IfMessageContainIncorrectWords(message) {
            let incorrectWordsArray = MarginalChat.PluginConfig.get("CensoredWords").Words
            let msg = message;

            let isIncorrectWord = false;
            
            incorrectWordsArray.forEach(word => {
                if (msg.includes(word)) {
                    isIncorrectWord = true;
                }
            })
            
            return isIncorrectWord
        }
    }

    static PreparePermissions() {
        if (!Permission.permissionExists("marginalchat:chat_access")) {
            Permission.registerPermission("marginalchat:chat_access", "MarginalChat: Access to chat")
        }

        if (!Permission.permissionExists("marginalchat:global_chat_access")) {
            Permission.registerPermission("marginalchat:global_chat_access", "MarginalChat: Ability to write in Global chat")
        }

        if (!Permission.permissionExists("marginalchat:write_incorrect_words") && MarginalChat.PluginConfig.get("CensoredWords").Enabled) {
            Permission.registerPermission("marginalchat:write_incorrect_words", "MarginalChat: Ability to write incorrect words in chat")
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
                if (
                    !this.Utils.IfMessageContainIncorrectWords(message)
                ) {
                    if (message.startsWith(MarginalChat.PluginConfig.get("GlobalSymbol"))) {
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
                    if (Permission.permissionExists("marginalchat:write_incorrect_words") && !Permission.checkPermission(pl.xuid, "marginalchat:write_incorrect_words")) {
                        pl.tell(`${Format.Red}You do not have permission to write incorrect words to chat.`)
                    }
                }
            } else {
                pl.tell(`${Format.Red}You do not have permission to write to chat.`)
            }

            return false;
        })
    }
}

MarginalChat.Init();