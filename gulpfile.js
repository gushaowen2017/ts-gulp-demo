//gulp.series("copy-html"),
var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");
var uglify = require('gulp-uglify');
var paths = {
  	pages: ['src/*.html']
};
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
// 清理dist文件夹
var pump = require('pump');
var clean = require('gulp-clean');

/**
 * 清理目标目录
 */
gulp.task('clean', function(cb) {
    pump([
        gulp.src('dist'),
        clean()
    ], cb)
})

var watchedBrowserify = watchify(browserify({
  	basedir: '.',
  	debug: true,
  	entries: ['src/main.ts'],//入口文件
  	cache: {},
  	packageCache: {}
}).plugin(tsify));

gulp.task("copy-html", function () {
  	return gulp.src(paths.pages)
    	.pipe(gulp.dest("dist"));
});

function bundle() {
  	return watchedBrowserify
    	.bundle()
    	.pipe(source('bundle.js'))//生成js文件名
    	.pipe(buffer())
    	.pipe(sourcemaps.init({
      		loadMaps: true
    	})) // 生成sourcemap，需要配合后面的sourcemaps.write()
    	.pipe(uglify()) // 压缩代码
    	.pipe(sourcemaps.write('./')) // 生成sourcemap
    	.pipe(gulp.dest("dist"));// 输出至目标目录
}
// 					gulp.parallel():并行执行；series():顺序执行；
gulp.task("default", gulp.series('clean', "copy-html", bundle));
// 每次 TypeScript 文件改变时 Browserify 会执行 bundle 函数。
watchedBrowserify.on("update", bundle);
// 将日志打印到控制台。
watchedBrowserify.on("log", gutil.log);