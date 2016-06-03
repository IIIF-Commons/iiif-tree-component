var concat = require('gulp-concat');
var c = require('../gulpfile.config');
var config = new c();
var gulp = require('gulp');
var merge = require('merge2');

// combine the generated d.ts in ./dist with any other manually specified definitions in ./typings
gulp.task('concat:typings', function(cb) {
    return gulp.src([
            config.typingsDir + '/' + config.name + '.d.ts', 
            config.dist + '/' + config.name + '.d.ts'
        ])
        .pipe(concat(config.dtsOut))
        .pipe(gulp.dest(config.dist));
});