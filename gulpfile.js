var gulp = require('gulp'),
  bump = require('gulp-bump'),
  shell = require('gulp-shell'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  karma = require('karma').server,
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence');

var testFiles = [
  'src/confetti.js',
  'test/*.spec.js'
];

var jshintTask = lazypipe()
  .pipe(jshint)
  .pipe(jshint.reporter, stylish)
  .pipe(jshint.reporter, 'fail');

gulp.task('jshint', function () {
  return gulp.src(testFiles)
    .pipe(jshintTask());
})

gulp.task('karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    autoWatch: false,
    browsers: ['Firefox']
  }, done);
});

gulp.task('bump:patch', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({ type: 'patch' }))
    .pipe(gulp.dest('./'))
    .on('error', function (err) { throw err; });
});

gulp.task('commit', function (done) {
  return gulp.src('./package.json')
    .pipe(shell([
      'git commit -am "v<%= file.version %>"',
      'git tag -am v<%= file.version %> "v<%= file.version %>"',
      'git push --all'
    ]))
    .on('error', function (err) { throw err; });
});

gulp.task('release:patch', function (done) {
  runSequence('test', 'bump:patch', 'commit', done);
});

gulp.task('test', ['jshint', 'karma']);
