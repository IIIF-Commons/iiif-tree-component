var metadata = require('./package');

var GulpConfig = (function () {
    function GulpConfig() {
        this.name = metadata.name;
        // libs that MUST be included in a consuming app for this component to work
        this.deps = [
            'node_modules/base-component/dist/base-component.min.js',
            'node_modules/exjs/dist/ex.es3.min.js',
            'node_modules/extensions/dist/extensions.min.js',
            'node_modules/utils/dist/utils.min.js'
        ];
        // libs that MAY be included in a consuming app but are used here for testing purposes, 
        this.testDeps = [
            'node_modules/manifesto.js/dist/client/manifesto.js',
            'node_modules/manifold/dist/manifold.js'
        ];
        this.testDepsDir = './test/js';
        // ts definitions to copy to the typings dir
        this.typings = [
            'node_modules/base-component/dist/base-component.d.ts',
            'node_modules/exjs/dist/ex.d.ts',
            'node_modules/manifesto.js/dist/manifesto.d.ts',
            'node_modules/manifold/dist/manifold.d.ts',
            'node_modules/utils/dist/utils.d.ts'
        ];
        this.typingsDir = './typings';
        this.dist = './dist';
        this.header = '// ' + this.name + ' v' + metadata.version + ' ' + metadata.homepage + '\n';
        this.jsOut = this.name + '.js';
        this.dtsOut = this.name + '.d.ts';
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
    }
    return GulpConfig;
})();

module.exports = GulpConfig;