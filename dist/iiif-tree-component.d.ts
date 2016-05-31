// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme

declare namespace IIIFComponents {
    interface ITreeComponent extends Components.IBaseComponent {
    }
}

declare namespace IIIFComponents {
    interface ITreeComponentOptions extends Components.IBaseComponentOptions {
    }
}

declare namespace IIIFComponents {
    class TreeComponent extends Components.BaseComponent implements ITreeComponent {
        private _$tree;
        constructor(options: ITreeComponentOptions);
        test(): void;
        protected _init(): boolean;
        protected _getDefaultOptions(): ITreeComponentOptions;
        protected _resize(): void;
    }
}
declare namespace IIIFComponents.TreeComponent {
    class Events {
        static TEST: string;
    }
}
