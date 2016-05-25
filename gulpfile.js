var concat = require('gulp-concat');
var config = require(process.cwd() + '/gulpfile.config');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge2');
var runSequence = require('run-sequence');
var ts = require('gulp-typescript');
var webpack = require('webpack-stream');

gulp.task('clean:dist', function (cb) {
    del([
        config.dist + '/*'
    ], cb);
});

gulp.task('build', function() {
    var result = gulp.src(config.tsSrc)
        .pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
            noLib: false,
            module: 'commonjs',
            sortOutput: true
        }));

    return merge([
        result.dts
            .pipe(concat(config.dtsOut))
            .pipe(gulp.dest(config.dist))//,
        // result.js
        //     .pipe(webpack(require('./webpack.config.js')))
        //     .pipe(concat(config.jsOut))
        //     .pipe(gulp.dest(config.dist))
    ]);
});

gulp.task('webpack', function() {
    var result = webpack(require('./webpack.config.js'))
            .pipe(concat(config.jsOut))
            .pipe(gulp.dest(config.dist));
            
    return merge([
        result.dts
            .pipe(concat(config.dtsOut))
            .pipe(gulp.dest(config.dist)),
        result.js
            .pipe(concat(config.jsOut))
            .pipe(gulp.dest(config.dist))
    ]);
});

gulp.task('default', function(cb) {
    runSequence('webpack', cb);
});