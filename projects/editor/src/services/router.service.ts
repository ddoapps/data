import fs from 'fs';
import http from 'http';

export class RouterService {
    private static _instance: RouterService;

    static get instance (): RouterService {
        if ( !RouterService._instance ) {
            RouterService._instance = new RouterService();
        }

        return RouterService._instance;
    }

    private constructor () {}

    route ( request: http.IncomingMessage, response: http.ServerResponse ): void {
        let contentType: string = '';
        let data: string = '';

        if ( request.url === '/' ) {
            contentType = 'text/html';
            data = fs.readFileSync( 'projects/editor/assets/index.html' ).toString();
        }

        if ( data ) {
            response.writeHead( 200, { contentType } );
            response.write( data );
        } else {
            response.writeHead( 404 );
        }

        response.end();
    }
};
