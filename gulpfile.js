/**
 * [setting project] プロジェクトの設定
 * project.server     [ローカルサーバーの名前（hosts と合わせる）]
 * project.character  [文字コードを設定]
 * project.eol        [改行コードを設定]
 *  -> LF    = '\n'
 *  -> CR+LF = '\r\n'
 * project.browsers   [対象ブラウザ・OSの設定]
 */
const project = {
    server: 'starter-kit:8080',
    character: 'UTF-8',
    eol: '\n',
};

/**
 * [setting path] パスの設定
 * dir.src        [共通リソースを格納するディレクトリ名]
 * dir.sass       [Sass ファイルを格納するディレクトリ名]
 * dir.css        [CSS ファイルを格納するディレクトリ名]
 * pathRoot       [（gulpfile.js を起点とした）ドキュメントルートの位置]
 * pathDevRoot    [開発環境のドキュメントルート位置]
 * pathDev.sass   [開発環境の Sass ファイルを格納するディレクトリまでのパス]
 * pathProd.css   [本番用の CSS ファイルを格納するディレクトリまでのパス]
 * pathProd.js    [本番用の JavaScript ファイルを格納するディレクトリまでのパス]
 * pathProd.html    [本番用の html ファイルを格納するディレクトリまでのパス]
 */
const dir = {
    src: 'common',
    sass: '01_sass',
    ejs: '02_ejs',
    css: 'css'
};
const pathRoot = '.';
const pathDevRoot = '_dev';
const pathDev = {
    sass: pathDevRoot + '/' + dir.sass + '/',
    mixin: pathDevRoot + '/' + dir.sass + '/mixin/addons/',
    ejs: pathDevRoot + '/' + dir.ejs + '/',
    header: pathDevRoot + '/' + dir.ejs + '/_include/header/',
    footer: pathDevRoot + '/' + dir.ejs + '/_include/footer/'
};
const pathProd = {
    css: pathRoot + '/' + dir.src + '/' + dir.css + '/',
    js: pathRoot + '/' + dir.src + '/' + dir.js + '/',
    html: pathRoot + '/',
    header: pathRoot + '/' + dir.src + '/include/header/',
    footer: pathRoot + '/' + dir.src + '/include/footer/'
};

/**
 * [gulp]
 * gulp    [変数化]
 * plugins [gulp-* のプラグインを自動読み込み]
 *  -> https://github.com/jackfranklin/gulp-load-plugins
 */
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

/**
 * [browserSync] ブラウザ同期に必要なプラグイン読み込み
 * browserSync [プラグインを変数化]
 */
const browserSync = require('browser-sync').create();

const autoprefixer = require('autoprefixer');
const cssDeclarationSorter = require('css-declaration-sorter');

/**
 * [Sass コンパイル] https://github.com/sindresorhus/gulp-ruby-sass
 * 1. Sass ファイルをコンパイル
 * 2. replace で文字コード部分を書き換え
 * 3. 不要な半角スペースが残る場合があるため削除
 * 4. ファイルエンコードを文字コードと同じものに変換
 * 5. ベンダープレフィックス自動付与、プロパティソート、メディアクエリ結合
 * 6. CSS ファイルを出力
 * 7. ブラウザを同期
 */
gulp.task('compileSass', function () {
    'use strict';

    return gulp.src(pathDev.sass + '*.scss')
        .pipe(plugins.dartSass({
            outputStyle: 'expanded'
        }))
        .pipe(plugins.plumber()) // エラー時もファイル監視を続ける
        .pipe(plugins.replace('UTF-8', project.character))
        .pipe(plugins.replace(' \n', '\n'))
        .pipe(plugins.eol(project.eol))
        .pipe(plugins.convertEncoding({
            to: project.character
        }))
        .pipe(plugins.postcss([
            autoprefixer({
                grid: true
            }),
            cssDeclarationSorter({
                order: 'smacss'
            })
        ]))
        .pipe(gulp.dest(pathProd.css))
        .pipe(browserSync.stream());
});
gulp.task('compileNewsSass', function () {
    'use strict';

    return gulp.src(pathDev.sass + '/news/*.scss')
    .pipe(plugins.dartSass({
        outputStyle: 'expanded'
    }))
    .pipe(plugins.plumber()) // エラー時もファイル監視を続ける
    .pipe(plugins.replace('UTF-8', project.character))
    .pipe(plugins.replace(' \n', '\n'))
    .pipe(plugins.eol(project.eol))
    .pipe(plugins.convertEncoding({
        to: project.character
    }))
    .pipe(plugins.postcss([
        autoprefixer({
            grid: true
        }),
        cssDeclarationSorter({
            order: 'smacss'
        })
    ]))
    .pipe(gulp.dest(pathRoot + '/news/css/'))
    .pipe(browserSync.stream());
});

/**
 * EJSコンパイル
 */
gulp.task('ejs', function () {
    'use strict';

    return gulp.src([pathDev.ejs + '**/*.ejs', '!' + pathDev.ejs + '**/_*.ejs'])
        .pipe(plugins.ejs())
        .pipe(plugins.rename({
            extname: '.html'
        }))
        .pipe(plugins.eol(project.eol))
        .pipe(gulp.dest(pathProd.html))
        .pipe(browserSync.stream());
});

/**
 * [BrowserSync ブラウザの同期]
 * proxy [指定したサーバーで同期をとる]
 */
function bSync() {
    'use strict';

    return browserSync.init({
        proxy: project.server
    });
}

/**
 * [Watch ファイル監視]
 * スプライト用画像の監視 [変更があれば新たにスプライトを作成し、Sass ファイルを更新]
 * html ファイルの監視  [html ファイルに変更があればブラウザに同期]
 * Sass ファイルの監視  [Sass ファイルに変更があればコンパイル]
 */
function watchFiles() {
    'use strict';

    return gulp.watch([pathDev.sass + '**/*.scss', pathDev.ejs + '**/*.ejs'], gulp.parallel('compileSass','ejs'));
}

gulp.task('default', gulp.series(gulp.parallel(bSync, 'compileSass', 'ejs', watchFiles)));
