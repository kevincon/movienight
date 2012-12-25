var HOST = 'https://s3.amazonaws.com/mn_movienight/';
var DEBUG_ENABLED = true;

var mn_player;
var mn_state;
var mn_reporter;

function AppState() {
    this.playing = true;
    this.position = 0;
    this.url = '';
}

function mn_debug(msg) {
    if (DEBUG_ENABLED) {
        console.log(msg);
    }
}

/* Callback for when player starts playing. */
function playerStartedPlaying() {
    mn_debug('Set to play.');
    if (mn_state.playing === true) {
        mn_debug('Already playing, ignoring event.');
        return;
    }

    mn_state.playing = true;
    mn_state.position = mn_player.currentTime();
    updateState();
}

/* Callback for when player is paused. */
function playerWasPaused() {
    mn_debug('Set to pause.');
    if (mn_state.playing === false) {
        mn_debug('Already paused, ignoring event.');
        return;
    }

    mn_state.playing = false;
    mn_state.position = mn_player.currentTime();
    updateState();
}

function onPlayerWaiting() {
    mn_debug('onPlayerWaiting: fired');
}

function onSetSource(event) {
    mn_debug('onSetSource: new source = ' + event.target.value);
    var link = event.target.value;
    mn_player.src(link);
    mn_state.url = link;
    mn_state.position = 0;
    mn_state.playing = true;
    updateState();
}

function onUserLeave(event) {
    if( gapi.hangout.getParticipantById(mn_reporter) === null ) {
        mn_reporter = undefined;
    }
}

function isTimeFresh(position) {
    return Math.abs(mn_state.position - position) > 3.5;
}

function selectReporter() {
    var participants = gapi.hangout.getEnabledParticipants();
    if(participants.length > 0) {
        mn_reporter = participants[0].id;
    }
}
function onPlayerTimeUpdated() {
    if(mn_reporter === undefined) {
        selectReporter();
    }
    if(mn_reporter === gapi.hangout.getLocalParticipantId()) {
        var position = mn_player.currentTime();
        if( isTimeFresh(position) ) {
            mn_state.position = position;
            updateState();
        }
    }
}

function onPlayerLoadedData() {
    if (mn_state === undefined) {
        mn_player.addEvent('play', playerStartedPlaying);
        mn_player.addEvent('pause', playerWasPaused);
        //mn_player.addEvent('timeupdate', playerWasSeeked);
        mn_player.addEvent('waiting', onPlayerWaiting);
        mn_player.addEvent('ended', playerWasPaused);
        mn_player.addEvent('timeupdate', onPlayerTimeUpdated);
        initState();
    }
}



function initState() {
    stateUpdated(null);
    if (mn_state === undefined) {
        mn_state = new AppState();
        updateState();
    }

    gapi.hangout.data.onStateChanged.add(stateUpdated);
    gapi.hangout.onParticipantsDisabled.add(onUserLeave);
}

/* Callback for when player is seeked. */
/*
 function playerWasSeeked(e, api) {
 if (mn_state.positionFresh) {
 mn_debug('playerWasSeeked: positionFresh was true, returning.');
 return;
 }
 var newPosition = mn_player.video.time;
 if (newPosition === undefined) {
 mn_debug('playerWasSeeked: newPosition was undefined');
 return;
 }
 mn_debug('Seeked to ' + newPosition);

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
    mn_debug('playerUpdate: src = ' + mn_player.values.src);
    if (mn_player.values.src !== mn_state.url && mn_state.url !== '') {
        mn_player.src(mn_state.url);
        stateUpdated(null);
    }

    mn_debug('playerUpdate: Seeking to ' + mn_state.position + '.');
    if( isTimeFresh(mn_player.currentTime()) ) {
        mn_player.currentTime(mn_state.position);
    }

    if (mn_state.playing && mn_player.paused) {
        mn_debug('playerUpdate: Setting to play.');
        mn_player.play();
    } else {
        mn_debug('playerUpdate: Setting to pause.');
        mn_player.pause();
    }
}

/* Extract the AppState from the Google Hangout state */
function stateUpdated(event) {
    var rawState = gapi.hangout.data.getValue('AppState');
    if (rawState === undefined) {
        mn_debug('stateUpdated: State received from getValue was undefined.');
        return;
    }

    mn_debug('stateUpdated: Copying updated Google Hangout state to local copy.');
    mn_state = JSON.parse(rawState);

    playerUpdate();
}

/* Update the Google Hangout state */
function updateState() {
    var stateString = JSON.stringify(mn_state);
    mn_debug('updateState: Updating Google Hangout state.');
    gapi.hangout.data.submitDelta({'AppState': stateString});
    mn_debug('Dump of App State:');
    mn_debug(stateString);
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

    $('#db-chooser').bind("DbxChooserSuccess", onSetSource);
});