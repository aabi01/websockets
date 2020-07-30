var serverURL = 'ws://192.168.0.103:8085/';
var client = new WebSocket(serverURL, 'echo-protocol');

client.onerror = function () {
	console.log('Connection Error');
};

client.onopen = function () {
	console.log('WebSocket Client Connected');

	function sendNumber() {
		if (client.readyState === client.OPEN) {
			var number = Math.round(Math.random() * 0xFFFFFF);
			client.send(number.toString());
			setTimeout(sendNumber, 3000);
		}
	}
	sendNumber();
};

client.onclose = function () {
	console.log('echo-protocol Client Closed');
};

client.onmessage = function (e) {
	if (typeof e.data === 'string') {
		console.log("Received: '" + e.data + "'");
	}
};


// WebRTC - Get IP Address
var peerConn;
var dataChannel;
// var socket = io();

// socket.on('peers', (peers) => {
// 	console.log('peers received: ', peers);
// });

peerConn = new RTCPeerConnection({});
peerConn.onicecandidate = function (event) {
	if (event.candidate) {
		console.log('CANDIDATE: ', event.candidate);
		var ip = event.candidate.address;
		console.log('GOT IP ADDRESS: ', ip);
		document.querySelector('#localip').innerHTML = ip;
		document.querySelector('#serverip').innerHTML = serverURL;
		// socket.emit('peer-connected', ip);
	}
};
dataChannel = peerConn.createDataChannel('photos');
peerConn.createOffer(onLocalSessionCreated, logError);

function onLocalSessionCreated(desc) {
	peerConn.setLocalDescription(desc, function () { }, logError);
}

function logError(err) {
	if (!err) return;
	if (typeof err === 'string') {
		console.warn(err);
	} else {
		console.warn(err.toString(), err);
	}
}