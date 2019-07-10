const gulp = require('gulp')
const ts = require('gulp-typescript')
const clean = require('gulp-clean')

const tsProject = ts.createProject('tsconfig.json')

//Busca a pasta que deve compilar do tsconfig
var sources = require('./tsconfig.json');
const distFolder = sources.compilerOptions.outDir

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
        .pipe(tsProject())

    return tsResult.js
        .pipe(gulp.dest(distFolder))
})

//Copia os arquivos JSON para o dist
gulp.task('static', () => {
    return gulp
        .src([
            "src/**/*.json",
            "src/**/*.key",
            "src/**/*.key.pub"
        ])
        .pipe(gulp.dest(distFolder))
})

//Limpa a pasta dist
gulp.task('clean', () => {
    return gulp
        .src(distFolder, { read: false, allowEmpty: true })
        .pipe(clean())
})

//Tarefa de build para executar em ordem
gulp.task('build', gulp.series('clean', 'static', 'scripts'))

//Tarefa que fica ouvindo a modificação dos arquivos
gulp.task('watch', gulp.series('build', () => {
    return gulp.watch([
        "src/**/*.ts",
        "src/**/*.json",
        "src/**/*.key",
        "src/**/*.key.pub",
        "src/**/*.js"
    ], gulp.series('build'))
}))

gulp.task('default', gulp.series('watch'))