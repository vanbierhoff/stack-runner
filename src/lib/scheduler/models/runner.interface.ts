import { TaskInterface } from '../../stack';




export interface RunnerInterface {
    toRun(task: TaskInterface,  interval?: number): void;
}


export type BrowserSchedulerStrategyType = 'microtask' | 'sync'
