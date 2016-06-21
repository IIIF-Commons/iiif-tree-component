namespace IIIFComponents {
    export interface ITreeComponent extends Components.IBaseComponent{
        getNodeById(id: string): Manifold.ITreeNode;
        selectNode(node: any): void;
        updateMultiSelectState(state: Manifold.MultiSelectState): void;
    }
}