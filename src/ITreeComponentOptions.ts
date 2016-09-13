namespace IIIFComponents{
    export interface ITreeComponentOptions extends _Components.IBaseComponentOptions {
        helper: Manifold.IHelper;
        topRangeIndex: number;
        treeSortType: Manifold.TreeSortType;
    }
}