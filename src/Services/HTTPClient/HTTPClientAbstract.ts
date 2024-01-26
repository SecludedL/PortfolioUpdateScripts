import { HTTPClientResponse } from "../../Models/HTTPClientResponse";

export abstract class HTTPClientAbstract {
    public abstract getPageContents(url: string, headers: any): HTTPClientResponse;
}