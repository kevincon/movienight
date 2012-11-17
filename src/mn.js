var HOST = 'http://kevincon.github.com/movienight/';

var mn_player;
var mn_state;

function AppState() {
	this.playing = false;
	this.positionFresh = false; // Is position fresh?
	this.position = 0;
}

/* Callback for when player starts playing. */
function playerStartedPlaying(event) {
	console.log('Set to play.');
	if (mn_state.playing === true) {
		console.log('Already playing, ignoring event.');
		return;
	}

	mn_state.playing = true;
	mn_state.position = mn_player.getPosition();
	mn_state.positionFresh = true;

	updateState();

	mn_state.positionFresh = false;
}

/* Callback for when player is paused. */
function playerWasPaused(event) {
	console.log('Set to pause.');
	if (mn_state.playing === false) {
		console.log('Already paused, ignoring event.');
		return;
	}

	mn_state.playing = false;
	mn_state.position = mn_player.getPosition();
	mn_state.positionFresh = true;

	updateState();

	mn_state.positionFresh = false;
}

/* Callback for when player is seeked. */
function playerWasSeeked(event) {
	if (mn_state.positionFresh) {
		console.log('playerWasSeeked: positionFresh was true, returning.');
		return;
	}
	var newPosition = event.position + event.offset;
	console.log('Seeked to ' + newPosition);

	mn_state.position = newPosition;
	mn_state.positionFresh = true;

	updateState();

	mn_state.positionFresh = false;
}

/* Initialize player, register callbacks */
function playerInit() {
	jwplayer('mn_player').setup({
		flashplayer: HOST + 'flash/jwplayer.flash.swf',
		file: HOST + 'media/shark.ogv',
		height: 360,
		width: 640
	});

	mn_player = jwplayer('mn_player');
	mn_player.onPlay(playerStartedPlaying);
	mn_player.onPause(playerWasPaused);
	mn_player.onSeek(playerWasSeeked);
	mn_player.onIdle(playerWasPaused);

	// Wait for jwplayer to load before updating state.
	mn_player.onReady(stateUpdated);

	mn_state = new AppState();
}

/* Force the video player to match the state in sharedState */
function playerUpdate() {
	if (mn_state.positionFresh) {
		console.log('playerUpdate: Seeking to ' + mn_state.position + '.');
		mn_player.seek(mn_state.position);
		mn_state.positionFresh = false;
	}

	if (mn_state.playing) {
		console.log('playerUpdate: Setting to play.');
		mn_player.play(true);
	} else {
		console.log('playerUpdate: Setting to pause.');
		mn_player.pause(true);
	}
}

/* Extract the AppState from the Google Hangout state */
function stateUpdated(event) {
	var rawState = gapi.hangout.data.getValue('AppState');
	if (rawState === undefined) {
		console.log('stateUpdated: State received from getValue was undefined.');
		return;
	}

	console.log('stateUpdated: Copying updated Google Hangout state to local copy.');
	mn_state = JSON.parse(rawState);

	playerUpdate();
}

/* Update the Google Hangout state */
function updateState() {
	var stateString = JSON.stringify(mn_state);
	console.log('updateState: Updating Google Hangout state.');
	gapi.hangout.data.submitDelta({'AppState': stateString});
	console.log('Dump of App State:');
	console.log(stateString);
}

function init() {
	// When API is ready...
	gapi.hangout.onApiReady.add(
			function(eventObj) {
				if (eventObj.isApiReady) {
					gapi.hangout.data.onStateChanged.add(stateUpdated);
				}
			});
}

$(document).ready(function() {
	// Wait for gadget to load.
	gadgets.util.registerOnLoadHandler(init);

	// Initialize player.
	playerInit();
});
