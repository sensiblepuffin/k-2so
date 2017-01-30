var Discord = require('discord.js');
var fs = require ('fs');
var path = require ('path');

var k2 = new Discord.Client();

var token = fs.readFileSync('token', 'utf8').replace(/^\s+|\s+$/g,'');
k2.login(token);


function sleep (ms) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > ms) {
			break;
		}
	}
}

k2.on("ready", function (rawEvent) {
	console.log("Connected to server");
	k2.user.setPresence({ game : { name : '!k2help' }});
}); // on.ready

var responseDict = {
	"hello": "The captain says you're a friend. I will not kill you.",
	"goodbye" : "Good riddance.",
	"hug" : "I'm not giving you a hug.",
	"k2help" : "You know, I'm not that complicated. You can just figure it out.",
	"fliptable" : "(╯°□°)╯︵ ┻━┻"
}

var voiceReactInProgress = false;
function findInVoiceChannel(guild, userName) {
	return guild.channels.find(function(channel) {
		return (channel.type === "voice" 
			&& channel.members.find(function(member) {
				return member.user.username === userName;	
		})); // find member;
	});
} // voiceReactInProgress

k2.on("message", function (message) {
    if (message.content.substring(0, 1) == "!") {
        var arguments = message.content.substring(1).split(" ");
        var command = arguments[0];
		var channel = message.channel;
        arguments.shift(); // just the arguments

        if (responseDict[command]) { 
                channel.sendMessage(responseDict[command]);
        } // if
    } // if
	// non-command responses
	else {
	 	if (message.toString().indexOf("JOHN CENA") !== -1) {
			message.react("\uD83D\uDCA5"); 	// boom
			message.react("\uD83C\uDFBA"); 	// trumpet
		} // if
		if (message.toString().toLowerCase().indexOf("who is champ?") !== -1) {	
			var vchannel = findInVoiceChannel(message.guild, 
				message.author.username);
			if (vchannel == undefined || voiceReactInProgress) {
				message.reply("THAT QUESTION WILL BE ANSWERED THIS SUNDAY!");
			} // if
			else {
				voiceReactInProgress = true;
				vchannel.join()
					.then(connection => {
						console.log("Joined " + vchannel.name);
						sleep(750);
						const dispatch = connection.playFile("audio/whoischamp.mp3", 
							{ volume : 0.5 }, function(error, intent) {
							intent.on("error", function(err) {
								console.log("playFile: " + error);
							})
						});
						dispatch.on('end',() => connection.disconnect());
					})
					.catch(console.log);
				vchannel.leave();
			} // else
			voiceReactInProgress = false;
		} // if
	} // else
}); // on.message
