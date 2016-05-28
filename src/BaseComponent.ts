declare var EventEmitter2: IEventEmitter2;

module IIIFTreeComponent {
    export class BaseComponent {
        constructor(){

        }
        
        public emitEvent(event: string, ...args: any[]): void {
            (<any>this).emit(event, args);
        }
    }
    
    applyMixins(BaseComponent, [EventEmitter2]);
    
    function applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
}