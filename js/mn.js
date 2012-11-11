var player;

var HOST = 'http://kevincon.github.com/movienight/';

function showParticipants() {
	var participants = gapi.hangout.getParticipants();

	var retVal = '<p>Participants lol: </p><ul>';

	for (var index in participants) {
		var participant = participants[index];

		if (!participant.person) {
			retVal += '<li>A participant not running this app</li>';
		}
		retVal += '<li>' + participant.person.displayName + '</li>';
	}

	retVal += '</ul>';

	var div = document.getElementById('participantsDiv');

	div.innerHTML = retVal;

	console.log('got to showParticipants');
}

function playerStateChanged(newState) {
	switch (newState) {
		case 'PLAYING':
			console.log('Playing');
			break;
		case 'PAUSED':
			console.log('Paused');
			break;
	}
}

function playerSeekChanged(position) {
	console.log('Player seeked to' + position.toString());
}

function playerInit() {
	player = projekktor('#player', {
						volume: 0.8,
						playerFlashMP4: HOST + 'jarisplayer.swf',
						playerFlashMP3: HOST + 'jarisplayer.swf'
					});
	player.addListener('state', playerStateChanged);
	player.addListener('seek', playerSeekChanged);
}

function init() {
	// When API is ready...                                                         
	gapi.hangout.onApiReady.add(
			function(eventObj) {
				if (eventObj.isApiReady) {
					document.getElementById('showParticipants')
						.style.visibility = 'visible';
				}
			});
}

// Wait for gadget to load.                                                       
gadgets.util.registerOnLoadHandler(init);

$(document).ready(function() {
	playerInit();
});