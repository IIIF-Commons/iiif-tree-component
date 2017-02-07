namespace IIIFComponents {
    export interface ITreeComponentData {
        branchNodesSelectable: boolean; 
        helper: Manifold.IHelper | null;
        topRangeIndex: number;
        treeSortType: Manifold.TreeSortType;
    }
}