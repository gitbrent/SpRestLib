/*
 * DESC: Combine/Minify CSS and take existing min JavaScript - replace head tags with content
 * WHY.: Google PageSpeed Insights scores of 99(mobile)/94(desktop) thats why!!
 */
var fs       = require('fs'),
    gulp     = require('gulp'),
    concat   = require('gulp-concat'),
    replace  = require('gulp-string-replace'),
	cleanCSS = require('gulp-clean-css');

var cssSrch1 = '<link rel="stylesheet" href="/SpRestLib/css/main.css"/>';
var cssSrch2 = '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/hybrid.min.css"/>';
var jvsSrch1 = /\<script type="text\/javascript" src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/highlight.*.min.js"\>\<\/script\>/;

/* ========== */
var arrDeployTasks = ['deploy-blog','deploy-css','deploy-help','deploy-html','deploy-img','deploy-index','deploy-sitemap'];

gulp.task('deploy-blog', ()=>{
	return gulp.src('./build/SpRestLib/blog/**').pipe(gulp.dest('../blog/'));
});

gulp.task('deploy-css', ()=>{
	return gulp.src('./build/SpRestLib/css/*.css').pipe(gulp.dest('../css/'));
});

gulp.task('deploy-html', ()=>{
	return gulp.src('./build/SpRestLib/docs/*.html').pipe(gulp.dest('../docs/'));
});

gulp.task('deploy-index', ()=>{
	return gulp.src('../index.perf.html', {base:'./'}).pipe(gulp.dest('../index.html'));
});

gulp.task('deploy-img', ()=>{
	return gulp.src('./build/SpRestLib/img/*.*').pipe(gulp.dest('../img/'));
});

gulp.task('deploy-help', ()=>{
	return gulp.src('./build/SpRestLib/help.html').pipe(gulp.dest('../'));
});

gulp.task('deploy-sitemap', ()=>{
	return gulp.src('./build/SpRestLib/sitemap.xml').pipe(gulp.dest('../'));
});

gulp.task('deploy', arrDeployTasks, ()=>{
	console.log('Deploy tasks run:'+ arrDeployTasks.length );
	console.log('DONE!');
});

/* ========== */
gulp.task('min-css', function(){
	// STEP 1: Inline both css files
	return gulp.src(['../css/hybrid.min.css', './build/SpRestLib/css/main.css'])
		.pipe(concat('style.bundle.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('../css'))
		.pipe(gulp.src('../css/style.bundle.css'));
});

gulp.task('default', ['min-css'], ()=>{
	// STEP 2: Grab newly combined styles
	var strMinCss = fs.readFileSync('../css/style.bundle.css', 'utf8');
	var strMinJvs = fs.readFileSync('../js/highlight.min.js', 'utf8');
	//console.log('>> `style.bundle.css` lines = '+ strMinCss.split('\n').length);
	//console.log('>> `highlight.min.js` lines = '+ strMinJvs.split('\n').length);

	// STEP 3: Replace head tags with inline style/javascript
	gulp.src('build/SpRestLib/index.html')
	.pipe(replace(cssSrch1, '', {logs:{ enabled:true }}))
	.pipe(replace(cssSrch2, '\n<style>'+ strMinCss +'</style>\n', {logs:{ enabled:false }}))
	.pipe(replace(jvsSrch1, '<script>'+ strMinJvs +'</script>\n', {logs:{ enabled:false }}))
	.pipe(concat('index.perf.html'))
	.pipe(gulp.dest('../'));
});
