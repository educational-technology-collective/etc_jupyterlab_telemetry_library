export abstract class ConfigSupplicant {

    private _config: { [key: string]: any } | null;
    private _paths: Array<string>;

    constructor({ paths, config }: { paths: Array<string>, config: { [key: string]: any } | null }) {
        
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.init = this.init.bind(this);
        
        this._config = config;
        this._paths = paths;    
    }

    init() {
        try {
    
            let state = this._paths.reduce<any>((previousValue: { [key: string]: any }, currentValue: string) => {
                return previousValue[currentValue];
            }, this._config);
            //  We need to know the value assigned to the reference path (i.e., paths); 
            //  hence, drill into the arbitrary config object in order to obtain the value.    

            if (state === false) {
                this.disable();
            } else if (state === true) {
                this.enable();
            }
            else {
                throw new Error();
            }

        } catch (e) {
            this.enable();
            //  The default is for all events to be enabled; hence, we don't need to log anything here.
        }
    }

    protected abstract enable(): void;
    protected abstract disable(): void;
}