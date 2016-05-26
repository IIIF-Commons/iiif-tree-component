// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme

declare module IIIFTreeComponent {
    class Component {
        options: IOptions;
        private _$element;
        constructor(options: IOptions);
        private _init();
        private _getDefaultOptions();
        _resize(): void;
    }
}


interface IIIIFTreeComponent {
    create: (options: IIIFTreeComponent.IOptions) => IIIFTreeComponent.Component;
}

declare module IIIFTreeComponent {
    interface IOptions {
        element?: string;
    }
}
