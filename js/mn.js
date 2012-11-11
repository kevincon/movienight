var HOST = 'http://kevincon.github.com/movienight/';

var mn_player;
var mn_state;

function AppState() {
	this.playing = false;
	this.positionFresh = false; // Is position fresh?
	this.position = 0;
}

/* Callback for when video player's state changes. */
function playerStateChanged(newState) {
	switch (newState) {
		case 'PLAYING':
			console.log('Playing');
			if (!mn_state.playing) {
				mn_state.playing = true;
				updateState();
			}
			break;
		case 'PAUSED':
			console.log('Paused');
			if (mn_state.playing) {
				mn_state.playing = false;
				updateState();
			}
			break;
	}
}

/* Callback for when video player is seeked. */
function playerSeekChanged(dummy) {
	var newPosition = mn_player.getPosition();
	console.log('Seeked to ' + newPosition);

	mn_state.position = newPosition;
	mn_state.positionFresh = true;

	updateState();
}

/* Initialize player, register callbacks */
function playerInit() {
	mn_player = projekktor('#player', {
						volume: 0.8,
						playerFlashMP4: HOST + 'jarisplayer.swf',
						playerFlashMP3: HOST + 'jarisplayer.swf'
					});
	mn_player.addListener('state', playerStateChanged);
	mn_player.addListener('seek', playerSeekChanged);
}

/* Force the video player to match the state in sharedState */
function playerUpdate() {
	if (mn_state.positionFresh) {
		mn_player.setPlayhead(mn_state.position);
		mn_state.positionFresh = false;
	}

	if (mn_state.playing) {
		mn_player.setPlay();
	} else {
		mn_player.setPause();
	}

}

/* Extract the AppState from the Google Hangout state */
function stateUpdated(event) {
	var rawState = gapi.hangout.data.getValue('AppState');
	if (rawState == undefined) {
		console.log('stateUpdated: State received from getValue was undefined.');
		return;
	}

	mn_state = jQuery.parseJSON(rawState);

	playerUpdate();
}

/* Update the Google Hangout state */
function updateState() {
	gapi.hangout.data.submitDelta({'AppState': JSON.stringify(mn_state)});
}

function init() {
	// When API is ready...                                                         
	gapi.hangout.onApiReady.add(
			function(eventObj) {
				if (eventObj.isApiReady) {
					document.getElementById('showParticipants')
						.style.visibility = 'visible';

					gapi.hangout.data.onStateChanged.add(stateUpdated);
					stateUpdated();
				}
			});
}

// Wait for gadget to load.                                                       
gadgets.util.registerOnLoadHandler(init);

$(document).ready(function() {
	playerInit();
});