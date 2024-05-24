import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import { BaseTask } from "../types/BaseTask";

interface TasksLoaded{
    numTasks: number,
    tasksLoaded: BaseTask[]
}

export class TaskScheduler{

    private tasksFolderPath:string;
    private static instance:TaskScheduler;

    public static IsTask(obj: any){
        return (obj as BaseTask).duration !== undefined;
    }

    constructor(){
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.tasksFolderPath = path.resolve(workingDir, '../tasks');
    }

    public static getInstance(){
        if (!TaskScheduler.instance){
            TaskScheduler.instance = new TaskScheduler();
        }
        return TaskScheduler.instance;
    }

    public async LoadTasks(){
        var tasksLoaded:TasksLoaded = {numTasks: 0, tasksLoaded: []};
        
        let taskFiles = fs.readdirSync(this.tasksFolderPath);

        for (const file of taskFiles) {

            const filePath = path.join(this.tasksFolderPath, file);
            let fileToImport = pathToFileURL(filePath).href;

            let task = await import(fileToImport);
            if (TaskScheduler.IsTask(task.task)){
                let taskObj = task.task as BaseTask;
                if (taskObj.runBeforeTimerStart){
                    await taskObj.execute();
                }
                setInterval(taskObj.execute, taskObj.duration);
                    
                tasksLoaded.tasksLoaded.push(taskObj);
                tasksLoaded.numTasks += 1;
            }
        }
        return tasksLoaded;
    }

    public static GetTaskDurationAsString(task: BaseTask): string{
        const hours = Math.floor(task.duration / 3600000);
        const minutes = Math.floor((task.duration % 3600000) / 60000);
        const seconds = Math.floor(((task.duration % 3600000) % 60000) / 1000);

        let result = '';
        if (hours > 0) {
            result += hours + ' hour' + (hours !== 1 ? 's' : '') + ' ';
        }
        if (minutes > 0) {
            result += minutes + ' minute' + (minutes !== 1 ? 's' : '') + ' ';
        }
        if (seconds > 0) {
            result += seconds + ' second' + (seconds !== 1 ? 's' : '');
        }
        return result.trim();
    }
}

const Tasks = TaskScheduler.getInstance();
export default Tasks;