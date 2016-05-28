// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme

declare var EventEmitter2: IEventEmitter2;
declare module IIIFTreeComponent {
    class BaseComponent {
        constructor();
        emitEvent(event: string, ...args: any[]): void;
    }
}

declare module IIIFTreeComponent {
    class Component extends BaseComponent {
        options: IOptions;
        private _$element;
        private _$tree;
        constructor(options: IOptions);
        test(): void;
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
