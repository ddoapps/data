import http from 'http';
import { info } from './services/logging.service';
import { route } from './services/router.service';

class Editor {
    private readonly PORT = 8080;
    private server: http.Server;

    constructor () {
        this.server = http.createServer( ( request: http.IncomingMessage, response: http.ServerResponse ) => {
            info( `${ request.method } ${ request.url }` );
            route( request, response );
        } );
    }

    start (): void {
        this.server.listen( this.PORT, () => {
            info( `Editor listening on http://localhost:${ this.PORT }/` );
        } );
    }
}

new Editor().start();
