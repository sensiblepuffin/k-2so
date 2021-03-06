var Discord = require('discord.js');

var fs = require('fs');
var path = require('path');
var http = require('http');
var moment = require('moment');
moment().format();
//var async = require('asyncawait/async');
//var await = require('asyncawait/await');
var k2 = new Discord.Client();

var token;
if (fs.existsSync('token')) {
	token = fs.readFileSync('token', 'utf8').replace(/^\s+|\s+$/g,'');
}
else {
	token = process.env.TOKEN;
	// to keep Heroku happy
	http.createServer(function(req,res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write('K-2SO is operational.\n');
	}).listen(process.env.PORT);
}
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

var contestInProgress = false;
var contestEndTime;
var contestDetails;
var contestNumParticipants;
var contestParticipants = [];
var functionDict = {
    "contest": function() { 
        if (contestInProgress) {
            this.reply("There is already a contest in progress.");
            return;
        }
        var arguments = this.content.substring(1).split("!");
        arguments.shift(); // just the arguments
        if (arguments.length !== 2) {
            this.channel.send("The syntax of this command is: \n" + 
				"!contest !<what you are giving away> !<how long the contest will last" +
				" [minutes]>", { code : true });
            return;
        }
        contestInProgress = true;
        contestNumParticipants = contestParticipants.push("No one");
        this.channel.send("@everyone, a contest has begun! " + this.author + 
            " is giving away " + arguments[0] + " in " + arguments[1] + " minute(s)! " +
            "Use !entercontest to enter the contest!");
        console.log(this.author + " started contest for " + arguments[0] + ", ends in "
            + arguments[1] + " minutes");
		contestEndTime = moment().add(arguments[1], 'minutes').format('LLL').toString();
		contestDetails = [ this.author, arguments[0], contestEndTime ];
        setTimeout(function(message, prize) {
			if (contestInProgress) {
                winner = contestParticipants[Math.ceil(Math.random()*(contestParticipants.length-1))];
                message.channel.send("@everyone, " + message.author + "'s contest has ended! " 
                    + "Out of " + (contestParticipants.length-1).toString() + " entries, "
			        + winner + " has won " + prize + "!");
                console.log("Chose winner " + winner + " from " + contestParticipants.length 
                    + " entries.");
				contestInProgress = false;
			}
		    contestParticipants = [];
        }, 1000*60*arguments[1], this, arguments[0]);
    },
    "entercontest": function() {
        if (!contestInProgress) {
            this.reply("What contest?");
            return;
        }
        if (contestParticipants.indexOf(this.author) !== -1) {
            this.reply("Only one entry per person. That is, unless you know a guy.");
            return;
        }
        contestNumParticipants = contestParticipants.push(this.author);
        this.channel.send("Your entry has been received. Good luck!");
    },
	"conteststatus": function() {
		if (!contestInProgress) {
			this.reply("What contest?");
			return;
		}
		this.channel.send("The current contest was started by " + contestDetails[0] 
            + ", the prize is " + contestDetails[1] + ", there are currently " 
            + contestNumParticipants + " entries and the contest ends at " 
			+ contestDetails[2] + ".");
	},
    "endcontest": function() {
        if (!contestInProgress) {
            this.reply("What contest?");
            return;
        }
		if (this.author !== contestDetails[0]) {
			this.channel.send("This isn't your contest.");
			return;
		}
        contestInProgress = false;
        this.channel.send("@everyone, " + this.author + " has ended the contest "  +
            "prematurely, similar to how their most recent sexual encounter ended.");
    },
    "currenttime": function() {
        this.reply("the current time is " + moment().format('LLL').toString());
    }
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
		tchannel.send("Have some patience.");
		return;
	}
	if (k2.voiceConnections) {
        var connections = k2.voiceConnections.array();
        for (var i = 0, len = connections.length; i < len; i++) {
            connections[i].disconnect();
        }
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
            dispatch.on('speaking',(val) =>  {
	    	if (!val) { connection.disconnect(); }
	    	})
	    }, 750); 
    }).catch(console.log);
	vchannel.leave();
	voiceReactInProgress = false;
}

/*
async function reactAsync(message, emoji) {
    message.react(emoji).then(function(reaction) {
        while (!reaction.me || reaction.me === null) { sleep(10); }
    }).catch(
    function(fail) {
        console.log("Failed to react with " + emoji + " because " + fail);
    });    
}
*/

k2.on("message", function (message) {
	var author = message.author;
	var channel = message.channel;
    if (message.content.substring(0, 1) == "!") {
        var arguments = message.content.substring(1).split(" ");
        var command = arguments[0];
        arguments.shift(); // just the arguments
		console.log(command + " invoked by: " + author.username);
        if (responseDict[command]) { 
        	channel.send(responseDict[command]);
        } // if
        else if (functionDict[command]) {
            functionDict[command].call(message);
        }
    } // if
	// non-command responses
	else {
		console.log("Reacting to " + author.username);
	 	if (message.toString().indexOf("JOHN CENA") !== -1) {
			message.react("\uD83D\uDCA5"); 	// boom
			message.react("\uD83C\uDFBA"); 	// trumpet
		} // if
		var lmessage = message.toString().toLowerCase();
		if (lmessage.indexOf("who is champ?") !== -1) {
			console.log("Hint: It's John Cena");
			//var vchannel = findInVoiceChannel(message.guild, 
			//	author.username);
			var vchannel = message.member.voiceChannel;
			if (vchannel === null) {
				message.reply("THAT QUESTION WILL BE ANSWERED THIS SUNDAY!");
			} // if
            else {
                voiceReactInProgress = true;
				try {
                	playAudioInChannel(channel, vchannel, "audio/whoischamp.mp3");	
				} catch (err) {
					console.error(err);
					vchannel.disconnect();
				}
                voiceReactInProgress = false;
            }
		} // who is champ?
        else if (lmessage.indexOf("yeah boy") !== -1) {
            console.log("Yeaaaah boiiiii");
            //var vchannel = findInVoiceChannel(message.guild,
            //    author.username);
			var vchannel = message.member.voiceChannel;
            if (vchannel === null) {
                // Still haven't quite figured out async.
                //reactAsync(message, "\uD83C\uDDFE");
                //reactAsync(message, "\uD83C\uDDEA");
                //reactAsync(message, "\uD83C\uDDE6");
                //reactAsync(message, "\uD83C\uDDED");
                //reactAsync(message, "\uD83C\uDDE7");
                //reactAsync(message, "\uD83C\uDDF4");
                //reactAsync(message, "\uD83C\uDDEE");
            }
            else {
                voiceReactInProgress = true;
				try {
					playAudioInChannel(channel, vchannel, "audio/yeahboy.mp3");
				} catch(err) {
					console.error(err);
					vchannel.leave();
				}
                voiceReactInProgress = false;
            }
        } // yeah boy
		else if (lmessage.indexOf("peacock") !== -1) {
			console.log("I should never let Nickhil win ever again.");
			//var vchannel = findInVoiceChannel(message.guild,
			//	author.username);
			var vchannel = message.member.voiceChannel;
			if (vchannel === null) {
				message.reply("Go away, Nickhil.");
			}
			else {
                voiceReactInProgress = true;
				try {
                	playAudioInChannel(channel, vchannel, "audio/peacock.mp3");	
				} catch(err) {
					console.error(err);
					vchannel.disconnect();
				}
                voiceReactInProgress = false;
            }
		} // peacock
		else if (lmessage.indexOf("why do you have to be mad") !== -1) {
			console.log("Is only game. Why do you heff to be mehd?");
			//var vchannel = findInVoiceChannel(message.guild,
			//	author.username);
			var vchannel = message.member.voiceChannel;
			if (vchannel === null) {
				message.reply("Is only game.");
			}
			else {
				voiceReactInProgress = true;
				try {
					playAudioInChannel(channel, vchannel, "audio/why-you-heff-to-be-mehd.mp3");
				} catch (err) {
					console.error(err);
					vchannel.disconnect();
				}
				voiceReactInProgress = false;		
			}
		} // why do you have to be mad?
		else if (lmessage.indexOf("why don't we just relax") !== -1) {
			console.log("WOULD YOU LIKE AM OR FUM?");
			//var vchannel = findInVoiceChannel(message.guild,
			//	author.username);
			var vchannel = message.member.voiceChannel;
			if (vchannel === null) {
				message.reply("Would you like AHM or FUM?");
			}
			else {
				voiceReactInProgress = true;
				try {
					playAudioInChannel(channel, vchannel, "audio/why-you-heff-to-be-mehd.mp3");
				} catch (err) {
					console.error(err);
					vchannel.disconnect();
				}
				voiceReactInProgress = false;		
			}
		} // why don't we just relax?
	} // else
}); // on.message
