//--------------------------------------------------
// function defaultTask(cb) {
// 	// place code for your default task here
// 	cb();
//  }
 
//  exports.default = defaultTask
//--------------------------------------------------
//ПЕРЕМЕННЫЕ ПАПОК
//--------------------------------------------------
//let project_folder = "dist"
let project_folder = require("path").basename(__dirname)
let source_folder = "#src"
let fs = require("fs")
let indexFile = "index_dev.html"
// let indexFile = "index.html"

//--------------------------------------------------
//ПУТИ
//--------------------------------------------------
let path ={
	build:{
		html: project_folder+"/",
		css: project_folder+"/css/",
		js: project_folder+"/js/",
		img: project_folder+"/img/",
		fonts: project_folder+"/fonts/",
	},
	src:{
		html: [source_folder+"/*.html", "!" + source_folder +"/_*.html"],
		css: source_folder+"/scss/style.scss",
		js: source_folder+"/js/script.js",
		img: source_folder+"/img/**/*.{jpg,JPG,png,svg,gif,ico,webp}",
		fonts: source_folder+"/fonts/*.{ttf,woff,woff2}",
	},
	watch:{
		html: source_folder+"/**/*.html",
		css: source_folder+"/scss/**/*.scss",
		js: source_folder+"/js/**/*.js",
		img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}"
	},
	clean: "./"+project_folder+"/"
}
//--------------------------------------------------
//ПЕРЕМЕННЫЕ
//--------------------------------------------------
let {src,dest}=require("gulp")
let gulp=require('gulp')

let browsersync=require("browser-sync").create();
let fileinclude=require("gulp-file-include")
let del=require("del")
let scss=require("gulp-sass")
let autoprefixer=require("gulp-autoprefixer")
let gcmq = require("gulp-group-css-media-queries")
let clean_css = require("gulp-clean-css");
let rename = require("gulp-rename");
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
let ttf2woff = require('gulp-ttf2woff');
let ttf2woff2 = require('gulp-ttf2woff2');
let sourcemaps = require('gulp-sourcemaps');
//--------------------------------------------------
//browser-sync
//--------------------------------------------------
function BrowserSync(params) {
	browsersync.init({
		server:{
			baseDir:"./"+project_folder+"/"
		},
		index: indexFile,
		browser: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		port:3000,
		notify:true
	})
}
//--------------------------------------------------
//ОЧИСТКА
//--------------------------------------------------
function Clean(params) {
	return del(path.clean)
}
//--------------------------------------------------
//ОБРАБОТЧИКИ
//--------------------------------------------------
function HTML() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}
function CSS_Dev() {
	return src(path.src.css)
		.pipe(sourcemaps.init())
			.pipe(
				scss({
					outputStyle: "expanded"
				})
			)
			// .pipe(
			// 	gcmq()
			// )
			// .pipe(
			// 	autoprefixer({
			// 		overrideBrowserslist: ["last 5 version"],
			// 		cascade:true
			// 	})
			// )
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}
function CSS() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			gcmq()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 version"],
				cascade:true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}
function JS() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}
function IMAGES() {
	return src(path.src.img)
		.pipe(
			imagemin({
				interlaced: true,
				progressive: true,
				optimizationLevel: 3,//0 to7
				svgoPlugins: [{removeViewBox: false}]//true
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}
//---ШРИФТЫ
function FONTS(params) {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
}
function FontsStyle(params) {
	let file_content=fs.readFileSync(source_folder + '/scss/_fonts.scss');
	if(file_content==''){
		fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function(err,items){
			if(items){
				let c_fontname;
				for(var i = 0; i < items.length; i++){
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if(c_fontname!=fontname){
						fs.appendFile(source_folder + '/scss/_fonts.scss',
						'@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb)
					}
					c_fontname = fontname
				}
			}
		})
	}
}
function cb() {}

//--------------------------------------------------
//ВОТЧЕР
//--------------------------------------------------
function WatchFiles(params) {
	gulp.watch([path.watch.html],HTML)
//	gulp.watch([path.watch.css],CSS)
	gulp.watch([path.watch.css],CSS_Dev)
	gulp.watch([path.watch.js],JS)
	gulp.watch([path.watch.img],IMAGES)
}
//--------------------------------------------------
//ТАСКИ
//--------------------------------------------------
//gulp.task('fonts',FontsStyle())//gulp fonts
// let dev=gulp.series(Clean,gulp.parallel(CSS,HTML,JS,IMAGES,FONTS),FontsStyle)
// let build=gulp.series(Clean,gulp.parallel(CSS,HTML,JS,IMAGES,FONTS),FontsStyle)

let dev=gulp.series(Clean,gulp.parallel(CSS_Dev,HTML,JS,IMAGES,FONTS),FontsStyle)
let build=gulp.series(Clean,gulp.parallel(CSS_Dev,HTML,JS,IMAGES,FONTS),FontsStyle)


let watch=gulp.parallel(dev,WatchFiles,BrowserSync)
let watch2=gulp.parallel(build,WatchFiles,BrowserSync)
//--------------------------------------------------
//EXPORT
//--------------------------------------------------

// exports.html=HTML
// exports.css=CSS
// exports.css=CSS_Dev
// exports.js=JS
// exports.images=IMAGES
// exports.fonts=FONTS
// exports.FontsStyle=FontsStyle
exports.dev=dev
exports.build=build
exports.watch=watch
exports.watch2=watch2
exports.default=watch
