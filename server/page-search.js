var fb = require('fbgraph'),
	moment = require('moment');

module.exports = function () {

	var obj = {
		t: this,
		config: {
			app_id: '',
			app_secret: '',
			token: ''
		},

		init: function (app_id, app_secret, token) {
			this.config.app_id = app_id;
			this.config.app_secret = app_secret;
			this.config.token = token;
		},

		search: function (term, paging_token, callback) {
			console.log('Starting FB Page Search');
			var url = 'search?q=' + term + '&type=page&fields=id,name,likes,posts&access_token=' + this.config.token;

			if (paging_token) {
				url += '&after=' + paging_token;
			}

			fb.get(url, function (err, res) {
				console.log('Got a result!');

				if (err) {
					console.log(err);
					return err;
				} else {
					res.data.forEach(function (v, i) {
						if (res.data[i]) {
							if (v.posts) {
								res.data[i].likes = parseInt(v.likes);
								res.data[i].last_post = moment(v.posts.data[0].created_time).format('MM/DD/YYYY hh:mm:ss A');
								delete res.data[i].posts; 
							}
						}
					});

					if (typeof callback === 'function') {
						callback({
							results: res.data,
							paging_tokens: {
								before: res.paging.cursors.before,
								after: res.paging.cursors.after
							}
						})
					}
				}

			});
		}
	}

	return obj;
}