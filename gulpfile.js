// gulpfile.js
const gulp  = require('gulp'),
    browserSync = require('browser-sync').create(),
    htmlmin = require('gulp-htmlmin'),
    nunjucksRender = require('gulp-nunjucks-render');
    image = require('gulp-image');

var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var php  = require('gulp-connect-php');

const PATHS = {
    output: 'dist',
    templates: 'src/templates',
    pages: 'src/pages',
    styles: 'src/sass',
    css: 'src/css',
    fonts: 'src/fonts',
    img: 'src/images',
    fonts: 'src/fonts',
	php: 'src/php'
}


gulp.task('phpServer', function() {
    php.server({ base: PATHS.output, port: 8010, keepalive: true});
});

gulp.task('php', function () {
  gulp.src(PATHS.php + '/*.php')
    .pipe(gulp.dest(PATHS.output + '/php'));
});

gulp.task('image', function () {
  gulp.src(PATHS.img + '/**')
    .pipe(image())
    .pipe(gulp.dest(PATHS.output + '/images'));
});


gulp.task('minify-css', function() {
  console.log('Minifying CSS files..');
  return gulp.src(PATHS.css + '/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest( PATHS.output + '/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass', function () {
  console.log('Rendering SASS files..');
  return gulp.src(PATHS.styles + '/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(PATHS.output + '/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('nunjucks', function() {
    console.log('Rendering nunjucks files..');
    return gulp.src(PATHS.pages + '/**/*.+(html|js|css|php)')
        .pipe(nunjucksRender({
          path: [PATHS.templates],
          watch: true,
        }))
        .pipe(gulp.dest(PATHS.output))
        .pipe(browserSync.reload({
          stream: true
        }));
});

gulp.task('browserSync',['phpServer'], function() {
    browserSync.init({
        server: {
			proxy: '127.0.0.1:8010',
	        port: 8080,
	        open: true,
	        notify: false,
            baseDir: PATHS.output
        },
    });
});

gulp.task('fonts', function() {
  console.log('Moving fonts...');
  return gulp.src(PATHS.fonts + '/**/*')
  .pipe(gulp.dest('dist/fonts'))
})


gulp.task('watch',['nunjucks', 'browserSync', 'sass', 'minify-css'], function() {
    gulp.watch([PATHS.pages + '/**/*.+(html|js|css)', PATHS.templates + '/**/*.+(html|js|css)'], ['nunjucks'])
    gulp.watch(PATHS.styles + '/*.scss', ['sass']);
    gulp.watch(PATHS.css + '/*.css', ['minify-css']);
});

gulp.task('minify', function() {
  return gulp.src(PATHS.output + '/*.html')
    .pipe(htmlmin({
        collapseWhitespace: true,
        cssmin: true,
        jsmin: true,
        removeOptionalTags: true,
        removeComments: true
    }))
    .pipe(gulp.dest(PATHS.output));
});

gulp.task('clean:dist', function() {
  return del.sync(PATHS.output);
})

// Build all
gulp.task('build', [`clean:dist`, `sass`, `minify-css`, `image`, `nunjucks`, 'fonts', 'minify'], function (){
  console.log('Building all files');
})
