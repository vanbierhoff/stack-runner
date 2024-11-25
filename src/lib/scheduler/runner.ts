import { TaskInterface, TaskStatus } from '../stack/models/task.interface';
import { BrowserSchedulerStrategyType, RunnerInterface } from './models/runner.interface';
import { catchError, Observable } from 'rxjs';
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
      this.extractResult(task, (res: T) => {
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

  extractResult<T>(task: TaskInterface,
                   cb: (result: T) => void) {
    try {
      const runningFn = task.task(task.args);
      if (runningFn instanceof Promise) {
        runningFn.then((result: T) => {
          cb(result);
        })
          .catch(err => err);
        return;
      }
      if (runningFn instanceof Observable) {
        const sub = runningFn.pipe(
          catchError((err) => err)
        ).subscribe((result: T) => {
          cb(result);
          sub.unsubscribe();
        });
        return;
      }
      cb(runningFn);
    }
    // TODO change to throw
    catch (err) {
      cb(err);
    }



  }
}
