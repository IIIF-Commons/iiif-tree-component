var c = require('../gulpfile.config');
var config = new c();
var gulp = require('gulp');
var utils = require('gulp-utils');

gulp.task('copy:bundle', function() {
    return gulp.src(config.dist + '/' + config.jsBundleOut).pipe(gulp.dest(config.testDepsDir));
});

gulp.task('copy:typings', function() {
    return gulp.src(config.typings).pipe(gulp.dest(config.typingsDir));
});