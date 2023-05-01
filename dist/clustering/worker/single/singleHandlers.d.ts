import { ThreadEvents, ResolveFunction } from "../../ThreadComms";
import { SingleWorker } from "./SingleWorker";
import { Worker } from "../Worker";
export declare const handlers: {
    [key in keyof ThreadEvents]?: (this: Worker & SingleWorker, data: ThreadEvents[key]["send"], resolve: ResolveFunction<key>) => void | Promise<void>;
};
