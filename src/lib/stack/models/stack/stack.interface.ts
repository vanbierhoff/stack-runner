/* eslint-disable */
import { CallableTask } from '../task.types';
import { TaskInterface } from '../task.interface';


export interface StackManagerInterface {
    add<R, T = any>(item: CallableTask<R, T>, args?: any, cb?: (result: R) => void): TaskInterface;

    remove(itemOrOd: TaskInterface | string | number): void;

    run(): void;

    stop(): void;

    isActiveRunning: boolean;

    activeStackItem(): TaskInterface;
}
