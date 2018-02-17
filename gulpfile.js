var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    ignore     = require('gulp-ignore'),
    uglify     = require('gulp-uglify');

gulp.task('default', function(){
    gulp.src(['lib/promise.min.js', 'dist/sprestlib.js'])
        .pipe(concat('sprestlib.bundle.js'))
        .pipe(sourcemaps.init())
        .pipe(ignore.exclude(["**/*.map"]))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['lib/jquery.min.js', 'lib/promise.min.js', 'dist/sprestlib.js', 'dist/sprestlib-ui.js'])
        .pipe(concat('sprestlib-ui.bundle.js'))
        .pipe(sourcemaps.init())
        .pipe(ignore.exclude(["**/*.map"]))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['dist/sprestlib.js'])
        .pipe(concat('sprestlib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
