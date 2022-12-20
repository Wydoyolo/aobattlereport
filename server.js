const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');



client.once('ready', () => {
	console.log('Ready!');
});

client.login('TOKEN_GOES_HERE');
client.on('messageCreate', async message => {
	
	if (message.content.startsWith('!m battle ')) {
		console.log(message)
		let newMsg = message.content.replace('!m battle', '').replace(' ', '');
		let eventId = newMsg.split('/');
		let eventIdParsed = eventId[eventId.length - 1];
		console.log(`${newMsg} - ${isNaN(newMsg)}`)
		if (isNaN(newMsg) && eventId.length == 1) {
			message.reply("Please provide battleboard link - !m battle <link> or <id>")
			return;
		}
		if (!isNaN(newMsg)) {
			eventIdParsed = newMsg;
		}
		console.log(`Downloading info for ${eventIdParsed}`)
		getData("api.aotools.net", '/v2/battles/' + `${eventIdParsed}`, async function (data) {

			
			if (IsJsonString(data)) {
				data = JSON.parse(data);
			} else {
				return message.reply("Battle not found");
			}

			let battleId = data.id;
			let startTime = data.startTime;
			startTime = startTime.slice(0, 19);
			startTime = startTime.replace("T", " ")
			let endTime = data.endTime;
			endTime = endTime.slice(0, 19);
			endTime = endTime.replace("T", " ")
			let totalKills = data.totalKills;
			let totalFame = data.totalFame;
			let allGuilds = data.guilds;
			let allAlliances = data.alliances;
			let allPlayers = data.players;

			var arrayGuilds = {};
			var arrayAlliances = {};
			console.log(Object.keys(allPlayers).length)
			console.log(Object.keys(data.players).length)
			for (var i in allPlayers) {
				if (allPlayers.hasOwnProperty(i)) {
					console.log(i + " -> " + allPlayers[i]);
					if (!arrayGuilds.hasOwnProperty(allPlayers[i].guildName)) {
						arrayGuilds[allPlayers[i].guildName] = [];
						arrayGuilds[allPlayers[i].guildName]['players'] = 1;
						arrayGuilds[allPlayers[i].guildName]['kills'] = allPlayers[i].kills;
						arrayGuilds[allPlayers[i].guildName]['deaths'] = allPlayers[i].deaths;

					} else {
						arrayGuilds[allPlayers[i].guildName]['players'] += 1;
						arrayGuilds[allPlayers[i].guildName]['kills'] += allPlayers[i].kills;
						arrayGuilds[allPlayers[i].guildName]['deaths'] += allPlayers[i].deaths;
					}
					if (!arrayAlliances.hasOwnProperty(allPlayers[i].allianceName)) {
						arrayAlliances[allPlayers[i].allianceName] = [];
						arrayAlliances[allPlayers[i].allianceName]['players'] = 1;
						arrayAlliances[allPlayers[i].allianceName]['kills'] = allPlayers[i].kills;
						arrayAlliances[allPlayers[i].allianceName]['deaths'] = allPlayers[i].deaths;

					} else {
						arrayAlliances[allPlayers[i].allianceName]['players'] += 1;
						arrayAlliances[allPlayers[i].allianceName]['kills'] += allPlayers[i].kills;
						arrayAlliances[allPlayers[i].allianceName]['deaths'] += allPlayers[i].deaths;
					}

				}
			}

			for (var i in arrayAlliances) {
				if (arrayAlliances.hasOwnProperty(i)) {
					//console.log(i + " -> ----  " + arrayAlliances[i]);
					//console.log(arrayAlliances)
				}
			}


			arrayAlliances = Object.entries(arrayAlliances);
			arrayGuilds = Object.entries(arrayGuilds);
			console.log(arrayAlliances)

			arrayAlliances.sort(sortFunction)
			arrayGuilds.sort(sortFunction)
			const canvas = Canvas.createCanvas(700, 518);
			const context = canvas.getContext('2d');

			const background = await Canvas.loadImage('./wallpaper.jpg');
			context.drawImage(background, 0, 0, canvas.width, canvas.height);

			context.strokeStyle = '#000000';
			context.strokeRect(0, 0, canvas.width, canvas.height);

			let x = 23;
			let y = 180;
			let allies = 15;
			let count = 1;
			for (var i in arrayAlliances) {
				if (count > 10) {
					break;
				}
				console.log(arrayAlliances[i][1].players)
				let allianceName = arrayAlliances[i][0];

				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				if (allianceName == "") {
					allianceName = "NO ALLIANCE"
					context.fillStyle = '#777777';
				}
				context.fillText(count + `. ${allianceName}`, x, y);
				count++;
				//p
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayAlliances[i][1].players, x + 200, y);
				//k
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayAlliances[i][1].kills, x + 240, y);
				//d
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayAlliances[i][1].deaths, x + 280, y);
				y += 30;
			}
			x = 370;
			y = 180;
			count = 1;
			for (var i in arrayGuilds) {
				if (count > 10) {
					break;
				}
				let guildName = arrayGuilds[i][0];

				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				if (guildName == "") {
					guildName = "NO GUILD"
					context.fillStyle = '#777777';
				}
				context.fillText(count + `. ${guildName}`, x, y);
				count++;
				//p
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayGuilds[i][1].players, x + 200, y);
				//k
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayGuilds[i][1].kills, x + 240, y);
				//d
				context.font = '13px sans-serif';
				context.fillStyle = '#ffffff';
				context.fillText(arrayGuilds[i][1].deaths, x + 280, y);
				y += 30;
			}
			context.font = '10px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(battleId, 620, 17);

			context.font = '12px sans-serif';
			context.fillStyle = '#ffffff';
			context.textAlign = "center";
			context.fillText(`Start: ${startTime} | Alliances/Guilds: ${arrayAlliances.length}/${arrayGuilds.length} | Players: ${Object.keys(allPlayers).length} | Kills: ${totalKills} | Killfame: ${totalFame}`, canvas.width/2, 92);

		

			context.beginPath();
			context.arc(125, 125, 100, 0, Math.PI * 2, true);
			context.closePath();
			context.clip();

			

			const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'battlereport.png' })
			const embed = new EmbedBuilder()
				.setAuthor({
					name: "AlbionMT", 
					iconURL: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/274/toolbox_1f9f0.png"
                })
				.setTitle(`Battle report!`)
				.setColor('#3f51b5')
				.addFields([
					{
						name: "Battle Info", 
						value: `**Start time:** ${startTime}\n**End Time:** ${endTime}\n**Total Kills**: ${totalKills}\n**Alliances:** ${arrayAlliances.length}\n**Guilds:** ${arrayGuilds.length}`,
						inline: true
					},
					{
						name: "Battleboards",
						value: `[Kill-Board.com](https://kill-board.com/battles/${battleId})\n[AlbionBattles.com](https://albionbattles.com/battles/${battleId})`,
						inline: true
                    }
				])
				
				.setImage('attachment://battlereport.png');
			try {
				message.channel.send({ embeds: [embed], files: [attachment] }).catch(console.error);
			} catch {
				console.log("error2")
			}
			
		});
	}
	// This part below work with discordjs v12
	else if (message.content.startsWith('!m battles ')) {
		console.log(message.content)
		let newMsg = message.content.replace('!m battles ', '');
		let args = newMsg.split(/ +/);
		if (typeof args[0] === 'undefined') {
			return;
		}
		
		let arrayPlayersG = []
		let arrayPlayersA = []
		var arrayGuilds = {};
		var arrayAlliances = {};
		let totalFame = 0;
		let totalKills = 0;
		let countPlayers = 0;
		let json = [];
		let battleId = args;
		for (var i = 0; i < args.length; i++) {
			if (isNaN(args[i])) {
				console.log("break")
				break;
			}
			console.log(i + ' - ' + args[i]);

			let test = getData("api.aotools.net", '/v2/battles/' + `${args[i]}`, function (data) {
			}).then(data => { return data });
			await test.then(function (result) {
				if(IsJsonString(result)) {
					json.push(result)
				} else {
					message.reply(`Error parsing battle: ${args[i]}`)
				}
				
				
			})
		}
		
		
        for (var j = 0; j < json.length; j++) {
			if (IsJsonString(json[j])) {
				json[j] = JSON.parse(json[j]);
			} else {
				return message.reply("Battle not found");
			}
			
			totalKills += json[j].totalKills;
			totalFame += json[j].totalFame;
			let allPlayers = json[j].players;
			countPlayers += Object.keys(allPlayers).length

			for (var i in allPlayers) {
				if (allPlayers.hasOwnProperty(i)) {

					//console.log(`Checking if guild added: ${allPlayers[i].guildName}`)
					if (!arrayGuilds.hasOwnProperty(allPlayers[i].guildName)) {
						arrayGuilds[allPlayers[i].guildName] = [];
						//console.log(`Checking if already in array: ${allPlayers[i].id}`)
						if (!arrayPlayersG.includes(allPlayers[i].id)) {
							arrayPlayersG.push(allPlayers[i].id)
							arrayGuilds[allPlayers[i].guildName]['players'] = 1;
							//console.log(`not in array - adding ${allPlayers[i].id} to ${allPlayers[i].guildName} - ${arrayGuilds[allPlayers[i].guildName]['players']}`)
							
						}
						if (arrayGuilds[allPlayers[i].guildName]['players'] > 0 ) {

						} else {
							arrayGuilds[allPlayers[i].guildName]['players'] = 1;
						}
						arrayGuilds[allPlayers[i].guildName]['kills'] = allPlayers[i].kills;
						arrayGuilds[allPlayers[i].guildName]['deaths'] = allPlayers[i].deaths;
						//console.log(`Guild added now: ${allPlayers[i].guildName}`)
						

					} else {
						if (!arrayPlayersG.includes(allPlayers[i].id)) {
							arrayPlayersG.push(allPlayers[i].id)
							arrayGuilds[allPlayers[i].guildName]['players'] += 1;
							//console.log(`Adding 1 player count for : to ${allPlayers[i].guildName} Player: ${allPlayers[i].id} - current total : ${arrayGuilds[allPlayers[i].guildName]['players']}`)
							
						}
						arrayGuilds[allPlayers[i].guildName]['kills'] += allPlayers[i].kills;
						arrayGuilds[allPlayers[i].guildName]['deaths'] += allPlayers[i].deaths;
						//console.log(`Guild Already added: ${allPlayers[i].guildName}`)
					}
					if (!arrayAlliances.hasOwnProperty(allPlayers[i].allianceName)) {
						arrayAlliances[allPlayers[i].allianceName] = [];
						if (!arrayPlayersA.includes(allPlayers[i].id)) {
							arrayPlayersA.push(allPlayers[i].id)
							arrayAlliances[allPlayers[i].allianceName]['players'] = 1;
							
						}
						if (arrayAlliances[allPlayers[i].allianceName]['players'] > 0 ) {

						} else {
							arrayAlliances[allPlayers[i].allianceName]['players'] = 1;
						}
						arrayAlliances[allPlayers[i].allianceName]['kills'] = allPlayers[i].kills;
						arrayAlliances[allPlayers[i].allianceName]['deaths'] = allPlayers[i].deaths;

					} else {
						if (!arrayPlayersA.includes(allPlayers[i].id)) {
							arrayPlayersA.push(allPlayers[i].id)
							arrayAlliances[allPlayers[i].allianceName]['players'] += 1;
							
						}
						arrayAlliances[allPlayers[i].allianceName]['kills'] += allPlayers[i].kills;
						arrayAlliances[allPlayers[i].allianceName]['deaths'] += allPlayers[i].deaths;
					}

				}
			}
		}
		console.log(arrayPlayersA)
		arrayAlliances = Object.entries(arrayAlliances);
		arrayGuilds = Object.entries(arrayGuilds);
		console.log(arrayAlliances)

		arrayAlliances.sort(sortFunction)
		arrayGuilds.sort(sortFunction)
		const canvas = Canvas.createCanvas(700, 518);
		const context = canvas.getContext('2d');

		const background = await Canvas.loadImage('./wallpaper.jpg');
		context.drawImage(background, 0, 0, canvas.width, canvas.height);

		context.strokeStyle = '#000000';
		context.strokeRect(0, 0, canvas.width, canvas.height);

		let x = 26;
		let y = 180;
		let allies = 15;
		let count = 1;
		for (var i in arrayAlliances) {
			if (count > 10) {
				break;
			}
			console.log(arrayAlliances[i][1].players)
			let allianceName = arrayAlliances[i][0];

			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			if (allianceName == "") {
				allianceName = "NO ALLIANCE"
				context.fillStyle = '#777777';
			}
			context.fillText(count + `. ${allianceName}`, x, y);
			count++;
			//p
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayAlliances[i][1].players, x + 200, y);
			//k
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayAlliances[i][1].kills, x + 240, y);
			//d
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayAlliances[i][1].deaths, x + 280, y);
			y += 30;
		}
		x = 370;
		y = 180;
		count = 1;
		for (var i in arrayGuilds) {
			if (count > 10) {
				break;
			}
			let guildName = arrayGuilds[i][0];

			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			if (guildName == "") {
				guildName = "NO GUILD"
				context.fillStyle = '#777777';
			}
			context.fillText(count + `. ${guildName}`, x, y);
			count++;
			//p
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayGuilds[i][1].players, x + 200, y);
			//k
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayGuilds[i][1].kills, x + 240, y);
			//d
			context.font = '13px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText(arrayGuilds[i][1].deaths, x + 280, y);
			y += 30;
		}
	

		context.font = '12px sans-serif';
		context.fillStyle = '#ffffff';
		context.textAlign = "center";
		context.fillText(`Alliances/Guilds: ${arrayAlliances.length}/${arrayGuilds.length} | Players: ${arrayPlayersG.length} | Kills: ${totalKills} | Killfame: ${totalFame}`, canvas.width / 2, 92);

	

		context.beginPath();
		context.arc(125, 125, 100, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

	

		
		let battlesTxt = battleId; 
		let log = `[AlbionBattles.com (multi)](https://albionbattles.com/multilog?ids=${battlesTxt})`
		if (battlesTxt.length > 70) {
			battlesTxt = "Too many battles to generate list";
			log = `Too many battles to generate link`
		}

		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'battlereport.png' })
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "AlbionMT",
				iconURL: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/274/toolbox_1f9f0.png"
			})
			.setTitle(`Multi Battle report!`)
			.setColor('#3f51b5')
			.addFields([
				{
					name: "Battles",
					value: `${battlesTxt}`
                },
				{
					name: "Battle Info",
					value: `**Total Kills**: ${totalKills}\n**Alliances:** ${arrayAlliances.length}\n**Guilds:** ${arrayGuilds.length}`,
					inline: true
				},
				{
					name: "Battleboards",
					value: `${log}`,
					inline: true
				}
			])

			.setImage('attachment://battlereport.png');

		try {
			if (battleId.length > 70) {
				message.channel.send({ content: `https://albionbattles.com/multilog?ids=${battleId}`, embeds: [embed], files: [attachment] }).catch(console.error);
			} else {
				message.channel.send({ content: `https://albionbattles.com/multilog?ids=${battleId}`, embeds: [embed], files: [attachment] }).catch(console.error);;
			}
		} catch {
			console.log("error2")
		}
		
	}



});




function getData(_host, _path, callback) {
	return new Promise((resolve, reject) => {
		var http = require('https');

		var options = {
			host: _host,
			path: _path
		}
		var request = http.request(options, function (res) {
			var data = '';
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function () {
				if (IsJsonString(data)) {
					resolve(data)
					callback(data)

				} else {
					resolve(data)
					callback("error")
					console.log("error data" + data)
				}

			});
		});
		request.on('error', function (e) {
			callback("error")
			reject("error")
			console.log("ERROR: " + e.message);
		});
		request.end();
	})
}
function IsJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}

function sortFunction(a, b) {
	if (a[1].players < b[1].players) {
		return 1;
	} else {
		return -1;
    }
}