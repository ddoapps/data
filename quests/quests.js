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

            this.templates = [ ...document.querySelectorAll( 'template[data-id]' ) ].reduce( ( all, template ) => {
                all[ template.dataset.id ] = template;
                
                return all;
            }, {});
        }

        fetchJson ( url ) {
            return fetch( url, { cache: 'no-cache' } ).then( xhr => xhr.json() );
        }

        initialize () {
            this.rebuildQuestDisplay();
        }

        rebuildQuestDisplay () {
            const appContent = document.querySelector( '.app-content' );
            const allQuests = document.createDocumentFragment();

            appContent.innerHTML = '';

            this.quests.forEach( quest => {
                const htmlQuest = this.templates.quest.content.cloneNode( true ).querySelector( 'article' );

                htmlQuest.dataset.id = quest.id;
                htmlQuest.querySelector( '.name' ).value = quest.name;

                allQuests.appendChild( htmlQuest );
            } );

            appContent.appendChild( allQuests );
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
