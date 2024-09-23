import { BaseScheduler, Stack } from '@v/stack-runner';
import { expect, TaskContext, TestContext } from 'vitest';


describe('Stack tets', () => {
  it('should work', () => {
    const testFn = () => {
      throw new Error('test');
    };

    const runner = new BaseScheduler('sync');
    const stack = new Stack(runner, true);
    stack.add(testFn, (result) => {
      expect(result).toBeInstanceOf(Error);
    });
  });

  it('should number', () => {
    const testFn = () => {
      return 10;
    };

    const runner = new BaseScheduler('sync');
    const stack = new Stack(runner, true);
    stack.add(testFn, (result) => {
      expect(result).toBeTypeOf('number');
    });
  });


  it('should number from promise', async (done: TaskContext & TestContext) => {
    const testFn = async () => {
      return 5;
    };

    const runner = new BaseScheduler('sync');
    const stack = new Stack(runner, true);
    stack.add(testFn, (result) => {
      console.log('NUMBER WAIT ASYNC', result);
      expect('result').toEqual('string');
    });
  });
  
});
