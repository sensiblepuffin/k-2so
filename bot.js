var Discord = require('discord.js');

const token = 'MjY0NDUwNjE1MTM5MjM3ODk5.C0gwaA.KJmJVH4aWm1b2WAbbYjQLf6w7VA';

var k2 = new Discord.Client();

k2.login(token);

var fetch_time;
var messages;
k2.on("ready", function (rawEvent) {
	console.log("Connected to server");
	k2.user.setPresence({ game : { name : '!k2help' }});
    fetch_time = 0;
});

//In this function we're going to add our commands.
k2.on("message", function (message) {
    if (message.content.substring(0, 1) == "!") {
        var arguments = message.content.substring(1).split(" ");
        var command = arguments[0];
        //arguments = arguments.splice(1);
        arguments.shift(); // no longer C-style argv

		

        switch(command) {
            case "hello" :
                message.channel.sendMessage("The captain says you're a" +
                    " friend. I will not kill you.");
                break;
            case "goodbye" :
                message.channel.sendMessage("Good riddance.");
                break;
            case "hug" :
                message.channel.sendMessage("I'm not giving you a hug.");
                break;
            case "k2help" :
                message.channel.sendMessage("You know, I'm not that " +
                    "complicated. You can just figure it out.");
                break;
            case "fliptable" :
                message.channel.sendMessage("(╯°□°）╯︵ ┻━┻");
                break;
            default :
                break;		
        } // switch
    } // if 
	else {
	 	if (message.toString().indexOf("JOHN CENA") !== -1) {
			//message.react({ "id" : 272792565449752576, "name" : ":trumpet:"});
			message.react("\uD83D\uDCA5"); 	// boom
			message.react("\uD83C\uDFBA"); 	// trumpet
		}
	} // els
});
