import { Task } from "../types/task";

export async function execute(task: Task) {

  task.status = "running";

  try {

    console.log(task.title);

    task.status = "completed";

  } catch {

    task.status = "failed";

  }

  return task;

}
