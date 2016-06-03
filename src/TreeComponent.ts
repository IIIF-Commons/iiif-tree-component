namespace IIIFComponents {
    export class TreeComponent extends Components.BaseComponent implements ITreeComponent {

        private _$tree: JQuery;
        public options: ITreeComponentOptions;
        allNodes: Manifold.ITreeNode[];
        multiSelectableNodes: Manifold.ITreeNode[];
        elideCount: number;
        isOpen: boolean = false;
        selectedNode: Manifold.ITreeNode;
        multiSelectState: Manifold.MultiSelectState;

        public rootNode: Manifold.ITreeNode;

        constructor(options: ITreeComponentOptions) {
            super(options);
            this._init();
            this._reset();
        }

        protected _init(): boolean {
            var success: boolean = super._init();

            if (!success){
                console.error("TreeComponent failed to initialise");
            }
            
            var that = this;
            
            this.rootNode = this.options.rootNode;
            this.multiSelectState = this.options.multiSelectState;
            
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
                                {^{if multiSelectionEnabled}}\
                                        <input id="tree-checkbox-{{>id}}" type="checkbox" data-link="checked{:multiSelected ? \'checked\' : \'\'}" class="multiSelect" />\
                                {{/if}}\
                                {^{if selected}}\
                                    <a id="tree-link-{{>id}}" href="#" title="{{>label}}" class="selected" data-link="~elide(text)"></a>\
                                {{else}}\
                                    <a id="tree-link-{{>id}}" href="#" title="{{>label}}" data-link="~elide(text)"></a>\
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

            $.views.helpers({
                elide: function(text){
                    var $a = $((<any>this).linkCtx.elem);
                    var elideCount = Math.floor($a.parent().width() / 7); // todo: remove / 7
                    return Utils.Strings.htmlDecode(Utils.Strings.ellipsis(text, elideCount));
                    //https://github.com/BorisMoore/jsviews/issues/296
                }
            });

            $.views.tags({
                tree: {
                    toggleExpanded: function() {
                        that._setNodeExpanded(this.data, !this.data.expanded);
                    },
                    toggleMultiSelect: function() {
                        that._multiSelectTreeNode(this.data, !this.data.multiSelected);
                        that._updateParentNodes(this.data);
                    },
                    init: function (tagCtx, linkCtx, ctx) {
                        var data = tagCtx.view.data;
                        data.text = data.label;//Utils.Strings.htmlDecode(Utils.Strings.ellipsis(data.label, that.elideCount));
                        this.data = tagCtx.view.data;
                    },
                    onAfterLink: function () {
                        var self: any = this;

                        self.contents('li').first()
                            .on('click', '.toggle', function() {
                                self.toggleExpanded();
                            }).on('click', 'a', function(e) {
                                e.preventDefault();
                                if (self.data.nodes.length) self.toggleExpanded();

                                if (that.multiSelectState.enabled){
                                    self.toggleMultiSelect();
                                } else {
                                    that._emit(TreeComponent.Events.TREE_NODE_SELECTED, self.data.data);
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
        
        protected _getDefaultOptions(): ITreeComponentOptions {
            return <ITreeComponentOptions>{
            }
        }

        public updateMultiSelectState(state: Manifold.MultiSelectState): void {
            this.multiSelectState = state;

            for (var i = 0; i < this.multiSelectState.ranges.length; i++) {
                var range: Manifold.IRange = this.multiSelectState.ranges[i];
                var node: Manifold.ITreeNode = this._getMultiSelectableNodes().en().where(n => n.data.id === range.id).first();
                this._setNodeMultiSelected(node, range.multiSelected);
            }
            
            
            
            this._reset();
        }

        private _reset(): void {
            this.allNodes = null;
            this.multiSelectableNodes = null;
            this._setMultiSelectionEnabled(this.multiSelectState.enabled);
            this._$tree.link($.templates.pageTemplate, this.rootNode);
            this._resize();
        }

        public allNodesSelected(): boolean {
            var applicableNodes: Manifold.ITreeNode[] = this._getMultiSelectableNodes();
            var multiSelectedNodes: Manifold.ITreeNode[] = this.getMultiSelectedNodes();

            return applicableNodes.length === multiSelectedNodes.length;
        }

        private _getMultiSelectableNodes(): Manifold.ITreeNode[] {

            // if cached
            if (this.multiSelectableNodes){
                return this.multiSelectableNodes;
            }

            return this.multiSelectableNodes = this._getAllNodes().en().where((n) => this._nodeIsMultiSelectable(n)).toArray();
        }

        private _nodeIsMultiSelectable(node: Manifold.ITreeNode): boolean {
            return (node.isManifest() && node.nodes.length > 0 || node.isRange());
        }

        private _getAllNodes(): Manifold.ITreeNode[] {

            // if cached
            if (this.allNodes){
                return this.allNodes;
            }

            return this.allNodes = <Manifold.ITreeNode[]>this.rootNode.nodes.en().traverseUnique(node => node.nodes).toArray();
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
            
            this._emit(TreeComponent.Events.TREE_NODE_MULTISELECTED, node);
            this._emit(TreeComponent.Events.MULTISELECT_STATE_CHANGE, this.multiSelectState);
            
            // recursively select/deselect child nodes
            for (var i = 0; i < node.nodes.length; i++){
                var n: Manifold.ITreeNode = <Manifold.ITreeNode>node.nodes[i];
                this._multiSelectTreeNode(n, isSelected);
            }
        }

        private _updateParentNodes(node: Manifold.ITreeNode): void {

            var parentNode: Manifold.ITreeNode = <Manifold.ITreeNode>node.parentNode;

            if (!parentNode) return;

            // expand parents if selected
            if (node.selected) {
                this._expandParents(node);
            }

            // get the number of selected children.
            var checkedCount: number = parentNode.nodes.en().where(n => (<Manifold.ITreeNode>n).multiSelected).count();

            // if any are checked, check the parent.
            this._setNodeMultiSelected(parentNode, checkedCount > 0);

            var indeterminate: boolean = checkedCount > 0 && checkedCount < parentNode.nodes.length;

            this._setNodeIndeterminate(parentNode, indeterminate);

            // cascade up tree
            this._updateParentNodes(parentNode);
        }

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

            if (!selected){
                this._setNodeIndeterminate(node, false);
            }
        }

        private _setNodeIndeterminate(node: Manifold.ITreeNode, indeterminate: boolean): void {
            var $checkbox: JQuery = this._getNodeCheckbox(node);
            $checkbox.prop("indeterminate", indeterminate);
        }

        private _getNodeCheckbox(node: Manifold.ITreeNode): JQuery {
            return $("#tree-checkbox-" + node.id);
        }

        private _getNodeSiblings(node: Manifold.ITreeNode): Manifold.ITreeNode[] {
            var siblings: Manifold.ITreeNode[] = [];

            if (node.parentNode){
                siblings = <Manifold.ITreeNode[]>node.parentNode.nodes.en().where(n => n !== node).toArray();
            }

            return siblings;
        }

        private _setMultiSelectionEnabled(enabled: boolean): void {
            var nodes: Manifold.ITreeNode[] = this._getAllNodes();

            for (var i = 0; i < nodes.length; i++){
                var node: Manifold.ITreeNode = nodes[i];

                if (this._nodeIsMultiSelectable(node)){
                    node.multiSelectionEnabled = enabled;
                }
            }
        }

        public selectPath(path: string): void {
            if (!this.rootNode) return;

            var pathArr = path.split("/");
            if (pathArr.length >= 1) pathArr.shift();
            var node = this.getNodeByPath(this.rootNode, pathArr);

            this.selectNode(node);
        }

        deselectCurrentNode(): void {
            if (this.selectedNode) this._setNodeSelected(this.selectedNode, false);
        }

        selectNode(node: any): void{
            if (!this.rootNode) return;

            this.deselectCurrentNode();
            this.selectedNode = node;
            this._setNodeSelected(this.selectedNode, true);

            this._updateParentNodes(this.selectedNode);
        }

        // walks down the tree using the specified path e.g. [2,2,0]
        getNodeByPath(parentNode: Manifold.ITreeNode, path: string[]): Manifold.ITreeNode {
            if (path.length === 0) return parentNode;
            var index = path.shift();
            var node = parentNode.nodes[index];
            return this.getNodeByPath(<Manifold.ITreeNode>node, path);
        }

        public show(): void {
            this.isOpen = true;
            this._$element.show();
        }

        public hide(): void {
            this.isOpen = false;
            this._$element.hide();
        }

        private elide($a: JQuery): void {
            if (!$a.is(':visible')) return;
            var elideCount = Math.floor($a.parent().width() / 7); // todo: remove / 7!
            $a.text(Utils.Strings.htmlDecode(Utils.Strings.ellipsis($a.attr('title'), elideCount)));
        }

        private elideAll(): void {
            var that = this;

            this._$tree.find('a').each(function() {
                var $this = $(this);
                that.elide($this);
            });
        }
        
        protected _resize(): void {
            // elide links
            if (this._$tree){
                this.elideAll();
            }
        }
    }
}

namespace IIIFComponents.TreeComponent {
    export class Events {
        static MULTISELECT_STATE_CHANGE: string = 'multiSelectStateChange';
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