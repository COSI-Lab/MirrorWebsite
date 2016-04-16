var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');

gulp.task('sass', function() {
  return gulp.src("./scss/main.scss")
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest("./css"));
});

gulp.task('pug', function() {
  return gulp.src("./pug/*.pug")
    .pipe(pug({pretty: true}))
    .pipe(gulp.dest("./"));
});

gulp.task('watch', function() {
	gulp.watch(['./scss/*.scss', './scss/**/*.scss'], ['sass']);
	gulp.watch('./pug/*.pug', ['pug']);
});
