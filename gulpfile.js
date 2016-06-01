var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');
var sourcemaps  = require('gulp-sourcemaps');
var newer = require('gulp-newer');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var plumber = require('gulp-plumber');
var htmlExtend = require('gulp-html-extend');
var ext_replace = require('gulp-ext-replace');
var headerfooter = require('gulp-headerfooter');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var mainBowerFiles = require('gulp-main-bower-files');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');

var errorHandler = function (error) {
	console.error(error.message);
	this.emit('end');
};

var plumberOption = {
	errorHandler: errorHandler
};

// dist 폴더를 기준으로 웹서버 실행
gulp.task('server', function() {
	return browserSync.init({
		server: {
			baseDir: './distMobile/html/',
			routes: {
				"/css": "./distMobile/css",
				"/images": "./distMobile/images",
				"/js": "./dist/js"
			}
		}
	});
});

// 미리보기용 HTML 파일 build
gulp.task('minifyhtml', function() {
	return gulp.src(['srcMobile/**/*.html', '!srcMobile/html/_template/*.html'])
		.pipe(plumber(plumberOption)) // 빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
		.pipe(newer('distMobile')) // dist에 있는 결과물보다 새로운 파일만 다음 단계로 진행
		.pipe(htmlExtend({annotations: true, verbose: false})) 
		.pipe(replace('main-m.js', 'main-m-preview.js'))
		/*.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))*/
		.pipe(gulp.dest('distMobile'))
		.pipe(browserSync.reload({stream: true}));
});

// bower로 받은 js파일 번들링
gulp.task('bowerBundle', function() {
	var filterJS = gulpFilter('**/*.js', { restore: true });
	return gulp.src('bower.json')
		.pipe(mainBowerFiles({
            overrides: {
                "isotope": {
                    "main": ["dist/isotope.pkgd.js"],
					"dependencies": {}
                }
            }
        }))
		.pipe(filterJS)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(filterJS.restore)
        .pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({stream: true}));
});

// 자바스크립트 파일 번들링
gulp.task('jsBundlePreview', function() {
	return browserify({entries: ['src/js/main-m.js'], debug: false})
		.bundle() // browserify로 번들링
		.on('error', errorHandler) // browserify bundling 과정에서 오류가 날 경우 gulp가 죽지않도록 예외처리
		.pipe(source('main-m-preview.js')) // vinyl object 로 변환
		.pipe(buffer()) // buffered vinyl object 로 변환
		.pipe(plumber(plumberOption))
		.pipe(sourcemaps.init({loadMaps: false, debug: false})) // 소스맵 생성 준비
		/*.pipe(uglify())*/
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({stream: true}));
});

/**
 * 이미지 파일 복사
 */
gulp.task('imagePass', function() {
	return gulp.src('srcMobile/images/**')
		.pipe(gulp.dest('distMobile/images'))
		.pipe(browserSync.reload({stream: true}));
});

// CSS 파일을 minify
gulp.task('minifycss', function() {
	return gulp.src('srcMobile/**/*.css')
		.pipe(plumber(plumberOption))
		.pipe(sourcemaps.init({loadMaps: false, debug: false}))
		.pipe(cached('css'))
		/*.pipe(cssnano())*/
		.pipe(remember('css'))
		.pipe(concat('main.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('distMobile/css'))
		.pipe(browserSync.reload({stream: true}));
});

// 파일 변경 감지
gulp.task('watch', function() {
	gulp.watch('bower_components/**/*.js', ['bowerBundle']);
	gulp.watch('src/**/*.js', ['jsBundlePreview']);
	gulp.watch('srcMobile/**/*.css', ['minifycss']);
	gulp.watch('srcMobile/**/*.html', ['minifyhtml']);
	gulp.watch('srcMobile/images/*', ['imagePass']);
});

// 빌드
gulp.task('build', ['jsBundlePreview', 'bowerBundle', 'minifycss', 'minifyhtml', 'imagePass']);

// gulp를 실행하면 수행할 default 작업
gulp.task('default', function (done) {
	return runSequence('build', ['server', 'watch'], done);
});
