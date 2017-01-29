var Discord = require('discord.js');
var fs = require ('fs');
var path = require ('path');

var k2 = new Discord.Client();

var token = fs.readFileSync('token', 'utf8').replace(/^\s+|\s+$/g,'');
k2.login(token);

k2.on("ready", function (rawEvent) {
	console.log("Connected to server");
	k2.user.setPresence({ game : { name : '!k2help' }});
}); // on ready

var responseDict = {
	"hello": "The captain says you're a friend. I will not kill you.",
	"goodbye" : "Good riddance.",
	"hug" : "I'm not giving you a hug.",
	"k2help" : "You know, I'm not that complicated. You can just figure it out.",
	"fliptable" : "((╯°□°)╯︵ ┻━┻)"
}

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
	else {
	 	if (message.toString().indexOf("JOHN CENA") !== -1) {
			message.react("\uD83D\uDCA5"); 	// boom
			message.react("\uD83C\uDFBA"); 	// trumpet
		} // if
	} // else
}); // on.message
