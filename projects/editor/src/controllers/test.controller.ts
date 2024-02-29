import http from 'http';

export class TestController {
    static index ( _request: http.IncomingMessage ): RouteResponse {
        return { status: 204 };
    }
}
