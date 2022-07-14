//modules
const {src, dest, parallel, series, watch} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;
const tinypng = require('gulp-tinypng-compress');

//app cleaner
const clean = () => {
    return del('app/*')
}

//scripts
const scripts = () => {
    return src('./src/js/main.js')
    .pipe(webpackStream({
        output: {
            filename: 'main.js',
        },
        module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      ['@babel/preset-env', { targets: "defaults" }]
                    ]
                  }
                }
              }
            ]
          }
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream());
}
 
//fonts convertor
const fonts = () => {
    src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts/'))
    return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/fonts/'))
}

//svg to sprites
const svgSprites = () => {
    return src('./src/img/**.svg')
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: "../sprite.svg"
            }
        }
    }))
    .pipe(dest('./app/img'))
}

//styles
const styles = () => {
    return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outpuStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(autoprefixer({
        cascade: false,
    }))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream());
}

//html
const htmlInclude = () => {
    return src(['./src/index.html'])
    .pipe(fileInclude({
        prefix: '@',
        basepath: '@file'
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
}

//img
const imgToApp = () => {
    return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp'])
    .pipe(dest('./app/img/'))
}

//another resources
const resources = () => {
    return src(['./src/resources/**'])
    .pipe(dest('./app'))
}

// files update
const filesUpdate = () => {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
    });

    watch('./src/scss/**/*.scss', styles);
    watch('./src/index.html', htmlInclude);
    watch('./src/img/**.jpg', imgToApp);
    watch('./src/img/**.png', imgToApp);
    watch('./src/img/**.jpeg', imgToApp);
    watch('./src/img/**.webp', imgToApp);
    watch('./src/img/**.svg', svgSprites);
    watch('./src/resources/**', resources);
    watch('./src/fonts/**.ttf', fonts);
    watch('./src/js/**/*.js', scripts);
}

// exports
exports.styles = styles;
exports.filesUpdate = filesUpdate;
exports.fileInclude = htmlInclude;

exports.default = series(clean, parallel(htmlInclude, scripts, fonts, resources, imgToApp, svgSprites), styles, filesUpdate);

// build

const tinyPng = () => {
    return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp'])
    .pipe(tinypng({
        key: 'vbFpyzKx0DbNrk3gmbBlfx7Hxkm3wFgr',
    }))
    .pipe(dest('./app/img'))
}

const stylesBuild = () => {
    return src('./src/scss/**/*.scss')
    .pipe(sass({
        outpuStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(autoprefixer({
        cascade: false,
    }))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(dest('./app/css/'))
}

const scriptsBuild = () => {
    return src('./src/js/main.js')
    .pipe(webpackStream({
        output: {
            filename: 'main.js',
        },
        module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      ['@babel/preset-env', { targets: "defaults" }]
                    ]
                  }
                }
              }
            ]
          }
    }))
    .pipe(uglify().on("error", notify.onError()))
    .pipe(dest('./app/js'))
}

exports.build = series(clean, parallel(htmlInclude, scriptsBuild, fonts, resources, imgToApp, svgSprites), stylesBuild, tinyPng);