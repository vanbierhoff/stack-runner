/* eslint-disable */

import { Observable } from 'rxjs';


export type CallableTask<R = any, T = any> = (args?: T) => R | Promise<R> | Observable<R>
export type AsyncTask<R = any> = Promise<R> | Observable<R>

export type Task<T = any, R = any> = CallableTask<T, R>
