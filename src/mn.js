var HOST = 'http://static.kevintechnology.com/mn/';

var mn_player;
var mn_state;

function AppState() {
	this.playing = false;
	//this.positionFresh = false; // Is position fresh?
	this.position = 0;
}

/* Callback for when player starts playing. */
function playerStartedPlaying() {
	console.log('Set to play.');
	if (mn_state.playing === true) {
		console.log('Already playing, ignoring event.');
		return;
	}

	mn_state.playing = true;
	var position = mn_player.currentTime();
	mn_state.position = position;
	//mn_state.positionFresh = true;
	updateState();
	//mn_state.positionFresh = false;
}

/* Callback for when player is paused. */
function playerWasPaused() {
	console.log('Set to pause.');
	if (mn_state.playing === false) {
		console.log('Already paused, ignoring event.');
		return;
	}

	mn_state.playing = false;
	var position = mn_player.currentTime();
	mn_state.position = position;
	//mn_state.positionFresh = true;
	updateState();
	//mn_state.positionFresh = false;
}

function onPlayerWaiting() {
	console.log('onPlayerWaiting: fired');
}

function onPlayerLoadedData() {
	if (mn_state === undefined) {
		mn_player.addEvent('play', playerStartedPlaying);
		mn_player.addEvent('pause', playerWasPaused);
		//mn_player.addEvent('timeupdate', playerWasSeeked);
		mn_player.addEvent('waiting', onPlayerWaiting);
		mn_player.addEvent('ended', playerWasPaused);
		initState();
	}
}

function initState() {
	stateUpdated();
	if (mn_state === undefined) {
		mn_state = new AppState();
		updateState();
	}
	gapi.hangout.data.onStateChanged.add(stateUpdated);
}

/* Callback for when player is seeked. */
/*
function playerWasSeeked(e, api) {
	if (mn_state.positionFresh) {
		console.log('playerWasSeeked: positionFresh was true, returning.');
		return;
	}
	var newPosition = mn_player.video.time;
	if (newPosition === undefined) {
		console.log('playerWasSeeked: newPosition was undefined');
		return;
	}
	console.log('Seeked to ' + newPosition);

	mn_state.position = newPosition;
	mn_state.positionFresh = true;

	updateState();

	mn_state.positionFresh = false;
}
*/

/* Initialize player, register callbacks */
function playerInit() {

	mn_player = _V_('mn_player');
	mn_player.addEvent('loadeddata', onPlayerLoadedData);
}

/* Force the video player to match the state in sharedState */
function playerUpdate() {
	/*
	if (mn_state.positionFresh) {
		console.log('playerUpdate: Seeking to ' + mn_state.position + '.');
		mn_player.currentTime(mn_state.position);
		mn_state.positionFresh = false;
	}
	*/

	console.log('playerUpdate: Seeking to ' + mn_state.position + '.');
	mn_player.currentTime(mn_state.position);

	if (mn_state.playing && mn_player.paused) {
		console.log('playerUpdate: Setting to play.');
		mn_player.play();
	} else {
		console.log('playerUpdate: Setting to pause.');
		mn_player.pause();
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
					_V_("mn_player", {}, function(){
						// Player (this) is initialized and ready.
						playerInit();
					});
				}
			});
}



$(document).ready(function() {
	_V_.options.flash.swf = HOST + 'flash/video-js.swf';

	init();
});
