var gulp = require('gulp');
var clean = require('gulp-clean');
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

var src;
var dist;
var suffix;

var errorHandler = function (error) {
	console.error(error.message);
	this.emit('end');
};

var plumberOption = {
	errorHandler: errorHandler
};

var serverMappingPc = {
	baseDir: './dist/html/',
	routes: {
		"/css": "./dist/css",
		"/font": "./dist/font",
		"/images": "./dist/images",
		"/js": "./dist/js"
	}
};

var serverMappingMobile = {
	baseDir: './distMobile/html/',
	routes: {
		"/css": "./distMobile/css",
		"/images": "./distMobile/images",
		"/js": "./dist/js"
	}
};

// dist 폴더를 기준으로 웹서버 실행 / PC
gulp.task('serverPc', function() {
	return browserSync.init({
		server: serverMappingPc
	});
});

// dist 폴더를 기준으로 웹서버 실행 / Mobile
gulp.task('serverMobile', function() {
	return browserSync.init({
		server: serverMappingMobile
	});
});

// 미리보기용 HTML 파일 build
gulp.task('minifyhtml', function() {
	return gulp.src([src+'/**/*.html', '!'+src+'/html/_template/*.html'])
		.pipe(plumber(plumberOption)) // 빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
		.pipe(newer(dist)) // dist에 있는 결과물보다 새로운 파일만 다음 단계로 진행
		.pipe(htmlExtend({annotations: true, verbose: false})) 
		.pipe(replace('main'+suffix+'.js', 'main'+suffix+'-preview.js'))
		/*.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))*/
		.pipe(gulp.dest(dist))
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
                },
				// jQuery-ui 번들링 설정 : 사용하는 widget 만 번들링에 추가
				'jquery-ui': {
					'main': [
								'ui/core.js', 'ui/widget.js', 'ui/mouse.js',		// UI Core
								'ui/datepicker.js', 'ui/i18n/datepicker-ko.js',		// Widgets datePicker, i18n-ko - dependencies( core / widget )
								'ui/slider.js'										// Widgets slider - dependencies( core / widget / mouse )
					],
					'dependencies': {}
				},
				// jQuery-outside-events : 접근성 처리용 Plugin, 비활성화 영역에서 발생되는 이벤트 체크
				// 정상적으로 번들링되지 않아( 해당 components 에 bower.json 이 없는 문제로 추측 ) 강제 overrides 설정 추가
				'jquery-outside-events': {
					'main' : ['jquery.ba-outside-events.js'],
					'dependencies': {}
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
	return browserify({entries: ['src/js/main'+suffix+'.js'], debug: false})
		.bundle() // browserify로 번들링
		.on('error', errorHandler) // browserify bundling 과정에서 오류가 날 경우 gulp가 죽지않도록 예외처리
		.pipe(source('main'+suffix+'-preview.js')) // vinyl object 로 변환
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
	return gulp.src(src+'/images/**')
		.pipe(gulp.dest(dist+'/images'))
		.pipe(browserSync.reload({stream: true}));
});

/**
 * 폰트 파일 복사 (PC Only)
 */
gulp.task('fontPass', function() {
	return gulp.src('src/font/**')
		.pipe(gulp.dest('dist/font'))
		.pipe(browserSync.reload({stream: true}));
});

// CSS 파일을 minify
gulp.task('minifycss', function() {
	return gulp.src(src+'/**/*.css')
		.pipe(plumber(plumberOption))
		.pipe(sourcemaps.init({loadMaps: false, debug: false}))
		.pipe(cached('css'))
		.pipe(cssnano())
		.pipe(remember('css'))
		.pipe(concat('main.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist+'/css'))
		.pipe(browserSync.reload({stream: true}));
});

// 파일 변경 감지 / 모바일 
gulp.task('watchMobile', function() {
	gulp.watch('bower_components/**/*.js', ['bowerBundle']);
	gulp.watch('src/**/*.js', ['jsBundlePreview']);
	gulp.watch('srcMobile/**/*.css', ['minifycss']);
	gulp.watch('srcMobile/**/*.html', ['minifyhtml']);
	gulp.watch('srcMobile/images/*', ['imagePass']);
});

// 파일 변경 감지 / PC
gulp.task('watchPc', function() {
	gulp.watch('bower_components/**/*.js', ['bowerBundle']);
	gulp.watch('src/**/*.js', ['jsBundlePreview']);
	gulp.watch('src/**/*.css', ['minifycss']);
	gulp.watch('src/**/*.html', ['minifyhtml']);
	gulp.watch('src/images/*', ['imagePass']);
	gulp.watch('src/font/*', ['fontPass']);
});

gulp.task('clean', function () {
	return gulp.src(dist+'/*')
	.pipe(clean());
});

// 모바일 빌드
gulp.task('buildMoblie', ['jsBundlePreview', 'bowerBundle', 'minifycss', 'minifyhtml', 'imagePass']);
gulp.task('mobile', function (done) {
	src = 'srcMobile';
	dist = 'distMobile';
	suffix = '-m';
	
	return runSequence('clean', 'buildMoblie', ['serverMobile', 'watchMobile'], done);
});

// PC 빌드
gulp.task('buildPc', ['jsBundlePreview', 'bowerBundle', 'fontPass', 'minifycss', 'minifyhtml', 'imagePass']);
gulp.task('pc', function (done) {
	src = 'src';
	dist = 'dist';
	suffix = '';
	
	return runSequence('clean', 'buildPc', ['serverPc', 'watchPc'], done);
});
