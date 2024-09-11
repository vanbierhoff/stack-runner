export interface Callback<T> {
    (result?: T): void;
}


export interface ICallbacksInternal<T> extends Callback<T> {
    add(cb: (result: T) => void): void;

    run<T>(result?: T): void;
}

export interface ICallbacks<T> extends Callback<T> {
    add: (cb: Callback<T>) => void;
}


export const callbacks = <T>(cb?: Callback<T>) => {
    const cbsList: Array<Callback<T>> = [];
    if (cb) {
        cbsList.push(cb);
    }
    const cbs = () => {
        return cbsList;
    };

    cbs.add = (cb: Callback<T>) => {
        cbsList.push(cb);
    };

    cbs.run = (result?: T) => {
        cbsList.forEach(cb => cb(result));
    };

    return cbs as ICallbacksInternal<T>;
};
