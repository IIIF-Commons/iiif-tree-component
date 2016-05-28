// iiif-tree-component v1.0.1 https://github.com/edsilv/iiif-tree-component#readme
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.iiifTreeComponent = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){


var IIIFComponents;
(function (IIIFComponents) {
    var BaseComponent = (function () {
        function BaseComponent() {
        }
        BaseComponent.prototype.emitEvent = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.emit(event, args);
        };
        return BaseComponent;
    }());
    IIIFComponents.BaseComponent = BaseComponent;
    applyMixins(BaseComponent, [EventEmitter2]);
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
})(IIIFComponents || (IIIFComponents = {}));

var IIIFComponents;
(function (IIIFComponents) {
    var Events = (function () {
        function Events() {
        }
        Events.TEST = 'test';
        return Events;
    }());
    IIIFComponents.Events = Events;
})(IIIFComponents || (IIIFComponents = {}));

global.IIIFTreeComponent = module.exports = {
    create: function (options) {
        return new IIIFComponents.TreeComponent(options);
    }
};





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
            _super.call(this);
            this.options = $.extend(this._getDefaultOptions(), options);
            this._init();
            this._$element.append("I am a tree component");
            this._resize();
        }
        TreeComponent.prototype.test = function () {
            this.emitEvent(IIIFComponents.Events.TEST, [1, 2, 'three']);
        };
        TreeComponent.prototype._init = function () {
            this._$element = $(this.options.element);
            this._$element.empty();
            if (!this._$element.length) {
                console.log('element not found');
                return false;
            }
            return true;
        };
        TreeComponent.prototype._getDefaultOptions = function () {
            return {};
        };
        TreeComponent.prototype._resize = function () {
        };
        return TreeComponent;
    }(IIIFComponents.BaseComponent));
    IIIFComponents.TreeComponent = TreeComponent;
})(IIIFComponents || (IIIFComponents = {}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});