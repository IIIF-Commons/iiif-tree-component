namespace IIIFComponents {

    export interface ITreeComponentData {
        [key: string]: any;
        autoExpand?: boolean;
        branchNodesSelectable?: boolean;
        branchNodesExpandOnClick?: boolean;
        helper?: Manifold.IHelper | null;
        topRangeIndex?: number;
        treeSortType?: Manifold.TreeSortType;
    }

    export class TreeComponent extends _Components.BaseComponent {

        public options: _Components.IBaseComponentOptions;
        private _$tree: JQuery;
        private _allNodes: Manifold.ITreeNode[] | null; // cache
        private _multiSelectableNodes: Manifold.ITreeNode[] | null; // cache
        private _selectedNode: Manifold.ITreeNode;
        private _rootNode: Manifold.ITreeNode;

        constructor(options: _Components.IBaseComponentOptions) {
            super(options);
            this._init();
        }

        protected _init(): boolean {
            const success: boolean = super._init();

            if (!success) {
                console.error("TreeComponent failed to initialise");
            }
            
            const that = this;
            
            this._$tree = $('<ul class="tree"></ul>');
            this._$element.append(this._$tree);

            $.templates({
                pageTemplate:   '{^{for nodes}}\
                                    {^{tree/}}\
                                {{/for}}',
                treeTemplate:   '<li>\
                                    {^{if nodes && nodes.length}}\
                                        <div class="toggle" data-link="class{merge:expanded toggle=\'expanded\'}"></div>\
                                    {{else}}\
                                    <div class="spacer"></div>\
                                    {{/if}}\
                                    {^{if multiSelectEnabled}}\
                                        <input id="tree-checkbox-{{>id}}" type="checkbox" data-link="checked{:multiSelected ? \'checked\' : \'\'}" class="multiSelect" />\
                                    {{/if}}\
                                    {^{if selected}}\
                                        <a id="tree-link-{{>id}}" href="#" title="{{>label}}" class="selected">{{>label}}</a>\
                                    {{else}}\
                                        <a id="tree-link-{{>id}}" href="#" title="{{>label}}">{{>label}}</a>\
                                    {{/if}}\
                                </li>\
                                {^{if expanded}}\
                                    <li>\
                                        <ul>\
                                            {^{for nodes}}\
                                                {^{tree/}}\
                                            {{/for}}\
                                        </ul>\
                                    </li>\
                                {{/if}}'
            });

            $.views.tags({
                tree: {
                    toggleExpanded: function() {
                        const node: Manifold.ITreeNode = this.data;
                        that._setNodeExpanded(node, !node.expanded);
                    },
                    toggleMultiSelect: function() {
                        const node: Manifold.ITreeNode = this.data;
                        that._setNodeMultiSelected(node, !!!node.multiSelected);
                        
                        if (node.isRange()) {
                            that._getMultiSelectState().selectRange(<Manifold.IRange>node.data, node.multiSelected);      
                        }
                        
                        that.fire(TreeComponent.Events.TREE_NODE_MULTISELECTED, node);
                    },
                    init: function (tagCtx, linkCtx, ctx) {
                        this.data = tagCtx.view.data;
                        //this.data.text = this.data.label;
                    },
                    onAfterLink: function () {
                        const self: any = this;

                        self.contents('li').first()
                            .on('click', '.toggle', function() {
                                self.toggleExpanded();
                            }).on('click', 'a', function(e) {
                                e.preventDefault();
                                
                                const node: Manifold.ITreeNode = self.data;

                                if (node.nodes.length && that.options.data.branchNodesExpandOnClick) {
                                    self.toggleExpanded();
                                }

                                if (node.multiSelectEnabled){
                                    self.toggleMultiSelect();
                                } else {
                                    if (!node.nodes.length) {
                                        that.fire(TreeComponent.Events.TREE_NODE_SELECTED, node);
                                        that.selectNode(node);
                                    } else if (that.options.data.branchNodesSelectable) {
                                        that.fire(TreeComponent.Events.TREE_NODE_SELECTED, node);
                                        that.selectNode(node);
                                    }
                                }
                            }).on('click', 'input.multiSelect', function(e) {
                                self.toggleMultiSelect();
                            });
                    },
                    template: $.templates.treeTemplate
                }
            });

            return success;
        }
        
        public set(data: ITreeComponentData): void {

            this.options.data = data;

            this._rootNode = this.options.data.helper.getTree(this.options.data.topRangeIndex, this.options.data.treeSortType);
            this._allNodes = null; // delete cache
            this._multiSelectableNodes = null; // delete cache
            this._$tree.link($.templates.pageTemplate, this._rootNode);

            const multiSelectState: Manifold.MultiSelectState = this._getMultiSelectState();

            for (let i = 0; i < multiSelectState.ranges.length; i++) {
                const range: Manifold.IRange = multiSelectState.ranges[i];
                const node: Manifold.ITreeNode = this._getMultiSelectableNodes().en().where(n => n.data.id === range.id).first();
                if (node){
                    this._setNodeMultiSelectEnabled(node, (<Manifold.IMultiSelectable>range).multiSelectEnabled);
                    this._setNodeMultiSelected(node, range.multiSelected);
                }
            }

            if (this.options.data.autoExpand) {
                const allNodes: Manifesto.ITreeNode[] = this._getAllNodes();

                allNodes.forEach((node: Manifold.ITreeNode, index: number) => {
                    if (node.nodes.length) {
                        this._setNodeExpanded(node, true);
                    }
                });
            }
        }
        
        private _getMultiSelectState(): Manifold.MultiSelectState {
            return this.options.data.helper.getMultiSelectState();
        } 

        public data(): ITreeComponentData {
            return <ITreeComponentData>{
                autoExpand: false,
                branchNodesExpandOnClick: true,
                branchNodesSelectable: true,
                helper: null,
                topRangeIndex: 0,
                treeSortType: Manifold.TreeSortType.NONE
            }
        }

        public allNodesSelected(): boolean {
            const applicableNodes: Manifold.ITreeNode[] = this._getMultiSelectableNodes();
            const multiSelectedNodes: Manifold.ITreeNode[] = this.getMultiSelectedNodes();

            return applicableNodes.length === multiSelectedNodes.length;
        }

        private _getMultiSelectableNodes(): Manifold.ITreeNode[] {

            // if cached
            if (this._multiSelectableNodes){
                return this._multiSelectableNodes;
            }

            return this._multiSelectableNodes = this._getAllNodes().en().where((n) => this._nodeIsMultiSelectable(n)).toArray();
        }

        private _nodeIsMultiSelectable(node: Manifold.ITreeNode): boolean {
            return (node.isManifest() && node.nodes.length > 0 || node.isRange());
        }

        private _getAllNodes(): Manifold.ITreeNode[] {

            // if cached
            if (this._allNodes) {
                return this._allNodes;
            }
            
            return this._allNodes = <Manifold.ITreeNode[]>this._rootNode.nodes.en().traverseUnique(node => node.nodes).toArray();
        }

        public getMultiSelectedNodes(): Manifold.ITreeNode[] {
            return this._getAllNodes().en().where((n) => this._nodeIsMultiSelectable(n) && n.multiSelected).toArray();
        }

        public getNodeById(id: string): Manifold.ITreeNode {
            return this._getAllNodes().en().where((n) => n.id === id).first();
        }

        // private _multiSelectTreeNode(node: Manifold.ITreeNode, isSelected: boolean): void {
        //     if (!this._nodeIsMultiSelectable(node)) return;

        //     this._setNodeMultiSelected(node, isSelected);

        //     // recursively select/deselect child nodes
        //     for (let i = 0; i < node.nodes.length; i++){
        //         const n: Manifold.ITreeNode = <Manifold.ITreeNode>node.nodes[i];
        //         this._multiSelectTreeNode(n, isSelected);
        //     }
        // }

        // private _updateParentNodes(node: Manifold.ITreeNode): void {

        //     const parentNode: Manifold.ITreeNode = <Manifold.ITreeNode>node.parentNode;

        //     if (!parentNode) return;

        //     // expand parents if selected
        //     if (node.selected) {
        //         this._expandParents(node);
        //     }

        //     // get the number of selected children.
        //     const checkedCount: number = parentNode.nodes.en().where(n => (<Manifold.ITreeNode>n).multiSelected).count();

        //     // if any are checked, check the parent.
        //     this._setNodeMultiSelected(parentNode, checkedCount > 0);

        //     const indeterminate: boolean = checkedCount > 0 && checkedCount < parentNode.nodes.length;

        //     this._setNodeIndeterminate(parentNode, indeterminate);

        //     // cascade up tree
        //     this._updateParentNodes(parentNode);
        // }

        // private _expandParents(node: Manifold.ITreeNode): void{
        //     if (!node.parentNode) return;
        //     this._setNodeExpanded(<Manifold.ITreeNode>node.parentNode, true);
        //     this._expandParents(<Manifold.ITreeNode>node.parentNode);
        // }

        private _setNodeSelected(node: Manifold.ITreeNode, selected: boolean): void {
            $.observable(node).setProperty("selected", selected);
        }

        private _setNodeExpanded(node: Manifold.ITreeNode, expanded: boolean): void {
            $.observable(node).setProperty("expanded", expanded);
        }

        private _setNodeMultiSelected(node: Manifold.ITreeNode, selected: boolean): void {
            $.observable(node).setProperty("multiSelected", selected);

            // if (!selected){
            //     this._setNodeIndeterminate(node, false);
            // }
        }
        
        private _setNodeMultiSelectEnabled(node: Manifold.ITreeNode, enabled: boolean): void {
            $.observable(node).setProperty("multiSelectEnabled", enabled);
        }

        // private _setNodeIndeterminate(node: Manifold.ITreeNode, indeterminate: boolean): void {
        //     const $checkbox: JQuery = this._getNodeCheckbox(node);
        //     $checkbox.prop("indeterminate", indeterminate);
        // }

        // private _getNodeCheckbox(node: Manifold.ITreeNode): JQuery {
        //     return $("#tree-checkbox-" + node.id);
        // }

        // private _getNodeSiblings(node: Manifold.ITreeNode): Manifold.ITreeNode[] {
        //     const siblings: Manifold.ITreeNode[] = [];

        //     if (node.parentNode){
        //         siblings = <Manifold.ITreeNode[]>node.parentNode.nodes.en().where(n => n !== node).toArray();
        //     }

        //     return siblings;
        // }

        public selectPath(path: string): void {
            if (!this._rootNode) return;

            const pathArr = path.split("/");
            if (pathArr.length >= 1) pathArr.shift();
            const node: Manifold.ITreeNode = this.getNodeByPath(this._rootNode, pathArr);

            this.selectNode(node);
        }

        public deselectCurrentNode(): void {
            if (this._selectedNode) this._setNodeSelected(this._selectedNode, false);
        }

        public selectNode(node: Manifold.ITreeNode): void {
            if (!this._rootNode) return;

            this.deselectCurrentNode();
            this._selectedNode = node;
            this._setNodeSelected(this._selectedNode, true);
        }

        // walks down the tree using the specified path e.g. [2,2,0]
        public getNodeByPath(parentNode: Manifold.ITreeNode, path: string[]): Manifold.ITreeNode {
            if (path.length === 0) return parentNode;
            const index: number = Number(path.shift());
            const node = parentNode.nodes[index];
            return this.getNodeByPath(<Manifold.ITreeNode>node, path);
        }

        public show(): void {
            this._$element.show();
        }

        public hide(): void {
             this._$element.hide();
        }
        
        protected _resize(): void {

        }
    }
}

namespace IIIFComponents.TreeComponent {
    export class Events {
        static TREE_NODE_MULTISELECTED: string = 'treeNodeMultiSelected';
        static TREE_NODE_SELECTED: string = 'treeNodeSelected';
    }
}

(function(g: any) {
    if (!g.IIIFComponents){
        g.IIIFComponents = IIIFComponents;
    } else {
        g.IIIFComponents.TreeComponent = IIIFComponents.TreeComponent;
    }
})(window);

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