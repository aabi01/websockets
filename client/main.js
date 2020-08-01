var serverURL = 'ws://192.168.0.103:8085/';
var client = new WebSocket(serverURL);
console.log(client);

client.onerror = function (error) {
	console.log('Connection Error', error);
};

client.onopen = function () {
	console.log('WebSocket Client Connected');

	function getPeers() {
		if (client.readyState === client.OPEN) {
			console.log('getPeers');
			client.send('getPeers')
			setTimeout(getPeers, 3000);
		}
	}
	getPeers();

	getLocalIPAddress();
};

client.onclose = function () {
	console.log('echo-protocol Client Closed');
};

client.onmessage = function (e) {
	if (typeof e.data === 'string') {
		console.log(`Received from Server: ${e.data}`);
		const peers = e.data.split(',');
		const peersList = document.getElementById('peers');
		peersList.querySelectorAll('*').forEach(n => n.remove());
		for (const p of peers) {
			const li = document.createElement('li');
			li.appendChild(document.createTextNode(p));
			peersList.appendChild(li);
		}
	}
};

// WebRTC - Get IP Address
function getLocalIPAddress() {
	var peerConn;
	var dataChannel;

	peerConn = new RTCPeerConnection({});
	peerConn.onicecandidate = function (event) {
		if (event.candidate) {
			console.log('CANDIDATE: ', event.candidate);
			var ip = event.candidate.address;
			console.log('GOT IP ADDRESS: ', ip);
			document.querySelector('#localip').innerHTML = ip;
			document.querySelector('#serverip').innerHTML = serverURL;
			client.send(`ip:${ip}`);
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
}