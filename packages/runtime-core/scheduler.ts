export interface SchedulerJob extends Function {
  // コンポーネントUID
  id?: number;
}

const queue: SchedulerJob[] = [];

let flushIndex = 0;

let isFlushing = false;
let isFlushPending = false;

const resolvedPromise = Promise.resolve();

export function queueJob(job: SchedulerJob) {
  // キューが空 もしくは queue内に同一Jobがない場合のみ、queueにJobを追加してフラッシュ
  if (
    queue.length === 0 ||
    !queue.includes(job, isFlushing ? flushIndex + 1 : flushIndex)
  ) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }

    // キューをフラッシュ
    queueFlush();
  }
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    resolvedPromise.then(() => {
      isFlushPending = false;
      isFlushing = true;

      queue.forEach((job) => {
        job();
      });

      flushIndex = 0;
      queue.length = 0;
      isFlushing = false;
    });
  }
}

function findInsertionIndex(id: number) {
  let start = flushIndex + 1;
  let end = queue.length;

  while (start < end) {
    const middle = (start + end) >>> 1;
    const middleJobId = queue[middle].id!;
    middleJobId < id ? (start = middle + 1) : (end = middle);
  }

  return start;
}
