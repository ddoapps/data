import http from 'http';
import { findRoute, findStaticRoute } from '../config/routes.config';

const ROUTE_REGEX = /\/api\/[A-Za-z]+\/[A-Za-z]+(\/(.)*)?/;

export function route ( request: http.IncomingMessage, response: http.ServerResponse ): void {
    let contentType: MimeType | undefined;
    let data: string | undefined;
    let status: HttpResponseCode = 404;

    const useResponse = ( routeResponse: RouteResponse ) => {
        status = routeResponse.status;
        contentType = routeResponse.contentType;
        data = routeResponse.data;
    };

    if ( request.url ) {
        const staticRoute = findStaticRoute( request.url );

        if ( staticRoute ) {
            useResponse( staticRoute.callback( request ) );
        } else if ( ROUTE_REGEX.test( request.url ) ) {
            const urlTokens = request.url.split( '/' );
            const route = findRoute( request.method as HttpRequestType, urlTokens[ 2 ], urlTokens[ 3 ] );

            if ( route ) {
                useResponse( route.callback( request ) );
            }
        }
    }

    if ( contentType ) {
        response.writeHead( status, { 'Content-Type': contentType } );
    } else {
        response.writeHead( status );
    }

    if ( data ) {
        response.write( data );
    }

    response.end();
};
