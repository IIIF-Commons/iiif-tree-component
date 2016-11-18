namespace IIIFComponents{
    export interface ITreeComponentOptions extends _Components.IBaseComponentOptions {
        branchNodesSelectable: boolean; 
        helper: Manifold.IHelper;
        topRangeIndex: number;
        treeSortType: Manifold.TreeSortType;
    }
}