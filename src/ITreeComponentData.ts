namespace IIIFComponents {
    export interface ITreeComponentData {
        [key: string]: any;
        autoExpand?: boolean;
        branchNodesSelectable?: boolean;
        helper?: Manifold.IHelper | null;
        topRangeIndex?: number;
        treeSortType?: Manifold.TreeSortType;
    }
}