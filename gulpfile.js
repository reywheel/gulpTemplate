let gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    browserSync    = require('browser-sync'),
    uglify         = require('gulp-uglify'),
    concat         = require('gulp-concat'),
    autoprefixer   = require('gulp-autoprefixer'),
    jquery         = require('jquery');

gulp.task('html', function () {
  return gulp.src('app/*.html')
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('sass', function () {
  return gulp.src('app/scss/**/*.+(scss|sass)')
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('js', function () {
  return gulp.src('app/js/')
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('build-js-libs', function () {
  return gulp.src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/slick-carousel/slick/slick.min.js' 
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
});

gulp.task('watch', function () {
  gulp.watch('app/scss/**/*.+(scss|sass)', gulp.parallel('sass'))
  gulp.watch('app/*.html', gulp.parallel('html'))
  gulp.watch('app/js/**/*.js', gulp.parallel('js'))

});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "app/"
    }, 
    notify: false
  });
});

gulp.task('default', gulp.parallel('browser-sync', 'watch'))