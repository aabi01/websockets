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
	httpServer: server
});

wsServer.on('request', function (request) {
	var connection = request.accept(null, request.origin);
	console.log((new Date()) + ' Connection accepted.');
	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			if (message.utf8Data.startsWith('ip:')) {
				// console.log('Received IP: ' + message.utf8Data);
				const _ip = message.utf8Data.slice(3);
				if (!peers.includes(_ip)) {
					peers.push(_ip);
				}
			}
			// connection.sendUTF(message.utf8Data);
			emitPeers(connection);

			if (message.utf8Data === 'getPeers') {
				console.log('Received Peer req: ' + message.utf8Data);
				emitPeers(connection);
			}
		}
		else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function (reasonCode, description) {
		peers = peers.filter(p => !connection.remoteAddress.includes(p));
	});
});

function emitPeers(conn) {
	const peerString = peers.join(',');
	conn.sendUTF(peerString);
}