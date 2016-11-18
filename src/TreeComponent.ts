namespace IIIFComponents {
    export class TreeComponent extends _Components.BaseComponent implements ITreeComponent {

        public options: ITreeComponentOptions;
        private _$tree: JQuery;
        private _allNodes: Manifold.ITreeNode[]; // cache
        private _multiSelectableNodes: Manifold.ITreeNode[]; // cache
        private _selectedNode: Manifold.ITreeNode;
        private _rootNode: Manifold.ITreeNode;

        constructor(options: ITreeComponentOptions) {
            super(options);
            this._init();
        }

        protected _init(): boolean {
            var success: boolean = super._init();

            if (!success){
                console.error("TreeComponent failed to initialise");
            }
            
            var that = this;
            
            this._$tree = $('<ul class="tree"></ul>');
            this._$element.append(this._$tree);

            $.templates({
                pageTemplate: '{^{for nodes}}\
                                {^{tree/}}\
                            {{/for}}',
                treeTemplate: '<li>\
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
                        var node: Manifold.ITreeNode = this.data;
                        that._setNodeExpanded(node, !node.expanded);
                    },
                    toggleMultiSelect: function() {
                        var node: Manifold.ITreeNode = this.data;
                        that._setNodeMultiSelected(node, !!!node.multiSelected);
                        
                        if (node.isRange()){
                            that._getMultiSelectState().selectRange(<Manifold.IRange>node.data, node.multiSelected);      
                        }
                        
                        that._emit(TreeComponent.Events.TREE_NODE_MULTISELECTED, node);
                    },
                    init: function (tagCtx, linkCtx, ctx) {
                        this.data = tagCtx.view.data;
                        //this.data.text = this.data.label;
                    },
                    onAfterLink: function () {
                        var self: any = this;

                        self.contents('li').first()
                            .on('click', '.toggle', function() {
                                self.toggleExpanded();
                            }).on('click', 'a', function(e) {
                                e.preventDefault();
                                
                                var node: Manifold.ITreeNode = self.data;

                                if (node.nodes.length) self.toggleExpanded();

                                if (node.multiSelectEnabled){
                                    self.toggleMultiSelect();
                                } else {
                                    that._emit(TreeComponent.Events.TREE_NODE_SELECTED, node);

                                    if (!node.nodes.length) {
                                        that.selectNode(node);
                                    } else if (that.options.branchNodesSelectable) {
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
        
        public databind(): void {
            this._rootNode = this.options.helper.getTree(this.options.topRangeIndex, this.options.treeSortType);
            this._allNodes = null; // delete cache
            this._multiSelectableNodes = null; // delete cache
            this._$tree.link($.templates.pageTemplate, this._rootNode);
        }

        // todo: this should be removed in order to fit with the 'reactive' pattern
        // all changes shold be a result of calling databind() with options/props. 
        public updateMultiSelectState(): void {
            var state: Manifold.MultiSelectState = this._getMultiSelectState();

            for (var i = 0; i < state.ranges.length; i++) {
                var range: Manifold.IRange = state.ranges[i];
                var node: Manifold.ITreeNode = this._getMultiSelectableNodes().en().where(n => n.data.id === range.id).first();
                if (node){
                    this._setNodeMultiSelectEnabled(node, (<Manifold.IMultiSelectable>range).multiSelectEnabled);
                    this._setNodeMultiSelected(node, range.multiSelected);
                }
            }
        }
        
        private _getMultiSelectState(): Manifold.MultiSelectState {
            return this.options.helper.getMultiSelectState();
        } 

        protected _getDefaultOptions(): ITreeComponentOptions {
            return <ITreeComponentOptions>{
                branchNodesSelectable: true,
                helper: null,
                topRangeIndex: 0,
                treeSortType: Manifold.TreeSortType.NONE
            }
        }

        public allNodesSelected(): boolean {
            var applicableNodes: Manifold.ITreeNode[] = this._getMultiSelectableNodes();
            var multiSelectedNodes: Manifold.ITreeNode[] = this.getMultiSelectedNodes();

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
            if (this._allNodes){
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

        private _multiSelectTreeNode(node: Manifold.ITreeNode, isSelected: boolean): void {
            if (!this._nodeIsMultiSelectable(node)) return;

            this._setNodeMultiSelected(node, isSelected);

            // recursively select/deselect child nodes
            for (var i = 0; i < node.nodes.length; i++){
                var n: Manifold.ITreeNode = <Manifold.ITreeNode>node.nodes[i];
                this._multiSelectTreeNode(n, isSelected);
            }
        }

        // private _updateParentNodes(node: Manifold.ITreeNode): void {

        //     var parentNode: Manifold.ITreeNode = <Manifold.ITreeNode>node.parentNode;

        //     if (!parentNode) return;

        //     // expand parents if selected
        //     if (node.selected) {
        //         this._expandParents(node);
        //     }

        //     // get the number of selected children.
        //     var checkedCount: number = parentNode.nodes.en().where(n => (<Manifold.ITreeNode>n).multiSelected).count();

        //     // if any are checked, check the parent.
        //     this._setNodeMultiSelected(parentNode, checkedCount > 0);

        //     var indeterminate: boolean = checkedCount > 0 && checkedCount < parentNode.nodes.length;

        //     this._setNodeIndeterminate(parentNode, indeterminate);

        //     // cascade up tree
        //     this._updateParentNodes(parentNode);
        // }

        private _expandParents(node: Manifold.ITreeNode): void{
            if (!node.parentNode) return;
            this._setNodeExpanded(<Manifold.ITreeNode>node.parentNode, true);
            this._expandParents(<Manifold.ITreeNode>node.parentNode);
        }

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
        //     var $checkbox: JQuery = this._getNodeCheckbox(node);
        //     $checkbox.prop("indeterminate", indeterminate);
        // }

        // private _getNodeCheckbox(node: Manifold.ITreeNode): JQuery {
        //     return $("#tree-checkbox-" + node.id);
        // }

        // private _getNodeSiblings(node: Manifold.ITreeNode): Manifold.ITreeNode[] {
        //     var siblings: Manifold.ITreeNode[] = [];

        //     if (node.parentNode){
        //         siblings = <Manifold.ITreeNode[]>node.parentNode.nodes.en().where(n => n !== node).toArray();
        //     }

        //     return siblings;
        // }

        public selectPath(path: string): void {
            if (!this._rootNode) return;

            var pathArr = path.split("/");
            if (pathArr.length >= 1) pathArr.shift();
            var node: Manifold.ITreeNode = this.getNodeByPath(this._rootNode, pathArr);

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
            var index = path.shift();
            var node = parentNode.nodes[index];
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

(function(w) {
    if (!w.IIIFComponents){
        w.IIIFComponents = IIIFComponents;
    } else {
        w.IIIFComponents.TreeComponent = IIIFComponents.TreeComponent;
    }
})(window);