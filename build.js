({
    baseUrl: 'js',
    out: 'dist/clickAndPoint.js',
    optimize: 'uglify2',
    uglify: {
        output: {
            beautify: false
        },
        compress: {
            sequences: true,
        },
        mangle: true
    },
    name: 'app/game',
    exclude: ['test'],
    stubModules: ['text'],
    wrap: true,
    namespace: 'ClickAndPointLib',
    useStrict: true,
    paths: {
        jquery: 'lib/jquery-3.2.1.min',
        lodash: 'lib/lodash.min',
    },
})
