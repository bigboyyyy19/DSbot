module.exports = {
    name: "guildMemberAdd",
    author: ["PlayboyPrime#3839"],
    version: "1.0.1",
    changelog: "Added custom positions",
    isEvent: true,
    isMod: true,

    init: async function (DBS) {
        const path = require("path")
        const fs = require("fs")

        if(fs.existsSync(path.join(__dirname, "WelcomeImage", "config.json")) && fs.existsSync(path.join(__dirname, "WelcomeImage", "lastid"))){
            fs.writeFileSync(path.join(__dirname, "WelcomeImage", "lastid"), "")
        } else DBS.BetterMods.Logger.error("[Modal MOD] The WelcomeImage folder is missing files or was not found."); 

        DBS.BetterMods.requireModule('canvas');
        console.log("Loaded WelcomeImage Mod");
    },
    mod: async function (DBS, member) {
        const path = require("path")
        const { MessageAttachment } = require('discord.js');
        const fs = require("fs")
        const Canvas = require('canvas');
        const config = require('./WelcomeImage/config.json')


        //I still dont know why but dbs keeps sending the event twice

        if(member.user.id == fs.readFileSync(path.join(__dirname, "WelcomeImage", "lastid"))){
            return
        } else {
            await fs.writeFileSync(path.join(__dirname, "WelcomeImage", "lastid"), member.user.id)
            setTimeout(() => {
                fs.writeFileSync(path.join(__dirname, "WelcomeImage", "lastid"), "")
            }, 100);
        }

        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
        
            let fontSize = 70;
        
            do {
                context.font = `${fontSize -= 10}px sans-serif`;
            } while (context.measureText(text).width > canvas.width - 300);
        
            return context.font;
        };

        function variables(string){
            return string
                .replace("{user.name}", member.user.username)
                .replace("{user.discriminator}", member.user.discriminator)
                .replace("{user.id}", member.user.id)
                .replace("{guild.name}", member.guild.name)
                .replace("{guild.id}", member.guild.id)
                .replace("{guild.memberCount}", member.guild.memberCount)
        }

        const canvas = Canvas.createCanvas(parseInt(config.Image.Width), parseInt(config.Image.Height));
		const context = canvas.getContext('2d');

	    const background = await Canvas.loadImage(path.join(__dirname, "WelcomeImage", config.Image.ImageName));
	    context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#0099ff"
        context.strokeRect(0, 0, canvas.width, canvas.height);

        if(config.Image.ImageText1){
            if(config.Image.ImageText1.Text){
                if(config.Image.ImageText1.Size.toLowerCase() == "auto"){
                    applyText(canvas, variables(config.Image.ImageText1.Text));
                } else context.font = config.Image.ImageText1.Size + 'px sans-serif';
	            context.fillStyle = '#' + config.Image.ImageText1.hexcolor;
                context.fillText(variables(config.Image.ImageText1.Text), config.Image.ImageText1.X, config.Image.ImageText1.Y);
            }
        }
        
        if(config.Image.ImageText2){
            if(config.Image.ImageText2.Text){
                if(config.Image.ImageText2.Size.toLowerCase() == "auto"){
                    applyText(canvas, variables(config.Image.ImageText2.Text));
                } else context.font = config.Image.ImageText2.Size + 'px sans-serif';
	            context.fillStyle = '#' + config.Image.ImageText2.hexcolor;
	            context.fillText(variables(config.Image.ImageText2.Text), config.Image.ImageText2.X, config.Image.ImageText2.Y);
            }
        }
        if(config.Image.ImageText3){
            if(config.Image.ImageText3.Text){
                if(config.Image.ImageText3.Size.toLowerCase() == "auto"){
                    applyText(canvas, variables(config.Image.ImageText3.Text));
                } else context.font = config.Image.ImageText3.Size + 'px sans-serif';
	            context.fillStyle = '#' + config.Image.ImageText3.hexcolor;
	            context.fillText(variables(config.Image.ImageText3.Text), config.Image.ImageText3.X, config.Image.ImageText3.Y);
            }
        }

	    if(config.Image.Avatar.AvatarShape.toLowerCase() == "circle"){
            context.beginPath();
	        context.arc(parseInt(config.Image.Avatar.AvatarScale) / 2 + parseInt(config.Image.Avatar.AvatarX), parseInt(config.Image.Avatar.AvatarScale) / 2 + parseInt(config.Image.Avatar.AvatarY), parseInt(config.Image.Avatar.AvatarScale) / 2, 0, Math.PI * 2, true);
	        context.closePath();
	        context.clip();
        }

        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'jpg' }));
	    context.drawImage(avatar, config.Image.Avatar.AvatarX, config.Image.Avatar.AvatarY, config.Image.Avatar.AvatarScale, config.Image.Avatar.AvatarScale);
	    const attachment = new MessageAttachment(canvas.toBuffer(), 'made by playboyprime.png');
        

        var etbool = false
        if(config.Embed.timestamp == "true"){
            etbool = true
        } else etbool = false
        
        var msg
        var emsg
        if(config.Message.Channel){
            if(member.guild.channels.cache.get(config.Message.Channel)){
                if(config.Message.Message){
                    msg = await member.guild.channels.cache.get(config.Message.Channel).send({ content: variables(config.Message.Message), files: [attachment] })
                } else msg = await member.guild.channels.cache.get(config.Message.Channel).send({ files: [attachment] })
            } else {
                console.log("[WelcomeImage MOD] Error! Channel was not found: \"" + config.Message.Channel + "\"")
                var owner = member.guild.fetchOwner()
                owner.send("[WelcomeImage MOD] Error! Channel was not found: \"" + config.Message.Channel + "\"")
            }
        } else if(config.Embed.Channel){
            if(member.guild.channels.cache.get(config.Embed.Channel)){
                const { MessageEmbed } = require('discord.js')
                const embed = new MessageEmbed()
                    .setColor(config.Embed.hexcolor)
                    .setTitle(variables(config.Embed.title))
                    .setURL(config.Embed.authorurl)
                    .setAuthor(variables(config.Embed.author))
                    .setDescription(variables(config.Embed.description))
                    .setThumbnail(config.Embed.thumbnail
                        .replace("{user.avatar_url}", member.user.avatarURL())
                        .replace("{guild.icon}", member.guild.iconURL())
                    )
                    .setImage(config.Embed.image
                        .replace("{user.avatar_url}", member.user.avatarURL())
                        .replace("{guild.icon}", member.guild.iconURL())   
                    )
                    .setTimestamp(etbool)
                    .setFooter(config.Embed.footer);
                emsg = await member.guild.channels.cache.get(config.Embed.Channel).send({ embeds: [embed], files: [attachment]})
            } else {
                console.log("[WelcomeImage MOD] Error! Channel was not found: \"" + config.Embed.Channel + "\"")
                var owner = member.guild.fetchOwner()
                owner.send("[WelcomeImage MOD] Error! Channel was not found: \"" + config.Embed.Channel + "\"")
            }
        } else {
            console.log("[WelcomeImage MOD] Error! No message type was selected.")
            var owner = member.guild.fetchOwner()
            owner.send("[WelcomeImage MOD] Error! No message type was selected.")
        }

        if(config.Message.reactions && msg && config.Message.Channel && config.Message.Message){
            reacts = config.Message.reactions.split(",")
            reacts.forEach(reaction => {
                if(member.guild.emojis.cache.get(reaction)){
                    msg.react(member.guild.emojis.cache.get(reaction))
                } else msg.react(reaction)
            });
        }

        if(config.Embed.reactions && emsg && config.Embed.Channel){
            ereacts = config.Embed.reactions.split(",")
            ereacts.forEach(reaction => {
                if(member.guild.emojis.cache.get(reaction)){
                    emsg.react(member.guild.emojis.cache.get(reaction))
                } else emsg.react(reaction)
            });
        }
    } 
};