export class HTTPClientResponse {
    protected responseBody: string;
    protected responseCode: number;

    public constructor(responseBody: string, responseCode: number) {
        this.responseBody = responseBody;
        this.responseCode = responseCode;
    }

    public getResponseBody() {
        return this.responseBody;
    }

    public getResponseCode() {
        return this.responseCode;
    }
}