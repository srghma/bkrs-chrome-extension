chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.storage.local.get('state', function (data) {
		if ( typeof data.state === 'undefined' || data.state == 1 ) {
			chrome.storage.local.set({'state': '0'});
			chrome.browserAction.setIcon({path:'off.png'});
		}
		else {
			chrome.storage.local.set({'state': '1'});
			chrome.browserAction.setIcon({path:'on.png'});			
		}
	});
});


chrome.storage.local.get('state', function (data) {
	if ( typeof data.state === 'undefined' || data.state == 1 ) {
		chrome.browserAction.setIcon({path:'on.png'});
	}
	else {
		chrome.browserAction.setIcon({path:'off.png'});
	}
});