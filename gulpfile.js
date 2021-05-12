let project_folder = require("path").basename(__dirname)
let source_folder = "#src"
let fs = require("fs")
let mode = 'dev'
function cb() {}
//-----------------------------------------------
//ПУТИ
//-----------------------------------------------
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
//-----------------------------------------------
//ПЕРЕМЕННЫЕ
//-----------------------------------------------
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

//-----------------------------------------------
//сброс режима разработки
//-----------------------------------------------
function production(cb){
	mode=''
	cb()
}
//-----------------------------------------------
//browser-sync
//-----------------------------------------------
function BrowserSync() {
	switch (mode) {
		case "dev":
			browsersync.init({
				server:{
					baseDir:"./"+project_folder+"/"
				},
				index: "index_dev.html",
				browser: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
				port:3000,
				notify:true
			})
			break;
		default:
			browsersync.init({
				server:{
					baseDir:"./"+project_folder+"/"
				},
				index: "index.html",
				browser: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
				port:3000,
				notify:true
			})
			break;
	}
}
//-----------------------------------------------
//ОЧИСТКА
//-----------------------------------------------
function Clean() {
	return del(path.clean)
}
//-----------------------------------------------
//ОБРАБОТЧИКИ
//-----------------------------------------------
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

function cssDev() {
	return src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}
function css() {
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

function jsDev() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

function js() {
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
//-----------------------------------------------
//---ШРИФТЫ
//-----------------------------------------------
function fonts() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
}

function fontsStyle(cb) {
	let file_content=fs.readFileSync(source_folder + '/scss/_fonts.scss');
	if(file_content==''){
		fs.writeFileSync(source_folder + '/scss/_fonts.scss','');
		fs.readdir(path.build.fonts,function(err,items){
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
	cb()
}
//-----------------------------------------------
//---удалить файл index_dev.html
//-----------------------------------------------
function delIndexDev() {
	return del(path.build.html+"index_dev.html")
}
//-----------------------------------------------
//ВОТЧЕР
//-----------------------------------------------
function WatchFiles() {
	switch (mode) {
		case "dev":
			gulp.watch([path.watch.html],html)
			gulp.watch([path.watch.css],cssDev)
			gulp.watch([path.watch.js],jsDev)
			gulp.watch([path.watch.img],IMAGES)
			break;
		default:
			gulp.watch([path.watch.html],html)
			gulp.watch([path.watch.css],css)
			gulp.watch([path.watch.js],js)
			gulp.watch([path.watch.img],IMAGES)
			break;
	}
}
//-----------------------------------------------
//ТАСКИ
//-----------------------------------------------
let buildDev=gulp.series(Clean,fonts,fontsStyle,gulp.parallel(html,cssDev,jsDev,IMAGES))
let dev=gulp.series(buildDev,gulp.parallel(WatchFiles,BrowserSync))

let buildProd=gulp.series(production,Clean,fonts,fontsStyle,gulp.parallel(html,css,js,IMAGES),delIndexDev)
let prod=gulp.series(buildProd,gulp.parallel(WatchFiles,BrowserSync))
//-----------------------------------------------
//EXPORT
//-----------------------------------------------
exports.prod=prod
exports.default=dev