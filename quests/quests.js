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

            this.templates = document.querySelectorAll( 'template[data-id]' ).reduce( ( all, template ) => {
                all[ template.dataset.id ] = template;
                
                return all;
            }, {} );
        }

        bindOnFilterInput () {
            let throttle = null;

            document.querySelector( '#filter' ).addEventListener( 'input', e => {
                clearTimeout( throttle );

                throttle = setTimeout( () => {
                    this.filteredQuests = this.quests.filter( quest => !e.target.value || quest.name.toLowerCase().includes( e.target.value.toLowerCase() ) );

                    this.rebuildQuestSelect();
                }, 300 );
            } );
        }

        bindOnQuestSelection () {
            let throttle = null;

            document.querySelector( '#quests' ).addEventListener( 'input', e => {
                clearTimeout( throttle );

                throttle = setTimeout( () => this.displayExistingQuestById( e.target.value ), 300 );
            } );
        }

        displayExistingQuestById ( id ) {
            const questElement = document.querySelector( '.display .quest' );
            const quest = this.quests.find( it => it.id === id ) || new Quest( {} );

            questElement.querySelector( '.name' ).innerText = quest.name || '';
            questElement.querySelector( 'input.name' ).value = quest.name || '';
            questElement.querySelector( '.duration' ).value = quest.duration || '';

            [ 'heroic', 'epic' ].forEach( type => {
                const questType = quest[ type ] || new QuestType( {} );

                [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty => {
                    const questDifficulty = questType[ difficulty ] || new QuestDifficulty( {} );

                    questElement.querySelector( `.${type} .${difficulty} .level` ).value = questDifficulty.level || 0;
                    questElement.querySelector( `.${type} .${difficulty} .xp` ).value = questDifficulty.xp || 0;
                } );
            } );
        }

        fetchJson ( url ) {
            return fetch( url, { cache: 'no-cache' } ).then( xhr => xhr.json() );
        }

        initialize () {
            this.filteredQuests = this.quests;

            this.rebuildQuestSelect();
            this.bindOnFilterInput();
            this.bindOnQuestSelection();
        }

        rebuildQuestSelect () {
            const questSelect = document.querySelector( '#quests' );
            const fragment = document.createDocumentFragment();

            questSelect.innerHTML = '<option value=""></option>';

            this.filteredQuests.forEach( quest => {
                const questElement = document.createElement( 'option' );

                questElement.value = quest.id;
                questElement.innerText = quest.name;

                fragment.appendChild( questElement );
            } );

            questSelect.appendChild( fragment );
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
