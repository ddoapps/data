type LogType = 'INFO' | 'ERROR';
type MimeType = 'text/html' | 'text/css' | 'text/javascript' | 'application/json';

type Route = {
    action: string,
    callback: Function,
    controller: string,
    method: HttpRequestType
};

type RouteResponse = {
    contentType?: MimeType,
    data?: string,
    status: HttpResponseCode
};

type StaticResource = {
    contentType: MimeType,
    path: string
};

type StaticRoute = {
    callback: Function,
    path: string
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE';
type HttpResponseCode = 200 | 201 | 204 | 400 | 404;
type Unknown = null | undefined;
