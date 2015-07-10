'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var fb = require('fbgraph');
var moment = require('moment');
var url = require('url');
var stop = false;
var request = require('request');
var dialog = require('dialog');
var fs = require('fs');

require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function () {
	app.quit();
});

app.on('ready', function () {
	var atomScreen = require('screen');
	var size = atomScreen.getPrimaryDisplay().workAreaSize;
	mainWindow = new BrowserWindow({ width: size.width, height: size.height });
	console.log('ok');

	mainWindow.openDevTools();

	mainWindow.loadUrl('file://' + __dirname + '/../browser/index.html');

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
});

var app_id = "866089033445020";
var app_secret = "3182a33698c5a60eb63b07fbeb399c46";
var access_token = "";
var oauth_window;

ipc.on('search', startSearch);
ipc.on('stop', function () {
	stop = true;
})

ipc.on('saveResults', function (e, results) {

	dialog.showSaveDialog(mainWindow, {
		title: "Save Results",
		filters: [{
			name: 'CSV',
			extensions: ['csv']
		}]
	}, function (filename) {
		
		var results_string = "Page Name, Page URL, Likes, Last Post\n";
		
		results.forEach(function (row) {
			
			if (!row.posts) {
				row.posts = {
					data: [{ created_time: '' }]
				}; 
			}
			
			results_string +=
			row.name + ',' +
			'https://facebook.com/' + row.id + ',' +
			row.likes + ',' +
			row.posts.data[0].created_time + '\n';
		});
		
		fs.writeFile(filename, results_string);
		
	});
})

ipc.on('saveApi', function (e, args) {
	oauth_window = new BrowserWindow({ width: 800, height: 600 });
	oauth_window.loadUrl(
		'https://www.facebook.com/dialog/oauth?' +
		'client_id=' + app_id +
		'&response_type=token' +
		'&redirect_uri=https://www.facebook.com/connect/login_success.html'
	);
	oauth_window.show();
	
	oauth_window.webContents.on('did-get-redirect-request', function (e, oldUrl, newUrl) {
		var elements = url.parse(newUrl, true);

		if (newUrl.indexOf('https://www.facebook.com/connect/login_success.html') > -1) {
			access_token = getToken(elements.hash);
			oauth_window.close();
		}
	});
})

function getToken(hash) {
	var all = hash.split('&');
	var token = all[0].split('=');
	return token[1];
}

function startSearch(e, args) {
	stop = false;
	search(e, args.term);
}

function search(e, term, next, count) {

	if (!stop) {
		if (!count) {
			count = 0;
		}

		if (count < 10) {
			var url = 'search?q=' + term + '&type=page&fields=id,name,likes,posts&access_token=' + access_token;

			if (next) {
				url += '&after=' + next;
				count++;
			}

			fb.get(url, function (err, res) {

				if (err) {
					console.log(err);
				} else {
					res.data.forEach(function (v, i) {
						if (res.data[i]) {
							if (v.posts) {
								res.data[i].likes = parseInt(v.likes);
								res.data[i].posts.data[0].created_time = moment(v.posts.data[0].created_time).format('MM/DD/YYYY hh:mm:ss A');
							}
						}
					});

					e.sender.send('results', res.data);

					if (res.paging) {
						search(e, term, res.paging.cursors.after, count);
					} else {
						e.sender.send('done');
					}
				}

			});

		} else {
			e.sender.send('done');
		}
	}
} 