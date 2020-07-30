var WebSocketServer = require('websocket').server;
var http = require('http');
var PORT = 8085;
var peers = [];

var server = http.createServer(function (request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});
server.listen(PORT, function () {
	console.log((new Date()) + ' Server is listening on port' + PORT);
});

wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.  You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

wsServer.on('request', function (request) {
	if (!originIsAllowed(request.origin)) {
		// Make sure we only accept requests from an allowed origin
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept('echo-protocol', request.origin);
	console.log((new Date()) + ' Connection accepted.');
	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			if (message.utf8Data.startsWith('ip:')) {
				console.log('Received IP: ' + message.utf8Data);
				const _ip = message.utf8Data.slice(3);
				if (!peers.includes(_ip)) {
					peers.push(_ip);
				}
			}
			// connection.sendUTF(message.utf8Data);
			broadcastPeers(connection);

			if (message.utf8Data === 'getPeers') {
				console.log('Received Peer req: ' + message.utf8Data);
				broadcastPeers(connection);
			}
		}
		else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function (reasonCode, description) {
		console.log(' Peer ' + connection.remoteAddress + ' disconnected.');
		console.log(peers);
		peers = peers.filter(p => !connection.remoteAddress.includes(p));
		console.log(peers);
	});
});

function broadcastPeers(conn) {
	const peerString = peers.join(',');
	console.log(peerString);
	conn.sendUTF(peerString);
}