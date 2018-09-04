fis.hook('amd', {
    baseUrl: "./js",
    paths: {
        'jquery': "lib/jquery-1.10.2",
        'Handlebars': 'lib/handlebars.runtime-v3.0.3',
        'IScroll': "lib/iscroll",
        'iScroll': "lib/iscroll1",
        'jValidate': "lib/validate/jquery.validate",
        'swiper': "lib/swiper/idangerous.swiper.min",
        'pagination': "lib/pagination/jquery.pagination",
        'Chosen': "lib/chosen.jquery",
        'BigDecimal': "lib/bigDecimal/BigDecimal-all-last.min"
    },
    shim: {
        "IScroll": {
            exports: "IScroll"
        },
        "iScroll": {
            exports: "iScroll"
        }
    }
});
fis.match('*', {
    release: '/static/$0',
    //useMap: true
});
fis.match('*.html', {
    release: '/$0'
});
fis.match('*.{css,less,scss}', {
  preprocessor: fis.plugin('autoprefixer', {
    "browsers": ["Android >= 2.1", "iOS >= 4", "ie >= 8", "firefox >= 15"],
    "cascade": true
  })
})
fis.match('**/*.scss', {
    rExt: '.css',
    parser: fis.plugin('node-sass', {
        //fis-parser-node-sass option
    })
});
fis.match('{/js/app/controller/**.js,/js/app/interface/**.js,/js/app/module/**.js}', {
    parser: fis.plugin('babel-6.x', {
        sourceMaps: true,
        presets: [
            'latest', 'es2016', 'ES2015', 'stage-0'
        ]
    }),
    rExt: 'js'
});
fis.match('*.{js,css}', {
    useHash: true
}).match('config.js', {
    useHash: false
});

//npm install -g fis-parser-handlebars-3.x
fis.match('*.handlebars', {
    rExt: '.js', // from .handlebars to .js 虽然源文件不需要编译，但是还是要转换为 .js 后缀
    parser: fis.plugin('handlebars-3.x', {
        //fis-parser-handlebars-3.x option
    }),
    release: false // handlebars 源文件不需要编译
});
fis.match('::package', {
    postpackager: fis.plugin('loader', {
        sourceMap: true,
        useInlineMap: true
    })
});
fis.media("prod")
    .match('::package', {
        postpackager: fis.plugin('loader', {
            allInOne: {
                includeAsyncs: true
            }
        })
    })
    .match('/js/require.js', {
        packTo: '/pkg/common.js',
        packOrder: -100
    })
    .match('/js/lib/jquery-1.10.2.js', {
        packTo: '/pkg/common.js',
        packOrder: -90
    })
    .match('{/js/app/util/ajax.js,/js/app/util/cookie.js,/js/app/util/dialog.js,/js/app/module/loading/index.js,/js/lib/iscroll1.js}', {
        requires: ['/js/require.js', '/js/lib/jquery-1.10.2.js'],
        packTo: '/pkg/common.js'
    })
    .match("**.js", {
        optimizer: fis.plugin('uglify-js')
    })
    .match("**.css", {
        optimizer: fis.plugin('clean-css')
    })
    .match('/js/app/config.js', {
        optimizer: null,
        packTo: '/config/config.js',
        useHash: false
    })
    .match('**.png', {
        optimizer: fis.plugin('png-compressor')
    });
