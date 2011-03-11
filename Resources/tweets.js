var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView(),
	row, pic, tweet;

for ( var i = 0; i < win.tweets.length; i++ ) {
	row = Titanium.UI.createTableViewRow({ height: 'auto' });
	pic = Titanium.UI.createImageView({
		left: 10, top: 10,
		width: 50, height: 50,
		image: win.tweets[i].profile_image_url
	});
	row.add(pic);
	tweet = Titanium.UI.createLabel({
		left: pic.left + pic.width + 10, right: 10,
		top: 10, bottom: 10,
		height: 50,
		font: { fontSize: 14 },
		highlightedColor: '#fff',
		text: win.tweets[i].text,
		touchEnabled: false,
		className: 'item'
	});
	row.add(tweet);
	
	tableView.appendRow(row);
}

win.add(tableView);
