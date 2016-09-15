namespace IIIFComponents {
    export interface ITreeComponent extends _Components.IBaseComponent{
        deselectCurrentNode(): void;
        getNodeById(id: string): Manifold.ITreeNode;
        selectNode(node: Manifold.ITreeNode): void;
        updateMultiSelectState(state: Manifold.MultiSelectState): void;
    }
}