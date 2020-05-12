/**
 * Gulpfile v4 starter
 */

'use strict'

// Engine
const { src, dest, series, parallel, watch } = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const rsync = require('gulp-rsync');

// Styles preprocessors
const sass = require('gulp-sass');
const scss = require('gulp-sass');
const less = require('gulp-less');
const stylus = require('gulp-stylus');

// Assets plugins
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const cleancss = require('gulp-clean-css');

// Config
const config = {
  projectName: 'Your project',
  localhost: 'local.host',
  filesWatch: 'html, htm, php, yaml, twig, json',
  srcFolder: './src/',
  buildFolder: './build/',
  assetsFolder: 'assets/',
  scripts: {
    srcFile: 'index.js',
    outputFile: 'bundle.js',
    srcFolder: 'js',
    outputFolder: 'js'
  },
  styles: {
    preprocessor: 'scss',
    outputFolder: 'css'
  }
}

function browsersync () {
  browserSync.init({
    proxy: config.localhost,
    // server: {
    //   baseDir: 'build',
    //   index: 'index.html'
    // },
    port: 3000,
    online: false,
    open: false,
    cors: false,
    notify: false,
    logLevel: 'info',
    logPrefix: config.projectName,
    logConnections: false,
    logFileChanges: true
  })
}

function scripts () {
  return browserify({
    entries: config.srcFolder + config.scripts.srcFile,
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source(config.scripts.srcFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest(config.buildFolder + config.scripts.outputFolder))
    .pipe(browserSync.stream())
}

function styles () {
  return src(config.srcFolder + config.assetsFolder + config.styles.preprocessor + '/*.' + config.styles.preprocessor)
    .pipe(sourcemaps.init())
    .pipe(eval(config.styles.preprocessor)())
    .pipe(rename({
      suffix: '.min',
      prefix: ''
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(cleancss({
      level: { 1: { specialComments: 1 } }
    }))
    .pipe(sourcemaps.write())
    .pipe(dest(config.buildFolder + config.styles.outputFolder))
    .pipe(browserSync.stream())
}

// function deploy() {
// 	return src('/')
// 	.pipe(rsync({
// 		root: '/',
// 		hostname: 'username@yousite.com',
// 		destination: 'yousite/public_html/',
// 		// include: ['*.htaccess'], // Included files
// 		exclude: ['**/Thumbs.db', '**/*.DS_Store', '**/*.sqlite'], // Excluded files
// 		recursive: true,
// 		archive: true,
// 		silent: false,
// 		compress: true
// 	}))
// }

function startwatch () {
  watch([
    config.srcFolder  + config.assetsFolder + config.scripts.srcFolder + '/**/*.js',
    config.srcFolder + '*.js'
  ], parallel(scripts));
  watch(config.srcFolder + config.assetsFolder + config.styles.preprocessor + '/**/*.' + config.styles.preprocessor, parallel(styles));
  watch(config.buildFolder + '**/*.{' + config.filesWatch + '}').on('change', browserSync.reload);
}

exports.scripts = scripts;
exports.styles = styles;
exports.browsersync = browsersync;
// exports.deploy = deploy;
exports.default = parallel(scripts, styles, browsersync, startwatch);
