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
            /*case "search" :
                if (arguments.size == null) {
                    message.channel.sendMessage("Search for what, " 
                        + message.author.username + "?");
                }
                
                // fetch logic
                if (fetch_time != 0) {
                    if (Math.floor(Date.now()/1000) - fetch_time > 60) {
                        messages = message.channel.fetchMessages(5000).prototype();
                    }
                    message.channel.sendMessage("Skipping fetch");  
                }     
                else { 
                    fetch_time = Math.floor(Date.now()/1000);
                    messages = message.channel.fetchMessage(5000);
                    messages.then(function(val) { console.log("Promise fulfilled");});   
                }
                console.log("Type: " + typeof(messages));
                // search logic
                var results = messages.filter(function(keyval) {
                    return keyval.content.includes(arguments[0]);
                });

                message.channel.sendMessage("**NOTE** : This command is " + 
                    "still under construction.");
                break; //case search
            */
            default :
                break;		
        } // switch
    } // if 
});
