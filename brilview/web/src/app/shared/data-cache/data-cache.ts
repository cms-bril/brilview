import { Subject } from 'rxjs/Subject';


export class DataCache {

    onSetData$: Subject<string>;
    onChange$: Subject<void>;
    cache = {};
    get size() {
        return Object.keys(this.cache).length;
    }

    constructor() {
        this.onChange$ = new Subject<void>();
        this.onSetData$ = new Subject<string>();
    }

    setData(key: string, data: any) {
        this.cache[key] = data;
        this.onSetData$.next(key);
        this.onChange$.next();
    }

    getData(key: string) {
        if (this.cache.hasOwnProperty(key)) {
            return this.cache[key];
        } else {
            return undefined;
        }
    }

    getKeys() {
        return Object.keys(this.cache);
    }

    removeData(key: string) {
        if (this.cache.hasOwnProperty(key)) {
            delete this.cache[key];
            this.onChange$.next();
            return true;
        } else {
            return false;
        }
    }

    clear() {
        const keys = this.getKeys();
        if (keys.length > 0) {
            Object.keys(this.cache).forEach(prop => {
                delete this.cache[prop];
            });
            this.onChange$.next();
        }
    }

    getSize() {
        return Object.keys(this.cache).length;
    }
}
