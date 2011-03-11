Titanium.include('helpers/Cache.js');

var window = Titanium.UI.createWindow({
	backgroundColor: '#fff',
	title: 'CacheManager',
	layout: 'vertical',
	fullscreen: false,
	exitOnClose: true
});
var group = Titanium.UI.iPhone.createNavigationGroup({ window: window });

var activity = Titanium.UI.createActivityIndicator({
	width: 40,
	height: 40,
	message: Titanium.Platform.osname == 'android' ? 'Loading...' : '',
	style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

var showTweets = function ( data ) {
	activity.hide();
	var child = Titanium.UI.createWindow({
		backgroundColor: '#fff',
		backButtonTitle: 'Back',
		title: 'Tweets',
		url: 'tweets.js',
		tweets: JSON.parse(''+data).results
	});
	if ( Titanium.Platform.osname == 'android' ) {
		child.fullscreen = true;
		child.open();
	} else {
		group.open(child);
	}
};

var btn = Titanium.UI.createButton({
	width: 200,
	height: 50,
	top: 140,
	title: 'Load with TTL = 0'
});
btn.addEventListener('click', function() {
	activity.show();
	Cache.get({
		url: 'http://search.twitter.com/search.json',
		data: { q: '_dhaya_', rpp: 10 },
		ttl: 0,
		callback: function ( result ) {
			showTweets(result);
		}
	});
});
window.add(btn);

window.add(activity);

var btn2 = Titanium.UI.createButton({
	width: 200,
	height: 50,
	title: 'Load with DEFAULT_TTL'
});
btn2.addEventListener('click', function() {
	activity.show();
	Cache.get({
		url: 'http://search.twitter.com/search.json',
		data: 'q=Titanium',
		callback: showTweets
	});
});
window.add(btn2);

if (Titanium.Platform.osname == 'android') {
	window.open();
} else {
	var container = Titanium.UI.createWindow();
	container.add(group);
	container.open();
}
