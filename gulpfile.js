var gulp = require('gulp'),
    gutil = require('gulp-util'), //让命令行输出的文字带颜色
    uglify = require('gulp-uglify'),// 获取 uglify 模块（用于压缩 JS）
    cssnano = require('gulp-cssnano'),  // 获取 minify-css 模块（用于压缩 CSS）这个是最新的
    imagemin = require('gulp-imagemin'),  // 获取 gulp-imagemin 模块
    sass = require('gulp-ruby-sass'),     // 获取 gulp-ruby-sass 模块
    rename = require('gulp-rename'),      //重命名
    concat = require('gulp-concat'),     //合并文件
    clean = require('gulp-clean'),        //清空文件夹
    htmlreplace = require('gulp-html-replace'), //输出的html 替换 css 与  js
    htmlBuilder = require('gulp-html-builder'),//对页面中引入的css文件和js文件进行合并并压缩到新文件 ,并替换
    stripDebug = require('gulp-strip-debug'); //清理DEBUG与console
var watchPath = require('gulp-watch-path'), //实际上我们只需要重新编译被修改的文件
    combiner = require('stream-combiner2'), //监听错误
    sourcemaps = require('gulp-sourcemaps'); //map调试
var babel = require('gulp-babel');

//刷新浏览器
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n');
    gutil.log(colors.red('Error!'));
    gutil.log('fileName: ' + colors.red(err.fileName));
    gutil.log('lineNumber: ' + colors.red(err.lineNumber));
    gutil.log('message: ' + err.message);
    gutil.log('plugin: ' + colors.yellow(err.plugin))
};


//一些公共的路径
var jsSRC = './src/assets/js/**/*.js',//js源代码库
    jsDEST = './dist/assets/js/';//js输出库


//清空输出目录
gulp.task('cleandist', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
})

// HTML-libs 简易处理
gulp.task('html-libs', function () {
    var htmlSrc = './src/**/*.html',
        htmlDst = './dist/';
    gulp.src(htmlSrc)
        //	.pipe(htmlreplace({'js':{
        //
        //	src: [['data-main.js', 'require-src.js']],
        //    tpl: '<script data-main="%s" src="%s"></script>'
        //	}
        //	})) //替换JS
        .pipe(gulp.dest(htmlDst))
    gulp.src(libsSRC)
        .pipe(gulp.dest(lisbDEST))
});
//合并压缩js
gulp.task('script', function () {
    // 1. 找到文件
    gulp.src(jsSRC)
        // 2. 压缩文件
        .pipe(uglify())
        // 3. 另存压缩后的文件
        .pipe(gulp.dest(jsDEST))
});


//合并压缩js
gulp.task('Bulidscript', function () {
    var jsSRC = './expert_pc/html/**/*.js',
        jsDEST = './expert_pc/html/';
    // 1. 找到文件
    gulp.src(jsSRC)
        // 2. 压缩文件
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        // 3. 另存压缩后的文件
        .pipe(gulp.dest(jsDEST))
});
//合并压缩vedor js
gulp.task('BulidscriptVedor', function () {
    var jsSRC = './pc_src/script/vedor/*.js',
        jsDEST = './pc_src/script/vedor/';
    // 1. 找到文件
    gulp.src(jsSRC)
        // 2. 压缩文件
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        // 3. 另存压缩后的文件
        .pipe(gulp.dest(jsDEST))
});


gulp.task('ClearConsole', function () {
    var jsSRC = './expert_pc/html/**/*.min.js',
        jsDEST = './expert_pc/html/';
    return gulp.src(jsSRC)
        .pipe(stripDebug())
        .pipe(gulp.dest(jsDEST));
});

// 编译sass
// 在命令行输入 gulp sass 启动此任务
gulp.task('sass', function () {
    var cssSrc = './src/sass/*.scss',
        cssSrca = './src/css';//源码也输出一份

    gulp.src(cssSrc)
    // .pipe(sass({ style: 'expanded'}))
    return sass(cssSrc, {style: 'expanded'})
        .pipe(gulp.dest(cssSrca))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())//精简
        .pipe(gulp.dest(cssSrca))
        .on('error', function (err) {
            console.error('Error!', err.message);
        });

});


// 编译sass
// 在命令行输入 gulp sass 启动此任务
gulp.task('BulidPCsass', function () {
    var cssSrc = './expert_pc/sass/*.scss',
        cssSrca = './expert_pc/css';//源码也输出一份

    gulp.src(cssSrc)
    // .pipe(sass({ style: 'expanded'}))
    return sass(cssSrc, {style: 'expanded'})
        .pipe(gulp.dest(cssSrca))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())//精简
        .pipe(gulp.dest(cssSrca))
        .on('error', function (err) {
            console.error('Error!', err.message);
        });

});

// 压缩 css 文件
// 在命令行使用 gulp css 启动此任务
gulp.task('css', function () {
    // 1. 找到文件
    gulp.src('src/assets/css/*.css')
        // 2. 压缩文件
        .pipe(cssnano())
        // 3. 另存为压缩文件
        .pipe(gulp.dest('dist/assets/css'))
});

// 压缩图片任务
// 在命令行输入 gulp images 启动此任务
gulp.task('images', function () {
    // 1. 找到图片
    gulp.src('src/assets/images/*.*')
        // 2. 压缩图片
        .pipe(imagemin({
            progressive: true
        }))
        // 3. 另存图片
        .pipe(gulp.dest('dist/assets/images'))
});



// 监视文件改动并重新载入
gulp.task('serve', function () {
    browserSync({
        server: {
            baseDir: 'src'
        }
    });

    gulp.watch(['html/**/*.html', 'css/*.css', 'js/**/*.js'], {cwd: 'src'}, reload);
});


// 在命令行使用 gulp 启动 script 任务和 auto 任务
gulp.task('default', ['sass', 'images', 'css', 'script', 'auto']);

//推荐有礼模块

var RecommendSRC_sass="./Recommend_src/sass/", //sass
    RecommendSRC_js="./Recommend_src/js/es6/";     //js模块

var RecommendDist_css="./Recommend_src/css/",  // css 输出目录
    RecommendDist_js="./Recommend_src/js/es5/";    // JS输出目录

gulp.task('WatchReJS_ES6toES5',function(){
    gulp.watch("./Recommend_src/js/es6/**/*.js", function (event) {
        var paths = watchPath(event,RecommendSRC_js, RecommendDist_js);

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            babel({
                presets: ['es2015']
            }),
            //uglify(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ]);

        combined.on('error', handleError)
    })

});






//监听图片变化
gulp.task('BulidReimage', function() {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
});

/**
 *
 * 监听Recommend_SRC
 * */

gulp.task('watchResass',function () {
    var cssSrc = 'Recommend_src/sass/*.scss',
        cssSrca= 'Recommend_src/css';//源码也输出一份

    gulp.watch('Recommend_src/sass/**/*.scss', function (event) {
        var paths = watchPath(event,'Recommend_src/sass/','Recommend_src/css/');

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);

        gulp.src(paths.srcPath)
        return sass(cssSrc, {style: 'expanded'})
            .pipe(gulp.dest(cssSrca))
            .pipe(gulp.dest('../TTQMember/assets/widget/recommend/css/'))
            .pipe(rename({suffix: '.min' }))
            .pipe(cssnano())//精简
            .pipe(gulp.dest(cssSrca))
            .pipe(gulp.dest('../TTQMember/assets/widget/recommend/css/'))
            .on('error', function (err) {
                console.error('Error!', err.message);
            });

    })

});

/**
 * 打包推荐有礼模块
 */
gulp.task('bulidRecommend',function(){
    gulp.src('./Recommend_src/css/**/*')
        .pipe(gulp.dest('./Recommend_dist/css/'));
    gulp.src('./Recommend_src/icon/**/*')
        .pipe(gulp.dest('./Recommend_dist/icon/'));
    gulp.src('./Recommend_src/libs/**/*')
        .pipe(gulp.dest('./Recommend_dist/libs/'));
    gulp.src('./Recommend_src/html/**/*')
        .pipe(gulp.dest('./Recommend_dist/html/'));
    gulp.src('./Recommend_src/js/**/*')
        .pipe(gulp.dest('./Recommend_dist/js/'));
    gulp.src('./Recommend_src/image/**/*')
        .pipe(gulp.dest('./Recommend_dist/image/'));
    gulp.src('./Recommend_src/*.*')
        .pipe(gulp.dest('./Recommend_dist/'));
});
/**
 * 清理 Recommend_dist
 */
gulp.task('clearReDist',function(){
    return gulp.src('./Recommend_dist', {read: false})
        .pipe(clean());
});


/**
 *
 * 监听Recommend_SRC
 * */

gulp.task('watchTTQ4.0_sass',function () {
    var cssSrc = 'ttq4.0_css_src/sass/*.scss',
        cssSrca= 'ttq4.0_css_src/css';//源码也输出一份

    gulp.watch('ttq4.0_css_src/sass/**/*.scss', function (event) {
        var paths = watchPath(event,'ttq4.0_css_src/sass/','ttq4.0_css_src/css/');

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);

        gulp.src(paths.srcPath)
        return sass(cssSrc, {style: 'expanded'})
            .pipe(gulp.dest(cssSrca))
            .pipe(gulp.dest('../TTQMember/assets/widget/src/css/'))
            .pipe(rename({suffix: '.min' }))
            .pipe(cssnano())//精简
            .pipe(gulp.dest(cssSrca))
            .pipe(gulp.dest('../TTQMember/assets/widget/src/css/'))
            .on('error', function (err) {
                console.error('Error!', err.message);
            });

    })

});

//监听并自动
gulp.task('auto', function () {
    // 监听文件修改，当文件被修改则执行 script 任务
    //gulp.watch('src/assets/js/*.js', ['script']);
    // 监听文件修改，当文件被修改则执行 css 任务
    //gulp.watch('src/assets/css/*.css', ['css']);
   // gulp.watch('src/assets/images/*.*', ['images']);
    // 监听文件修改，当文件被修改则执行 sass任务
    //gulp.watch('src/sass/base/*.scss', ['sass']);

    //gulp.watch('expert_pc/sass/base/*.scss', ['BulidPCsass']);
    //当recommen_src目录下发生变换.则
    gulp.watch('./Recommend_src/**/*', ['bulidRecommend']);

});




