var gulp = require('gulp');
var uglify=require('gulp-uglify');// 获取 uglify 模块（用于压缩 JS）
var cssnano = require('gulp-cssnano');  // 获取 minify-css 模块（用于压缩 CSS）这个是最新的
var imagemin = require('gulp-imagemin');  // 获取 gulp-imagemin 模块
var sass = require('gulp-ruby-sass');     // 获取 gulp-ruby-sass 模块
var rename = require('gulp-rename');      //重命名
var concat  = require('gulp-concat');     //合并文件
var clean = require('gulp-clean');        //清空文件夹
var htmlreplace = require('gulp-html-replace'); //输出的html 替换 css 与  js
var htmlBuilder = require('gulp-html-builder');//对页面中引入的css文件和js文件进行合并并压缩到新文件 ,并替换
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//一些公共的路径
var jsSRC ='./src/assets/js/**/*.js',//js源代码库
    jsDEST='./dist/assets/js/';//js输出库



//清空输出目录
gulp.task('cleandist',function(){
    return gulp.src('dist/*', {read: false})
    .pipe(clean());
})

// HTML-libs 简易处理
gulp.task('html-libs', function() {
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
gulp.task('script', function() {
        // 1. 找到文件
        gulp.src(jsSRC)
            // 2. 压缩文件
            .pipe(uglify())
            // 3. 另存压缩后的文件
            .pipe(gulp.dest(jsDEST))
});


// 编译sass
// 在命令行输入 gulp sass 启动此任务
gulp.task('sass', function() {
    var cssSrc = './src/sass/*.scss',
		cssSrca= './src/css';//源码也输出一份


    gulp.src(cssSrc)
        // .pipe(sass({ style: 'expanded'}))
        return sass(cssSrc, {style: 'expanded'})
		.pipe(gulp.dest(cssSrca))
        .pipe(rename({suffix: '.min' }))
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

//监听并自动
gulp.task('auto', function () {
    // 监听文件修改，当文件被修改则执行 script 任务
    //gulp.watch('src/assets/js/*.js', ['script']);
     // 监听文件修改，当文件被修改则执行 css 任务
    //gulp.watch('src/assets/css/*.css', ['css']);
    gulp.watch('src/assets/images/*.*', ['images']);
    // 监听文件修改，当文件被修改则执行 sass任务
    gulp.watch('src/sass/base/*.scss', ['sass'])


});


// 监视文件改动并重新载入
gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: 'src'
        }
    });

    gulp.watch(['html/**/*.html', 'css/*.css', 'js/**/*.js'], {cwd: 'src'}, reload);
});

// 在命令行使用 gulp 启动 script 任务和 auto 任务
gulp.task('default', ['sass','images','css','script','auto']);
