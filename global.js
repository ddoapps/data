NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.map = Array.prototype.map;
NodeList.prototype.reduce = Array.prototype.reduce;

Element.prototype.addDelegateEventListener = function ( eventType, childSelector, callback ) {
    this.addEventListener( eventType, function ( e ) {
        if ( e.target.matches( childSelector ) ) {
            callback.call( e.target, ...arguments );
        }
    } );
};

( function () {
    if ( !window.location.href.includes( 'localhost' ) ) return;

    const resources = { [ window.location.href ]: null };

    document.querySelectorAll( 'link[href], script[src]' ).forEach( resource => {
        resources[ resource.href || resource.src ] = null;
    } );

    const urls = Object.keys( resources );

    function detectFileChanges ( index = 0 ) {
        if ( index < urls.length ) {
            fetch( urls[ index ], { method: 'HEAD', cache: 'no-cache' } ).then( xhr => {
                const etag = xhr.headers.get( 'ETag' );
                let previousTag = resources[ urls[ index ] ];

                if ( !previousTag ) {
                    previousTag = resources[ urls[ index ] ] = etag;
                }
                
                if ( previousTag !== etag ) {
                    window.location.reload();
                } else {
                    setTimeout( () => detectFileChanges( ++index ), 500 );
                }
            } );
        } else {
            setTimeout( detectFileChanges, 500 );
        }
    }

    detectFileChanges();
} )();
