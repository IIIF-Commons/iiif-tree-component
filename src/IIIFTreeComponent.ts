(<any>global).IIIFTreeComponent = module.exports = <IIIIFTreeComponent>{
    create: function(options: IIIFComponents.ITreeComponentOptions): IIIFComponents.TreeComponent {
        return new IIIFComponents.TreeComponent(options);
    }
};