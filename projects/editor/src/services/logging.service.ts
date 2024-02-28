type LogType = 'info' | 'error';
type optional = undefined | null;

export class LoggingService {
    private static log ( message: string | optional, type: LogType ): void {
        const timestamp = new Date().toISOString().replace( /[TZ]/g, ' ' ).trim();

        console.log( `[${ timestamp }][${ type.toUpperCase() }] ${ message }` );
    }

    static error ( message: string | optional ): void {
        LoggingService.log( message, 'error' );
    }

    static info ( message: string | optional ): void {
        LoggingService.log( message, 'info' );
    }
};
