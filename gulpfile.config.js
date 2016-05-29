var metadata = require('./package');

var GulpConfig = (function () {
    function GulpConfig() {
        this.name = metadata.name;
        // libs that must be included in a consuming app for this component to work
        this.deps = [
            'node_modules/base-component/dist/base-component.min.js',
            'node_modules/base-component/node_modules/eventemitter2/lib/eventemitter2.js'
        ];
        // libs used for testing purposes, but not needed in a consuming app
        this.testDeps = [
            'node_modules/manifesto.js/dist/client/manifesto.js'
        ];
        this.testDepsDir = './test/js';
        this.typings = [
            'node_modules/base-component/dist/base-component.d.ts'
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
            'typings/**/*.ts'];
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