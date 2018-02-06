var fs      = require('fs'),
	gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    replace = require('gulp-string-replace'),
    uglify  = require('gulp-uglify');

var cssSrch1 = /\<link rel=\"stylesheet\" href=\"\/SpRestLib\/css\/main\.css\"\/\>/;
var cssSrch2 = '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/hybrid.min.css"/>';
// <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>

gulp.task('default', function(){
	// STEP 1:
	gulp.src(['../css/hybrid.min.css', './build/SpRestLib/css/main.css'])
	.pipe(concat('style.bundle.css'))
	.pipe(gulp.dest('../css'));

	// STEP 2:
	var contents = fs.readFileSync('../css/style.bundle.css', 'utf8');

	// STEP 3:
	gulp.src('build/SpRestLib/index.html')
	.pipe(replace(cssSrch1, '\n<style>'+contents+'</style>\n'))
	.pipe(concat('index.perf.html'))
	.pipe(gulp.dest('../'));
});
