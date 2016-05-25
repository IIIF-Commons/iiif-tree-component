var metadata = require('./package');

var GulpConfig = (function () {
    function GulpConfig() {
        this.name = metadata.name;
        this.dist = './dist';
        this.header = '// ' + this.name + ' v' + metadata.version + ' ' + metadata.homepage + '\n';
        this.jsOut = this.name + '.js';
        this.dtsOut = this.name + '.d.ts';
        this.tsSrc = [
            'src/_references.ts',
            'src/*.ts'];
    }
    return GulpConfig;
})();

module.exports = GulpConfig;