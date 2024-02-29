function log ( message: string | Unknown, type: LogType ): void {
    const timestamp = new Date().toISOString().replace( /[TZ]/g, ' ' ).trim();

    console.log( `[${ timestamp }][${ type }] ${ message }` );
}

export function error ( message: string | Unknown ): void {
    log( message, 'ERROR' );
}

export function info ( message: string | Unknown ): void {
    log( message, 'INFO' );
}
