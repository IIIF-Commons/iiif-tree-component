// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme
interface JQuery {
    // jsviews
    link: any;
    render: any;
}

interface JQueryStatic {
    // jsviews
    observable: any;
    templates: any;
    views: any;
    view: any;
}

declare namespace IIIFComponents {
    interface ITreeComponent extends Components.IBaseComponent {
    }
}

declare namespace IIIFComponents {
    interface ITreeComponentOptions extends Components.IBaseComponentOptions {
        rootNode: Manifold.ITreeNode;
        multiSelectState: Manifold.MultiSelectState;
    }
}

declare namespace IIIFComponents {
    class TreeComponent extends Components.BaseComponent implements ITreeComponent {
        options: ITreeComponentOptions;
        private _$tree;
        private _allNodes;
        private _multiSelectableNodes;
        private _selectedNode;
        private _multiSelectState;
        private _rootNode;
        constructor(options: ITreeComponentOptions);
        protected _init(): boolean;
        protected _getDefaultOptions(): ITreeComponentOptions;
        updateMultiSelectState(state: Manifold.MultiSelectState): void;
        allNodesSelected(): boolean;
        private _getMultiSelectableNodes();
        private _nodeIsMultiSelectable(node);
        private _getAllNodes();
        getMultiSelectedNodes(): Manifold.ITreeNode[];
        getNodeById(id: string): Manifold.ITreeNode;
        private _multiSelectTreeNode(node, isSelected);
        private _updateParentNodes(node);
        private _expandParents(node);
        private _setNodeSelected(node, selected);
        private _setNodeExpanded(node, expanded);
        private _setNodeMultiSelected(node, selected);
        private _setNodeMultiSelectEnabled(node, enabled);
        private _setNodeIndeterminate(node, indeterminate);
        private _getNodeCheckbox(node);
        private _getNodeSiblings(node);
        selectPath(path: string): void;
        deselectCurrentNode(): void;
        selectNode(node: any): void;
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
