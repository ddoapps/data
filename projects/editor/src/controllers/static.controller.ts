import { readFileSync } from 'fs';
import http from 'http';

const STATIC_RESOURCES: { [ key: string ]: StaticResource } = {
    '/': { contentType: 'text/html', path: 'projects/editor/assets/index.html' },
    '/index.css': { contentType: 'text/css', path: 'projects/editor/assets/index.css' },
    '/index.js': { contentType: 'text/javascript', path: 'projects/editor/assets/index.js' }
};

export class StaticController {
    static route ( request: http.IncomingMessage ): RouteResponse {
        const result: RouteResponse = { status: 404 };

        if ( request.url ) {
            const staticResource = STATIC_RESOURCES[ request.url ];
    
            if ( staticResource ) {
                result.status = 200;
                result.contentType = staticResource.contentType;
                result.data = readFileSync( staticResource.path ).toString();
            }
        }

        return result;
    }
}
