export interface BaseTask{
    name: string,
    duration: number;
    runBeforeTimerStart: boolean;
    execute: () => Promise<void>;
}