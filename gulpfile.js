'use strict';

var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('default', function(){
    return gutil.log('Gulp is running');
});

gulp.task('handleJs', function(){
  gulp.src('./build/js/*.js')
    .pipe(uglify())
    .pipe(minify())
    .pipe(gulp.dest('public/javascripts'));

});

gulp.watch('./build/js/*', ['handleJs']);