namespace IIIFComponents {
    export class TreeComponent extends BaseComponent {

        public options: ITreeComponentOptions;

        private _$element: JQuery;
        private _$tree: JQuery;

        constructor(options: ITreeComponentOptions) {
            
            super();
            
            this.options = $.extend(this._getDefaultOptions(), options);
            
            this._init();
            
            this._$element.append("I am a tree component");
            
            this._resize();
        }

        public test(): void {
            this.emitEvent(Events.TEST, [1, 2, 'three']);
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
        
        private _getDefaultOptions(): ITreeComponentOptions {
            return <ITreeComponentOptions>{
            }
        }
        
        _resize(): void {
            
        }
    }
}