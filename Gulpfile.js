var gulp = require('gulp'),
	gls = require('gulp-live-server');
	
gulp.task('serve', function () {
	var server = gls.new('./server/app.js');
	server.start();
});
	
gulp.task('default', function () {
	
});