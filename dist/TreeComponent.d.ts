/// <reference types="@iiif/base-component" />
/// <reference types="@iiif/manifold" />
declare namespace IIIFComponents {
    interface ITreeComponent extends _Components.IBaseComponent {
        deselectCurrentNode(): void;
        getNodeById(id: string): Manifold.ITreeNode;
        selectNode(node: Manifold.ITreeNode): void;
    }
    interface ITreeComponentData {
        [key: string]: any;
        autoExpand?: boolean;
        branchNodesSelectable?: boolean;
        branchNodesExpandOnClick?: boolean;
        helper?: Manifold.IHelper | null;
        topRangeIndex?: number;
        treeSortType?: Manifold.TreeSortType;
    }
    class TreeComponent extends _Components.BaseComponent implements ITreeComponent {
        options: _Components.IBaseComponentOptions;
        private _$tree;
        private _allNodes;
        private _multiSelectableNodes;
        private _selectedNode;
        private _rootNode;
        constructor(options: _Components.IBaseComponentOptions);
        protected _init(): boolean;
        set(data: ITreeComponentData): void;
        private _getMultiSelectState;
        data(): ITreeComponentData;
        allNodesSelected(): boolean;
        private _getMultiSelectableNodes;
        private _nodeIsMultiSelectable;
        private _getAllNodes;
        getMultiSelectedNodes(): Manifold.ITreeNode[];
        getNodeById(id: string): Manifold.ITreeNode;
        private _setNodeSelected;
        private _setNodeExpanded;
        private _setNodeMultiSelected;
        private _setNodeMultiSelectEnabled;
        selectPath(path: string): void;
        deselectCurrentNode(): void;
        selectNode(node: Manifold.ITreeNode): void;
        getNodeByPath(parentNode: Manifold.ITreeNode, path: string[]): Manifold.ITreeNode;
        show(): void;
        hide(): void;
        protected _resize(): void;
    }
}
declare namespace IIIFComponents.TreeComponent {
    class Events {
        static TREE_NODE_MULTISELECTED: string;
        static TREE_NODE_SELECTED: string;
    }
}
interface JQuery {
    link: any;
    render: any;
}
interface JQueryStatic {
    observable: any;
    templates: any;
    views: any;
    view: any;
}
