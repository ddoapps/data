( function () {
    class Application {
        constructor () {
            Promise.all( [
                this.fetchJson( './quests.json' ),
                this.fetchJson( '../packs/packs.json' ),
                this.fetchJson( '../sagas/sagas.json' )
            ] ).then( ( [ quests, packs, sagas ] ) => {
                this.quests = quests.map( Quest.builder );
                this.packs = packs;
                this.sagas = sagas;

                this.initialize();
            } );
        }

        fetchJson ( url ) {
            return fetch( url, { cache: 'no-cache' } ).then( xhr => xhr.json() );
        }

        initialize () {
            // console.log( this.quests );
        }
    }

    new Application();

    class Quest {
        static builder = data => new Quest( data );

        constructor ( data ) {
            [ 'id', 'name', 'duration' ].forEach( key => this[ key ] = data[ key ] );
            
            [ 'heroic', 'epic' ].forEach( type =>
                data[ type ] ? this[ type ] = QuestType.builder( data[ type ] ) : null
            );
        }
    }

    class QuestType {
        static builder = data => new QuestType( data );

        constructor ( data ) {
            [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty =>
                data[ difficulty ] ? this[ difficulty ] = QuestDifficulty.builder( data[ difficulty ] ) : null
            );
        }
    }

    class QuestDifficulty {
        static builder = data => new QuestDifficulty( data );

        constructor ( data ) {
            [ 'level', 'xp' ].forEach( key => this[ key ] = data[ key ] );
        }
    }
}() );
