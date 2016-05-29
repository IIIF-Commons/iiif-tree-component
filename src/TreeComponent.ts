namespace IIIFComponents {
    export class TreeComponent extends Components.BaseComponent implements ITreeComponent {

        private _$tree: JQuery;

        constructor(options: ITreeComponentOptions) {
            super(options);
            
            this._init();
            this._resize();
        }

        public test(): void {
            this.emitEvent(Events.TEST, [1, 2, 'three']);
        }

        protected _init(): boolean {
            var success: boolean = super._init();

            if (success){
                this._$element.append("I am a tree component");
            } else {
                console.error("TreeComponent failed to initialise");
            }

            return success;
        }
        
        protected _getDefaultOptions(): ITreeComponentOptions {
            return <ITreeComponentOptions>{
            }
        }
        
        protected _resize(): void {
            
        }
    }
}

module.exports = (function(w) {
    if (!w.IIIFComponents){
        w.IIIFComponents = IIIFComponents;
    } else {
        w.IIIFComponents.TreeComponent = IIIFComponents.TreeComponent;
    }
})(window);