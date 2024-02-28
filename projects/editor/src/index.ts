import http from 'http';
import { LoggingService } from './services/logging.service';
import { RouterService } from './services/router.service';

class Editor {
    private readonly PORT = 8080;
    private server: http.Server;

    constructor () {
        this.server = http.createServer( ( request: http.IncomingMessage, response: http.ServerResponse ) => {
            LoggingService.info( `${ request.method } ${ request.url }` );
            RouterService.instance.route( request, response );
        } );
    }

    start (): void {
        this.server.listen( this.PORT, () => {
            LoggingService.info( `Editor listening on http://localhost:${ this.PORT }/` );
        } );
    }
}

new Editor().start();
