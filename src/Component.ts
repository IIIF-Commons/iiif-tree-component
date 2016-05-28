module IIIFTreeComponent {
    export class Component extends BaseComponent {

        public options: IOptions;

        private _$element: JQuery;
        private _$tree: JQuery;

        constructor(options: IOptions) {
            
            super();
            
            this.options = $.extend(this._getDefaultOptions(), options);
            
            this._init();
            
            this._$element.append("I am a tree component");
            
            this._resize();
        }

        public test(): void {
            this.emitEvent('test', [1, 2, 'three']);
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
}