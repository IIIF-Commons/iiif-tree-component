namespace IIIFComponents{
    export interface ITreeComponentOptions extends Components.IBaseComponentOptions {
        rootNode: Manifold.ITreeNode,
        multiSelectState: Manifold.MultiSelectState
    }
}