namespace IIIFComponents {
    export interface ITreeComponent extends _Components.IBaseComponent{
        getNodeById(id: string): Manifold.ITreeNode;
        selectNode(node: any): void;
        updateMultiSelectState(state: Manifold.MultiSelectState): void;
    }
}