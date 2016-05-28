declare var EventEmitter2: IEventEmitter2;

module IIIFTreeComponent {
    export class Component {

        public options: IOptions;

        private _$element: JQuery;
        private _$tree: JQuery;

        constructor(options: IOptions) {

            this.options = $.extend(this._getDefaultOptions(), options);
            
            this._init();
            
            this._$element.append("I am a tree component");
            
            this._resize();
        }
        
        public test(): void {
            (<any>this).emit('test'); // todo: nicer way to cast 'this'?
        }
     
        private _init(): boolean {

            this._$element = $(this.options.element);
            this._$element.empty();

            if (!this._$element.length){
                console.log('element not found');
                return false;
            }

            return true;
        }
        
        private _getDefaultOptions(): IOptions {
            return <IOptions>{
            }
        }
        
        _resize(): void {
            
        }
    }
    
    applyMixins(Component, [EventEmitter2]);

    function applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
}