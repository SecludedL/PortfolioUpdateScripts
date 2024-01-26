import { HTTPClientAbstract } from "./HTTPClientAbstract";
import { HTTPClientResponse } from "../../Models/HTTPClientResponse";

type URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

export class HTTPClientGoogleApps extends HTTPClientAbstract {
    public getPageContents(url: string, headers: any): HTTPClientResponse  {
        const reqOptions: URLFetchRequestOptions = {
          'method': 'get',
          'headers': headers
        }
    
        const rawResponse = UrlFetchApp.fetch(url, reqOptions);
        const response = new HTTPClientResponse(
            rawResponse.getContentText(),
            rawResponse.getResponseCode()
        );

        return response;
    };
}