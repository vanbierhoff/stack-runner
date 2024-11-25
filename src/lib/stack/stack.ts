import { CallableTask, StackManagerInterface, TaskInterface, TaskStatus } from './models';
import { RunnerInterface } from '../scheduler/models';
import { callbacks } from '../utils/callbacks';



export const INTERNAL_CB_SYM = Symbol('internal_cb');
export const INTERNAL_FINISH_CB_SYM = Symbol('internal_finish');
export const INTERNAL_ID_SYM = Symbol('internal_id');



export class Stack implements StackManagerInterface {

    constructor(protected runner: RunnerInterface, isRun: boolean = true) {
        this.isActiveRunning = isRun;
    }

    #stackList: Array<TaskInterface> = [];
    #offset = 0;

    isActiveRunning: boolean = true;

    #addTask(task: TaskInterface) {
        this.#stackList.push(task);
        //   this.#lengthStack = this.#stackList.length;
        if (this.isActiveRunning) {
            this.next();
        }
    }

    /**
     *
     * @param item - Task function sync or async
     * @param cb  - Callback after task is done
     * @param args - Arguments for task function. It will be passed to task during run
     */
    add<R, A extends Array<A> = any[]>(item: CallableTask<R>, cb?: (result: R) => void): TaskInterface
    add<R, A extends Array<A> = any[]>(item: CallableTask<R>,
                                       args?: A, cb?: (result: R) => void): TaskInterface {
        const callback = typeof args === 'function' ? args : cb;
        const callbacksItem = callbacks<R>();

        if (callback) {
            callbacksItem.add(callback);
        }

        const task: TaskInterface = {
            task: item,
            args,
            [INTERNAL_CB_SYM]: callbacksItem,
            [INTERNAL_ID_SYM]: 0,
            [INTERNAL_FINISH_CB_SYM]: this.finishCallback.bind(this),
            status: TaskStatus.PENDING
        };
        this.#addTask(task);
        return task;
    }


    remove(itemOrOd: TaskInterface | string | number) {
        this.#stackList.filter(item => item !== itemOrOd);
    }

    run(): void {
        this.isActiveRunning = true;
        this.next();
    }

    next() {
        const isRunning = this.#stackList[0]?.status === TaskStatus.RUNNING;
        if (isRunning || !this.isActiveRunning || this.#stackList.length === 0) {
            return;
        }
        this.runner.toRun(this.#stackList[this.#offset]);
    }

    stop(): void {
        this.isActiveRunning = false;
    }

    hasTasks(task: TaskInterface): boolean {
      return this.#stackList.includes(task);
    }

    finishCallback(task: TaskInterface) {
        this.#stackList.splice(task[INTERNAL_ID_SYM], 1);
        this.next();
    }

    activeStackItem(): TaskInterface {
        return {} as TaskInterface;
    }

}
