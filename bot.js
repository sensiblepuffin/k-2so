var Discord = require('discord.js');
var fs = require ('fs');
var path = require ('path');

var k2 = new Discord.Client();

var token = fs.readFileSync('token', 'utf8').replace(/^\s+|\s+$/g,'');
k2.login(token);


function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} // sleep

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

var audioTimeout = new Date();
function findInVoiceChannel(guild, userName) {
	return guild.channels.find(function(channel) {
		return (channel.type === "voice" 
			&& channel.members.find(function(member) {
				return member.user.username === userName;	
		})); // find member;
	});
} // findInVoiceChannel

function playAudioInChannel(tchannel, vchannel, path) {
	if (new Date().getTime() < audioTimeout) {
		tchannel.sendMessage("Have some patience.");
		return;
	}
	audioTimeout = new Date();
	audioTimeout = audioTimeout.setMinutes(audioTimeout.getMinutes() + 5);
	vchannel.join().then(connection => {
		console.log("Joined " + vchannel.name);
        setTimeout(function() {
            const dispatch = connection.playFile(path, 
                { volume : 0.5 }, function(error, intent) {
                intent.on("error", function(err) {
                    console.log("playFile: " + error);
                })
            });
            dispatch.on('end',() => connection.disconnect()) }, 750); })
        .catch(console.log);        
	voiceReactInProgress = false;
}

k2.on("message", function (message) {
	var author = message.author;
	var channel = message.channel;
    if (message.content.substring(0, 1) == "!") {
        var arguments = message.content.substring(1).split(" ");
        var command = arguments[0];
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
				author.username);
			if (vchannel == undefined) {
				message.reply("THAT QUESTION WILL BE ANSWERED THIS SUNDAY!");
			} // if
			else {
				voiceReactInProgress = true;
				playAudioInChannel(channel, vchannel, "audio/whoischamp.mp3");	
				voiceReactInProgress = false;

			} // else
					} // if
	} // else
}); // on.message
