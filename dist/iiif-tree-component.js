// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.iiifTreeComponent = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){






var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IIIFComponents;
(function (IIIFComponents) {
    var TreeComponent = (function (_super) {
        __extends(TreeComponent, _super);
        function TreeComponent(options) {
            _super.call(this, options);
            this.isOpen = false;
            this._init();
            this._reset();
        }
        TreeComponent.prototype._init = function () {
            var success = _super.prototype._init.call(this);
            if (!success) {
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
                elide: function (text) {
                    var $a = $(this.linkCtx.elem);
                    var elideCount = Math.floor($a.parent().width() / 7); // todo: remove / 7
                    return Utils.Strings.htmlDecode(Utils.Strings.ellipsis(text, elideCount));
                    //https://github.com/BorisMoore/jsviews/issues/296
                }
            });
            $.views.tags({
                tree: {
                    toggleExpanded: function () {
                        that._setNodeExpanded(this.data, !this.data.expanded);
                    },
                    toggleMultiSelect: function () {
                        that._multiSelectTreeNode(this.data, !this.data.multiSelected);
                        that._updateParentNodes(this.data);
                    },
                    init: function (tagCtx, linkCtx, ctx) {
                        var data = tagCtx.view.data;
                        data.text = data.label; //Utils.Strings.htmlDecode(Utils.Strings.ellipsis(data.label, that.elideCount));
                        this.data = tagCtx.view.data;
                    },
                    onAfterLink: function () {
                        var self = this;
                        self.contents('li').first()
                            .on('click', '.toggle', function () {
                            self.toggleExpanded();
                        }).on('click', 'a', function (e) {
                            e.preventDefault();
                            if (self.data.nodes.length)
                                self.toggleExpanded();
                            if (that.multiSelectState.enabled) {
                                self.toggleMultiSelect();
                            }
                            else {
                                that._emit(TreeComponent.Events.TREE_NODE_SELECTED, self.data.data);
                            }
                        }).on('click', 'input.multiSelect', function (e) {
                            self.toggleMultiSelect();
                        });
                    },
                    template: $.templates.treeTemplate
                }
            });
            return success;
        };
        TreeComponent.prototype._getDefaultOptions = function () {
            return {};
        };
        TreeComponent.prototype.updateMultiSelectState = function (state) {
            this.multiSelectState = state;
            for (var i = 0; i < this.multiSelectState.ranges.length; i++) {
                var range = this.multiSelectState.ranges[i];
                var node = this._getMultiSelectableNodes().en().where(function (n) { return n.data.id === range.id; }).first();
                this._setNodeMultiSelected(node, range.multiSelected);
            }
            this._reset();
        };
        TreeComponent.prototype._reset = function () {
            this.allNodes = null;
            this.multiSelectableNodes = null;
            this._setMultiSelectionEnabled(this.multiSelectState.enabled);
            this._$tree.link($.templates.pageTemplate, this.rootNode);
            this._resize();
        };
        TreeComponent.prototype.allNodesSelected = function () {
            var applicableNodes = this._getMultiSelectableNodes();
            var multiSelectedNodes = this.getMultiSelectedNodes();
            return applicableNodes.length === multiSelectedNodes.length;
        };
        TreeComponent.prototype._getMultiSelectableNodes = function () {
            var _this = this;
            // if cached
            if (this.multiSelectableNodes) {
                return this.multiSelectableNodes;
            }
            return this.multiSelectableNodes = this._getAllNodes().en().where(function (n) { return _this._nodeIsMultiSelectable(n); }).toArray();
        };
        TreeComponent.prototype._nodeIsMultiSelectable = function (node) {
            return (node.isManifest() && node.nodes.length > 0 || node.isRange());
        };
        TreeComponent.prototype._getAllNodes = function () {
            // if cached
            if (this.allNodes) {
                return this.allNodes;
            }
            return this.allNodes = this.rootNode.nodes.en().traverseUnique(function (node) { return node.nodes; }).toArray();
        };
        TreeComponent.prototype.getMultiSelectedNodes = function () {
            var _this = this;
            return this._getAllNodes().en().where(function (n) { return _this._nodeIsMultiSelectable(n) && n.multiSelected; }).toArray();
        };
        TreeComponent.prototype.getNodeById = function (id) {
            return this._getAllNodes().en().where(function (n) { return n.id === id; }).first();
        };
        TreeComponent.prototype._multiSelectTreeNode = function (node, isSelected) {
            if (!this._nodeIsMultiSelectable(node))
                return;
            this._setNodeMultiSelected(node, isSelected);
            this._emit(TreeComponent.Events.TREE_NODE_MULTISELECTED, node);
            this._emit(TreeComponent.Events.MULTISELECT_STATE_CHANGE, this.multiSelectState);
            // recursively select/deselect child nodes
            for (var i = 0; i < node.nodes.length; i++) {
                var n = node.nodes[i];
                this._multiSelectTreeNode(n, isSelected);
            }
        };
        TreeComponent.prototype._updateParentNodes = function (node) {
            var parentNode = node.parentNode;
            if (!parentNode)
                return;
            // expand parents if selected
            if (node.selected) {
                this._expandParents(node);
            }
            // get the number of selected children.
            var checkedCount = parentNode.nodes.en().where(function (n) { return n.multiSelected; }).count();
            // if any are checked, check the parent.
            this._setNodeMultiSelected(parentNode, checkedCount > 0);
            var indeterminate = checkedCount > 0 && checkedCount < parentNode.nodes.length;
            this._setNodeIndeterminate(parentNode, indeterminate);
            // cascade up tree
            this._updateParentNodes(parentNode);
        };
        TreeComponent.prototype._expandParents = function (node) {
            if (!node.parentNode)
                return;
            this._setNodeExpanded(node.parentNode, true);
            this._expandParents(node.parentNode);
        };
        TreeComponent.prototype._setNodeSelected = function (node, selected) {
            $.observable(node).setProperty("selected", selected);
        };
        TreeComponent.prototype._setNodeExpanded = function (node, expanded) {
            $.observable(node).setProperty("expanded", expanded);
        };
        TreeComponent.prototype._setNodeMultiSelected = function (node, selected) {
            $.observable(node).setProperty("multiSelected", selected);
            if (!selected) {
                this._setNodeIndeterminate(node, false);
            }
        };
        TreeComponent.prototype._setNodeIndeterminate = function (node, indeterminate) {
            var $checkbox = this._getNodeCheckbox(node);
            $checkbox.prop("indeterminate", indeterminate);
        };
        TreeComponent.prototype._getNodeCheckbox = function (node) {
            return $("#tree-checkbox-" + node.id);
        };
        TreeComponent.prototype._getNodeSiblings = function (node) {
            var siblings = [];
            if (node.parentNode) {
                siblings = node.parentNode.nodes.en().where(function (n) { return n !== node; }).toArray();
            }
            return siblings;
        };
        TreeComponent.prototype._setMultiSelectionEnabled = function (enabled) {
            var nodes = this._getAllNodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (this._nodeIsMultiSelectable(node)) {
                    node.multiSelectionEnabled = enabled;
                }
            }
        };
        TreeComponent.prototype.selectPath = function (path) {
            if (!this.rootNode)
                return;
            var pathArr = path.split("/");
            if (pathArr.length >= 1)
                pathArr.shift();
            var node = this.getNodeByPath(this.rootNode, pathArr);
            this.selectNode(node);
        };
        TreeComponent.prototype.deselectCurrentNode = function () {
            if (this.selectedNode)
                this._setNodeSelected(this.selectedNode, false);
        };
        TreeComponent.prototype.selectNode = function (node) {
            if (!this.rootNode)
                return;
            this.deselectCurrentNode();
            this.selectedNode = node;
            this._setNodeSelected(this.selectedNode, true);
            this._updateParentNodes(this.selectedNode);
        };
        // walks down the tree using the specified path e.g. [2,2,0]
        TreeComponent.prototype.getNodeByPath = function (parentNode, path) {
            if (path.length === 0)
                return parentNode;
            var index = path.shift();
            var node = parentNode.nodes[index];
            return this.getNodeByPath(node, path);
        };
        TreeComponent.prototype.show = function () {
            this.isOpen = true;
            this._$element.show();
        };
        TreeComponent.prototype.hide = function () {
            this.isOpen = false;
            this._$element.hide();
        };
        TreeComponent.prototype.elide = function ($a) {
            if (!$a.is(':visible'))
                return;
            var elideCount = Math.floor($a.parent().width() / 7); // todo: remove / 7!
            $a.text(Utils.Strings.htmlDecode(Utils.Strings.ellipsis($a.attr('title'), elideCount)));
        };
        TreeComponent.prototype.elideAll = function () {
            var that = this;
            this._$tree.find('a').each(function () {
                var $this = $(this);
                that.elide($this);
            });
        };
        TreeComponent.prototype._resize = function () {
            // elide links
            if (this._$tree) {
                this.elideAll();
            }
        };
        return TreeComponent;
    }(Components.BaseComponent));
    IIIFComponents.TreeComponent = TreeComponent;
})(IIIFComponents || (IIIFComponents = {}));
var IIIFComponents;
(function (IIIFComponents) {
    var TreeComponent;
    (function (TreeComponent) {
        var Events = (function () {
            function Events() {
            }
            Events.MULTISELECT_STATE_CHANGE = 'multiSelectStateChange';
            Events.TREE_NODE_MULTISELECTED = 'treeNodeMultiSelected';
            Events.TREE_NODE_SELECTED = 'treeNodeSelected';
            return Events;
        }());
        TreeComponent.Events = Events;
    })(TreeComponent = IIIFComponents.TreeComponent || (IIIFComponents.TreeComponent = {}));
})(IIIFComponents || (IIIFComponents = {}));
(function (w) {
    if (!w.IIIFComponents) {
        w.IIIFComponents = IIIFComponents;
    }
    else {
        w.IIIFComponents.TreeComponent = IIIFComponents.TreeComponent;
    }
})(window);

},{}]},{},[1])(1)
});