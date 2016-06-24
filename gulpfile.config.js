var metadata = require('./package');

var GulpConfig = (function () {
    function GulpConfig() {
        this.name = metadata.name;
        this.header = '// ' + this.name + ' v' + metadata.version + ' ' + metadata.homepage + '\n';
        // libs that MUST be included in a consuming app for this component to work
        this.deps = [
            'node_modules/base-component/dist/base-component.bundle.js',
            'node_modules/utils/dist/utils.min.js'
        ];
        // ts definitions to copy to the typings dir
        this.typings = [
            'node_modules/base-component/dist/base-component.d.ts',
            'node_modules/manifold/dist/manifold.bundle.d.ts',
            'node_modules/utils/dist/utils.d.ts'
        ];
        this.typingsDir = './typings';
        // libs that MAY be included in a consuming app but are used here for example purposes
        this.examplesDeps = [
            'node_modules/manifold/dist/manifold.bundle.js'
        ];
        this.examplesDir = './examples';
        this.examplesDepsDir = './examples/js';
        this.examplesCssDir = './examples/css';
        this.dist = './dist';
        this.jsOut = this.name + '.js';
        this.jsMinOut = this.name + '.min.js';
        this.jsBundleOut = this.name + '.bundle.js';
        this.dtsOut = this.name + '.d.ts';
        this.dtsBundleOut = this.name + '.bundle.d.ts';
        this.tsSrc = [
            'src/_references.ts',
            'src/*.ts',
            'typings/*.ts',
            'typings/**/*.ts'
        ];
        this.tsConfig = {
            declarationFiles: true,
            noExternalResolve: true,
            noLib: false,
            module: 'commonjs',
            sortOutput: true
        };
        this.browserifyConfig = {
            standalone: this.name,
            debug: false
        };
        this.browserifySrc = this.dist;
        this.browserifyTarget = this.dist;
        this.cssOut = this.name + '.css';
        this.cssSrc = [
            'src/css/**/*.less'
        ];
        this.examplesImgDir = './examples/img';
        this.imgSrc = './src/img/**';
    }
    return GulpConfig;
})();

module.exports = GulpConfig;