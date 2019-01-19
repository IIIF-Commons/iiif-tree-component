namespace IIIFComponents {

    type MultiSelectableTreeNode = manifold.MultiSelectableTreeNode;
    type MultiSelectState = manifold.MultiSelectState;
    type MultiSelectableRange = manifold.MultiSelectableRange;
    type TreeSortType = manifold.TreeSortType;

    export interface ITreeComponentData {
        [key: string]: any;
        autoExpand?: boolean;
        branchNodesSelectable?: boolean;
        branchNodesExpandOnClick?: boolean;
        helper?: manifold.Helper | null;
        topRangeIndex?: number;
        treeSortType?: TreeSortType;
    }

    export class TreeComponent extends _Components.BaseComponent {

        public options: _Components.IBaseComponentOptions;
        private _$tree: JQuery;
        private _flattenedTree: MultiSelectableTreeNode[] | null; // cache
        private _data: ITreeComponentData = this.data();
        private _multiSelectableNodes: MultiSelectableTreeNode[] | null; // cache
        private _rootNode: MultiSelectableTreeNode;
        private _selectedNode: MultiSelectableTreeNode;

        constructor(options: _Components.IBaseComponentOptions) {
            super(options);
            this._data = this.options.data;
            this._init();
            this._resize();
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
                        const node: MultiSelectableTreeNode = this.data;
                        that._setNodeExpanded(node, !node.expanded);
                    },
                    toggleMultiSelect: function() {
                        const node: MultiSelectableTreeNode = this.data;
                        that._setNodeMultiSelected(node, !!!node.multiSelected);
                        
                        if (node.isRange()) {
                            const multiSelectState: MultiSelectState | null = that._getMultiSelectState();

                            if (multiSelectState) {
                                multiSelectState.selectRange(<MultiSelectableRange>node.data, node.multiSelected);   
                            }
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
                                
                                const node: MultiSelectableTreeNode = self.data;

                                if (node.nodes.length && that._data.branchNodesExpandOnClick) {
                                    self.toggleExpanded();
                                }

                                if (node.multiSelectEnabled){
                                    self.toggleMultiSelect();
                                } else {
                                    if (!node.nodes.length) {
                                        that.fire(TreeComponent.Events.TREE_NODE_SELECTED, node);
                                        that.selectNode(node);
                                    } else if (that._data.branchNodesSelectable) {
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

            this._data = Object.assign(this._data, data);

            if (!this._data.helper) {
                return;
            }

            this._rootNode = this._data.helper.getTree(this._data.topRangeIndex, this._data.treeSortType) as MultiSelectableTreeNode;
            this._flattenedTree = null; // delete cache
            this._multiSelectableNodes = null; // delete cache
            this._$tree.link($.templates.pageTemplate, this._rootNode);

            const multiSelectState: MultiSelectState | null = this._getMultiSelectState();

            if (multiSelectState) {
                for (let i = 0; i < multiSelectState.ranges.length; i++) {
                    const range: MultiSelectableRange = multiSelectState.ranges[i];
                    const node: MultiSelectableTreeNode = this._getMultiSelectableNodes().filter(n => n.data.id === range.id)[0];
                    if (node) {
                        this._setNodeMultiSelectEnabled(node, (<MultiSelectableRange>range).multiSelectEnabled);
                        this._setNodeMultiSelected(node, range.multiSelected);
                    }
                }
            }

            if (this._data.autoExpand) {
                const allNodes: MultiSelectableTreeNode[] = this._getAllNodes();

                allNodes.forEach((node: MultiSelectableTreeNode, index: number) => {
                    //if (node.nodes && node.nodes.length) {
                        this._setNodeExpanded(node, true);
                    //}
                });
            }
        }
        
        private _getMultiSelectState(): MultiSelectState | null {

            if (this._data.helper) {
                return this._data.helper.getMultiSelectState();
            }
            return null;
        } 

        public data(): ITreeComponentData {
            return <ITreeComponentData>{
                autoExpand: false,
                branchNodesExpandOnClick: true,
                branchNodesSelectable: true,
                helper: null,
                topRangeIndex: 0,
                treeSortType: manifold.TreeSortType.NONE
            }
        }

        public allNodesSelected(): boolean {
            const applicableNodes: MultiSelectableTreeNode[] = this._getMultiSelectableNodes();
            const multiSelectedNodes: MultiSelectableTreeNode[] = this.getMultiSelectedNodes();

            return applicableNodes.length === multiSelectedNodes.length;
        }

        private _getMultiSelectableNodes(): MultiSelectableTreeNode[] {

            // if cached
            if (this._multiSelectableNodes){
                return this._multiSelectableNodes;
            }

            const allNodes: MultiSelectableTreeNode[] | null = this._getAllNodes();

            if (allNodes) {
                return this._multiSelectableNodes = allNodes.filter(n => this._nodeIsMultiSelectable(n));
            }
            
            return [];
        }

        private _nodeIsMultiSelectable(node: MultiSelectableTreeNode): boolean {

            if ((node.data.type === manifesto.TreeNodeType.MANIFEST && (node.nodes && node.nodes.length > 0)) || node.data.type === manifesto.TreeNodeType.RANGE) {
                return true;
            }

            return false;
        }

        private _getAllNodes(): MultiSelectableTreeNode[] {

            // if cached
            if (this._flattenedTree) {
                return this._flattenedTree;
            }
            
            if (this._data.helper) {
                return this._flattenedTree = this._data.helper.getFlattenedTree(this._rootNode) as MultiSelectableTreeNode[];
            }
            
            return [];
        }

        public getMultiSelectedNodes(): MultiSelectableTreeNode[] {
            return this._getAllNodes().filter((n) => this._nodeIsMultiSelectable(n) && n.multiSelected);
        }

        public getNodeById(id: string): MultiSelectableTreeNode {
            return this._getAllNodes().filter((n) => n.id === id)[0];
        }

        // private _multiSelectTreeNode(node: MultiSelectableTreeNode, isSelected: boolean): void {
        //     if (!this._nodeIsMultiSelectable(node)) return;

        //     this._setNodeMultiSelected(node, isSelected);

        //     // recursively select/deselect child nodes
        //     for (let i = 0; i < node.nodes.length; i++){
        //         const n: MultiSelectableTreeNode = <MultiSelectableTreeNode>node.nodes[i];
        //         this._multiSelectTreeNode(n, isSelected);
        //     }
        // }

        // private _updateParentNodes(node: MultiSelectableTreeNode): void {

        //     const parentNode: MultiSelectableTreeNode = <MultiSelectableTreeNode>node.parentNode;

        //     if (!parentNode) return;

        //     // expand parents if selected
        //     if (node.selected) {
        //         this._expandParents(node);
        //     }

        //     // get the number of selected children.
        //     const checkedCount: number = parentNode.nodes.en().where(n => (<MultiSelectableTreeNode>n).multiSelected).count();

        //     // if any are checked, check the parent.
        //     this._setNodeMultiSelected(parentNode, checkedCount > 0);

        //     const indeterminate: boolean = checkedCount > 0 && checkedCount < parentNode.nodes.length;

        //     this._setNodeIndeterminate(parentNode, indeterminate);

        //     // cascade up tree
        //     this._updateParentNodes(parentNode);
        // }

        // private _expandParents(node: MultiSelectableTreeNode): void{
        //     if (!node.parentNode) return;
        //     this._setNodeExpanded(<MultiSelectableTreeNode>node.parentNode, true);
        //     this._expandParents(<MultiSelectableTreeNode>node.parentNode);
        // }

        private _setNodeSelected(node: MultiSelectableTreeNode, selected: boolean): void {
            $.observable(node).setProperty("selected", selected);
        }

        private _setNodeExpanded(node: MultiSelectableTreeNode, expanded: boolean): void {
            $.observable(node).setProperty("expanded", expanded);
        }

        private _setNodeMultiSelected(node: MultiSelectableTreeNode, selected: boolean): void {
            $.observable(node).setProperty("multiSelected", selected);

            // if (!selected){
            //     this._setNodeIndeterminate(node, false);
            // }
        }
        
        private _setNodeMultiSelectEnabled(node: MultiSelectableTreeNode, enabled: boolean): void {
            $.observable(node).setProperty("multiSelectEnabled", enabled);
        }

        // private _setNodeIndeterminate(node: MultiSelectableTreeNode, indeterminate: boolean): void {
        //     const $checkbox: JQuery = this._getNodeCheckbox(node);
        //     $checkbox.prop("indeterminate", indeterminate);
        // }

        // private _getNodeCheckbox(node: MultiSelectableTreeNode): JQuery {
        //     return $("#tree-checkbox-" + node.id);
        // }

        // private _getNodeSiblings(node: MultiSelectableTreeNode): MultiSelectableTreeNode[] {
        //     const siblings: MultiSelectableTreeNode[] = [];

        //     if (node.parentNode){
        //         siblings = <MultiSelectableTreeNode[]>node.parentNode.nodes.en().where(n => n !== node).toArray();
        //     }

        //     return siblings;
        // }

        public selectPath(path: string): void {
            if (!this._rootNode) return;

            const pathArr = path.split("/");
            if (pathArr.length >= 1) pathArr.shift();
            const node: MultiSelectableTreeNode = this.getNodeByPath(this._rootNode, pathArr);

            this.selectNode(node);
        }

        public deselectCurrentNode(): void {
            if (this._selectedNode) this._setNodeSelected(this._selectedNode, false);
        }

        public selectNode(node: MultiSelectableTreeNode): void {
            if (!this._rootNode) return;

            this.deselectCurrentNode();
            this._selectedNode = node;
            this._setNodeSelected(this._selectedNode, true);
        }

        // walks down the tree using the specified path e.g. [2,2,0]
        public getNodeByPath(parentNode: MultiSelectableTreeNode, path: string[]): MultiSelectableTreeNode {
            if (path.length === 0) return parentNode;
            const index: number = Number(path.shift());
            const node = parentNode.nodes[index];
            return this.getNodeByPath(<MultiSelectableTreeNode>node, path);
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