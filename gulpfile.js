var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');

gulp.task('sass', function() {
  return gulp.src("./scss/main.scss")
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest("./css"));
});

gulp.task('jade', function() {
  return gulp.src("./*.jade")
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest("./"));
});

gulp.task('watch', function() {
	gulp.watch(['./scss/*.scss', './sass/**/*.scss'], ['sass']);
	gulp.watch('./*.jade', ['jade']);
});
