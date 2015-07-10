var express = require('express'),
	bodyParser = require('body-parser'),
	config = require('./config.js'),
	request = require('request'),
	page = require('./page-search.js'),
	arr2csv = require('./array-to-csv.js'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	app = express(),
	jsonParser = bodyParser.json({ limit: '50mb' });

app.use(express.static('client'));

app.get('/', function (req, res) {
	res.sendFile('client/index.html');
});

app.post('/api/search/', jsonParser, function (req, res) {
	var term = req.body.term;
	var token = req.body.token;
	var paging_token = req.body.paging_token;
	var p = page();
	
	if (!paging_token) {
		paging_token = null;
	}

	p.init(config().app_id, config().app_secret, token);
	p.search(term, paging_token, function (result) {
		res.send(result);
	});
});

app.post('/api/save', jsonParser, function (req, res) {
	console.log('creating CSV');
	var header = ['ID', 'Page Name', 'Likes', 'Last Post'];
	var csv = arr2csv().fromObject(req.body).addHeader(header).toCsv(true);
	mkdirp('./.tmp');
	fs.writeFileSync('./.tmp/results.csv', csv);
	console.log('CSV created');
	res.send({ message: 'success' });
});

app.get('/api/download', function (req, res) {
	console.log('download request');
	res.setHeader('Content-disposition', 'attachment; filename=results.csv');
	res.setHeader('Content-Type', 'text/csv');
	res.download('./.tmp/results.csv');
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});