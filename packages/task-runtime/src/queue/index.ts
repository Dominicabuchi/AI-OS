import { Task } from "../types/task";

const queue: Task[] = [];

export function push(task: Task) {
  queue.push(task);
}

export function next() {
  return queue.shift();
}

export function size() {
  return queue.length;
}
