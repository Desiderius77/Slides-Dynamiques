
var io = require('socket.io');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = io.listen(server);
var fs = require('fs');
var formidable = require('formidable');
var currentSlideId;

 // Loading server and static repository definition to include inside it.
app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.json());
	app.use(express.urlencoded());
});
app.get('/', function (req, res, next) {
    res.render('./public/index.html');
});
app.post('/public/ppt', function(req, res){
	console.log("new post");

	var form = new formidable.IncomingForm({ 
	  uploadDir: __dirname + '/public/ppt/',  // don't forget the __dirname here
	  keepExtensions: true
	});

    console.log(form.uploadDir);

    form.parse(req, function(err, fields, files){
      if (err) return res.end('You found error');
      console.log(files.image);
    });

    form.on('file', function(field, file) {
        //rename the incoming file to the file's name
        fs.rename(file.path, form.uploadDir + "/Presentation.html", function(err){
        	preventClients(); //tell to all clients to update their presentation
        });  
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        console.log(bytesReceived + ' ' + bytesExpected);
    });

    form.on('error', function(err) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.end('error:\n\n'+util.inspect(err));
    });

   return;
});
server.listen(8333);

// Attributs
var asRoot = false;
var allClients = 0;
var root;
var slide_currently;
var my_timer;
var TempoPPT;
var tab_client = [];
var arrayMasters = [];

// We define client side file
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/video.html');
});

// Client's connection
socket.on('connection', function (client) {
    "use strict";
    var TempoPseudo;
    
	// After entering a password, the session begin
	client.on('ouvertureSession', function (connection) {
		var user = JSON.parse(connection);
        allClients += 1;
        
        if (user.identifant === "root" && user.password === "pass") {
            asRoot = true;
            arrayMasters.push(user.identifant);
            root = client;
            console.log("Bonjour Didier !");
        }
        
     	// We check if a master exists or not. If it doesn't, we give it the right.
		if (arrayMasters.length === 0 ) {
            arrayMasters.push(user.identifant);
		}
        
		TempoPseudo = user.identifant;
		tab_client.push(TempoPseudo);
    
    	// We send client's tab to users that began connection
		client.send(JSON.stringify({
            "clients": allClients,
            "tab_client": tab_client,
            "connexion": TempoPseudo,
            "arrayMasters": arrayMasters,
		}));

		client.emit('activeSlide', currentSlideId);
        
		// We send tab's client to all clients connected
		client.broadcast.send(JSON.stringify({
            "clients": allClients,
            "tab_client": tab_client,
            "messageSender": TempoPseudo
		}));
		 
    });

	// Slides management and messages management
	client.on('message', function (message) {
		var newMessage = JSON.parse(message);
		client.broadcast.send(JSON.stringify({
			messageContent: newMessage.messageContent,      // Discussion channel
			messageSender: newMessage.messageSender,    	// pseudo
		}));
	});

	// Broadcast the message to prevent clients that a new presentation is selected by the animator 
	client.on('updateSlide', function () {
		console.log('server receives and broadcast updateSlide');
		client.broadcast.emit('updateSlide');
	});

	client.on('SlideChanged', function (activeSlideId) {
		currentSlideId = activeSlideId;
		client.broadcast.emit('activeSlide', currentSlideId);
	});

	client.on('activeSlideIdRequest', function(){
		client.broadcast.emit('activeSlide', currentSlideId);
	});

	client.on('actionOnVideo', function(data){
		client.broadcast.emit('actionOnVideo', data);
	});

    client.on('requestMaster', function (identifiant) {
        console.log("demande annimateur " + identifiant);
    }); 

	// Executed when a client disconnects
	client.on('disconnect', function () {
		console.log('disconnect ' + TempoPseudo);
		
		if (TempoPseudo) {
			tab_client.splice(tab_client.indexOf(TempoPseudo), 1);
            
            if (arrayMasters.indexOf(TempoPseudo) !== -1) {
                arrayMasters.splice(arrayMasters.indexOf(TempoPseudo), 1);
                if (arrayMasters.length === 0 && tab_client.length > 0) {
                    arrayMasters.push(tab_client[0]);
                }
            }
		}
        
		allClients -= 1;
        
    // We send the new client table to all clients
		client.broadcast.send(JSON.stringify({
            "clients": allClients,
            "tab_client": tab_client,
            "deconnexion": TempoPseudo,
            "arrayMasters": arrayMasters
		}));
		
	});
});

function preventClients(){
	socket.sockets.emit('updateSlide');
}
