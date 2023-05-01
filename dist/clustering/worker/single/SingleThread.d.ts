import { Thread } from '../Thread';
import { ThreadEvents } from '../../ThreadComms';
import { SingleWorker } from './SingleWorker';
/**
 * Thread interface for interacting with the master process from a worker
 */
export declare class SingleThread extends Thread {
    worker: SingleWorker;
    id: string;
    constructor(worker: SingleWorker);
    /**
     * Sends a command to the master
     * @param event Event to send
     * @param data Data to send along
     * @returns Data back
     * @link https://github.com/jpbberry/jadl/wiki/Using-Clusters#creating-custom-events
     */
    sendCommand<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive']>;
    /**
       * Tells the master something
       * @param event Event to send
       * @param data Data to send
       * @link https://github.com/jpbberry/jadl/wiki/Using-Clusters#creating-custom-events
       */
    tell<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void;
}
