/* eslint-disable */
import { Task } from './task.types';
import { ICallbacksInternal } from '../../utils/callbacks';


export enum TaskStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    DONE = 'done',
    ERROR = 'error'
}

export interface TaskInterface {
    task: Task,
    args?: Array<any>;
    status: TaskStatus;
    [key: string | symbol]: any;

}

export interface TaskInternalInterface {
    task: Task,
    args?: Array<any>;
    status: TaskStatus;
    cb: ICallbacksInternal<any>;

}
