var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    ignore     = require('gulp-ignore'),
	insert     = require('gulp-insert'),
	sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    fs         = require('fs');

gulp.task('default', function(){
	var APP_VER = "", APP_BLD = "";
	fs.readFileSync("dist/sprestlib.js", "utf8").split('\n')
	.forEach((line)=>{
		if ( line.indexOf('var APP_VER') > -1 ) APP_VER = line.split('=')[1].trim().replace(/\"+|\;+/gi,'');
		if ( line.indexOf('var APP_BLD') > -1 ) APP_BLD = line.split('=')[1].trim().replace(/\"+|\;+/gi,'');
	});

    gulp.src(['lib/promise.min.js', 'dist/sprestlib.js'])
        .pipe(concat('sprestlib.bundle.js'))
		.pipe(uglify())
		.pipe(insert.prepend('/* SpRestLib '+APP_VER+'-'+APP_BLD+' */\n'))
        .pipe(sourcemaps.init())
        .pipe(ignore.exclude(["**/*.map"]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['lib/promise.min.js', 'dist/sprestlib.js', 'lib/jquery.min.js', 'dist/sprestlib-ui.js'])
        .pipe(concat('sprestlib-ui.bundle.js'))
		.pipe(uglify())
		.pipe(insert.prepend('/* SpRestLib '+APP_VER+'-'+APP_BLD+' */\n'))
        .pipe(sourcemaps.init())
        .pipe(ignore.exclude(["**/*.map"]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['dist/sprestlib.js'])
        .pipe(concat('sprestlib.min.js'))
        .pipe(uglify())
        .pipe(insert.prepend('/* SpRestLib '+APP_VER+'-'+APP_BLD+' */\n'))
        .pipe(gulp.dest('dist'));
});
