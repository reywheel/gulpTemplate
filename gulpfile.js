let isDev = true,
  isProd = !isDev,
  buildFolder = 'dist',
  sourceFolder = '#src',
  fs = require('fs'),
  path = {
    src: {
      html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
      css: sourceFolder + '/scss/main.scss',
      js: sourceFolder + '/js/main.js',
      img: sourceFolder + '/img/**/*.+(png|jpg|svg|gif|ico|webp|jpeg)',
      fonst: sourceFolder + '/fonts/*.ttf'
    },
    build: {
      html: buildFolder + '/',
      css: buildFolder + '/css/',
      js: buildFolder + '/js/',
      img: buildFolder + '/img/',
      fonst: buildFolder + '/fonts/'
    },
    watch: {
      html: sourceFolder + '/**/*.html',
      css: sourceFolder + '/scss/**/*.scss',
      js: sourceFolder + '/js/**/*.js',
      img: sourceFolder + '/img/**/*.+(png|jpg|svg|gif|ico|webp|jpeg)',
    },
    clean: './' + buildFolder + '/'
  };

let {
  src,
  dest
} = require("gulp"),
  gulp = require("gulp"),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpcss = require('gulp-webpcss'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  webpack = require('webpack'),
  webpackStream = require('webpack-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  smartgrid = require('smart-grid');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: './' + buildFolder + '/'
    },
    port: 3000,
    notify: false
  })
}

function html() {
  if (isDev) {
    return src(path.src.html)
      .pipe(fileinclude())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
    }
    
  if (isProd) {
    return src(path.src.html)
      .pipe(fileinclude())
      .pipe(webphtml())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
  }
}

function clean() {
  return del(path.clean);
}

function css() {
  if (isDev) {
    return src(path.src.css)
    .pipe(sourcemaps.init())
    .pipe(scss({
      outputStyle: 'expanded'
    }))
    // .pipe(group_media())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 5 version'],
      cascade: true
    }))
    // .pipe(webpcss())
    // .pipe(dest(path.build.css))
    // .pipe(clean_css())
    // .pipe(rename({
    //   extname: '.min.css'
    // }))
    .pipe(sourcemaps.write())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
  }
  if (isProd) {
    return src(path.src.css)
      // .pipe(sourcemaps.init())
      .pipe(scss({
        outputStyle: 'expanded'
      }))
      .pipe(group_media())
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 5 version'],
        cascade: true
      }))
      .pipe(webpcss())
      .pipe(dest(path.build.css))
      .pipe(clean_css())
      .pipe(rename({
        extname: '.min.css'
      }))
      // .pipe(sourcemaps.write())
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  }
}

function js() {
  if (isDev) {
    return gulp.src(path.src.js)
      .pipe(webpackStream({
        devtool: 'cheap-module-eval-source-map',
        mode: 'production',
        optimization: {
          minimize: false
        },
        output: {
          filename: 'main.min.js',
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: '/node_modules/',
              options: {
                presets: ["@babel/preset-env"],
              }
            }
          ]
        },
        externals: {
          jquery: 'jQuery'
        }
      }))
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
  }
  if (isProd) {
    return gulp.src(path.src.js)
      .pipe(webpackStream({
        mode: 'production',
        output: {
          filename: 'main.js',
        },
        optimization: {
          minimize: false
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: '/node_modules/',
              options: {
                "presets": [
                  [
                    "@babel/preset-env",
                    {
                      "targets": {
                        "ie": "11"
                      }
                    }
                  ]
                ]
              }
            }
          ]
        },
        externals: {
          jquery: 'jQuery'
        }
      }))
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
  }
}
// function js() {
//   return src(path.src.js)
//     .pipe(fileinclude())
//     .pipe(babel({
//       presets: ['@babel/env']
//     }))
//     .pipe(dest(path.build.js))
//     .pipe(uglify())
//     .pipe(rename({
//       extname: '.min.js'
//     }))
//     .pipe(dest(path.build.js))
//     .pipe(browsersync.stream())
// }

function images() {
  if (isDev) {
    return src(path.src.img)
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
  }

  if (isProd) {
    return src(path.src.img)
      .pipe(webp({
        quality: 70
      }))
      .pipe(dest(path.build.img))
      .pipe(src(path.src.img))
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        interplaced: true,
        oprimizationLevel: 3 // from 0 to 7
      }))
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
  }
}

function fonts() {
  src(path.src.fonst)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonst));
  return src(path.src.fonst)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonst));
}

gulp.task('otf2ttf', function () {
  return src([sourceFolder + '/fonts/*.otf'])
    .pipe(fonter({
      format: ['ttf']
    }))
    .pipe(dest(sourceFolder + '/fonst/'))
})

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;

gulp.task('grid', function(done) {
  /* It's principal settings in smart grid project */
  var settings = {
      outputStyle: 'scss', /* less || scss || sass || styl */
      columns: 12, /* number of grid columns */
      offset: '30px', /* gutter width px || % || rem */
      mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
      container: {
          maxWidth: '1200px', /* max-width оn very large screen */
          fields: '30px' /* side fields */
      },
      breakPoints: {
          lg: {
              width: '1100px', /* -> @media (max-width: 1100px) */
          },
          md: {
              width: '960px'
          },
          sm: {
              width: '780px',
              fields: '15px' /* set fields only if you want to change container.fields */
          },
          xs: {
              width: '560px'
          }
          /* 
          We can create any quantity of break points.
  
          some_name: {
              width: 'Npx',
              fields: 'N(px|%|rem)',
              offset: 'N(px|%|rem)'
          }
          */
      }
  };
  
  smartgrid('./#src/scss', settings);
  done();
});