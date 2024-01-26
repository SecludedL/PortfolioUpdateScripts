import { HTTPClientAbstract } from './HTTPClientAbstract';
import syncRequest from 'sync-request';
import { HTTPClientResponse } from '../../Models/HTTPClientResponse';

export class HTTPClientSyncRequest extends HTTPClientAbstract {
    // uses the fetch function to retrieve the page at the given URL and returns the contents as a string
    public getPageContents(url: string, headers: any): HTTPClientResponse  {
        // send the request with the Microsoft Edge user agent
        const rawResponse = syncRequest('GET', url, {
            headers: headers
        });

        const response = new HTTPClientResponse(
            rawResponse.getBody('utf8'), 
            rawResponse.statusCode
        );

        return response;
    };
}