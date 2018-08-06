/* 此版本为开发版本
*/
// 引入核心文件
const gulp = require("gulp");
// 清空
var clean = require("gulp-clean");
// 处理css
var sass = require("gulp-sass");
// 兼容性  添加浏览器前缀
var autoprefixer = require("gulp-autoprefixer");
// 压缩css
var cssmin = require('gulp-cssmin');
// 处理js es6->es5
var babel = require("gulp-babel");
// 压缩 混淆代码
var uglify = require('gulp-uglify');
// 处理html
var fileInclude = require("gulp-file-include");
// 任务线性执行
var runSequence = require("run-sequence");
// 浏览器自动刷新
var browserSync = require("browser-sync");

// 添加指纹
var rev = require("gulp-rev");
// 将html中的文件引用改成带有指纹的 revCollector
var revCollector = require("gulp-rev-collector");

// test  在根目录创建  然后才可以执行
// gulp.task("copy",function(){
//     gulp.src("./js/*.js")
//     .pipe(gulp.dest("./dist/"))
// })
gulp.task("clean", function () {
    return gulp
        .src("./dist")
        .pipe(clean())
})

gulp.task("css", function () {
    return gulp
        .src("./src/css/**")
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(cssmin())
        .pipe(rev())
        .pipe(gulp.dest("./dist/css"))
        .pipe(rev.manifest({
            path: "rev-css-mainfest.json"
        }))
        .pipe(gulp.dest("rev"));
})
gulp.task("js", function () {
    return gulp
        .src("./src/js/**")
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify({
            // 混淆和压缩js
            mangle: {
                toplevel: true
            }
        }))
        .pipe(rev())
        .pipe(gulp.dest("./dist/js/"))
        .pipe(rev.manifest({
            path: "rev-js-mainfest.json"
        }))
        .pipe(gulp.dest("rev"));
})

gulp.task("html", function () {
    return gulp
        .src("./src/pages/**")
        .pipe(fileInclude({
            prefix: "@@",
            basepath: "./src/components"
        }))
        .pipe(gulp.dest("./dist/pages/"))
})
// 6 处理静态资源 
gulp.task("lib", function () {
    return gulp.src("./src/lib/**")
        .pipe(gulp.dest("./dist/lib"))
})
gulp.task("static", function () {
    return gulp.src("./src/static/**")
        .pipe(gulp.dest("./dist/static"))
})
// 7.4 替换成带有指纹的!! 
gulp.task("revCollector", function () {
    return gulp.src(["rev/*.json", "./dist/pages/*.html"])
    // 7.4 执行替换 
      .pipe(revCollector())
      .pipe(gulp.dest("./dist/pages"));
  })


gulp.task("default", function () {
    runSequence("clean", ["css", "js", "html", "lib", "static"],"revCollector", function () {
        browserSync.init({
            server: {
                baseDir: "./dist",
                index: "pages/index.html"
            },
            port: "8888",
            notify: false
        });
        gulp.watch("./src/css/**", ["css"]).on("change", browserSync.reload);
        gulp.watch("./src/js/**", ["js"]).on("change", browserSync.reload);
        gulp.watch("./src/pages/**", ["html"]).on("change", browserSync.reload);
    })
})