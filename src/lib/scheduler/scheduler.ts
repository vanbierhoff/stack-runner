import { TaskInterface, TaskStatus } from '../stack/models/task.interface';
import { BrowserSchedulerStrategyType, RunnerInterface } from './models/runner.interface';
import { Observable } from 'rxjs';
import { INTERNAL_CB_SYM, INTERNAL_FINISH_CB_SYM } from '../stack/stack';


const syncRunner = (task: () => void) => {
    return task();
};

export class BaseScheduler implements RunnerInterface {

    constructor(
        protected type: BrowserSchedulerStrategyType,
        protected customRunner?: (task: () => void) => void
    ) {
        this.runner = customRunner || syncRunner;
    }

    runner: (task: () => void) => void;

    isRunning: boolean = false;

    // TODO обернуть все в tryCatch и обработать ошибки
    toRun<T>(task: TaskInterface): void {

        switch (this.type) {
            case 'microtask':
                this.useMicrotaskRunner<T>(task);
                break;
            case 'sync':
                this.useSyncRunner<T>(task);
        }
    }

    useSyncRunner<T>(task: TaskInterface) {
        this.runner(() => {
            task.status = TaskStatus.RUNNING;
            this.extractResult(task.task(task?.args), (res: T) => {
                task.status = TaskStatus.DONE;
                task[INTERNAL_CB_SYM].run(res);
                task[INTERNAL_FINISH_CB_SYM](task);
            });
        });
    }


    useMicrotaskRunner<T>(task: TaskInterface) {
        queueMicrotask(() => {
            task.status = TaskStatus.RUNNING;
            this.extractResult(task.task(task?.args), (res: T) => {
                task.status = TaskStatus.DONE;
                task[INTERNAL_CB_SYM].run(res);
                task[INTERNAL_FINISH_CB_SYM](task);
            });
        });
    }

    extractResult<T>(runningFn: T | Promise<T> | Observable<T>,
                     cb: (result: T) => void) {
        if (runningFn instanceof Promise) {
            runningFn.then((result: T) => {
                cb(result);
            });
            return;
        }

        if (runningFn instanceof Observable) {
            const sub = runningFn.subscribe((result: T) => {
                cb(result);
                sub.unsubscribe();
            });
            return;
        }
        cb(runningFn);
    }
}
