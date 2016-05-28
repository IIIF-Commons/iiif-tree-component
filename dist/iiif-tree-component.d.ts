// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme

declare var EventEmitter2: IEventEmitter2;
declare namespace IIIFComponents {
    class BaseComponent {
        constructor();
        emitEvent(event: string, ...args: any[]): void;
    }
}

declare namespace IIIFComponents {
    class Events {
        static TEST: string;
    }
}


interface IIIIFTreeComponent {
    create: (options: IIIFComponents.ITreeComponentOptions) => IIIFComponents.TreeComponent;
}

declare namespace IIIFComponents {
    interface ITreeComponentOptions {
        element?: string;
    }
}

declare namespace IIIFComponents {
    class TreeComponent extends BaseComponent {
        options: ITreeComponentOptions;
        private _$element;
        private _$tree;
        constructor(options: ITreeComponentOptions);
        test(): void;
        private _init();
        private _getDefaultOptions();
        _resize(): void;
    }
}
