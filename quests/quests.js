( function () {
    class Application {
        constructor () {
            Promise.all( [
                this.fetchJson( './quests.json' ),
                this.fetchJson( '../packs/packs.json' ),
                this.fetchJson( '../sagas/sagas.json' )
            ] ).then( ( [ quests, packs, sagas ] ) => {
                this.quests = quests.sort( ( a, b ) => a.name.localeCompare( b.name ) ).map( Quest.builder );
                this.packs = packs;
                this.sagas = sagas;

                this.initialize();
            } );

            this.templates = document.querySelectorAll( 'template[data-id]' ).reduce( ( all, template ) => {
                all[ template.dataset.id ] = template;
                
                return all;
            }, {} );
        }

        bindOnExportQuests () {
            document.querySelector( '#export' ).addEventListener( 'click', _ => this.exportQuests() );
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

        bindOnQuestAdd () {
            document.querySelector( '.add-quest' ).addEventListener( 'click', _ => {
                const questElement = document.querySelector( '.new-quest .quest' );
                const nameElement = questElement.querySelector( 'input.name' );
                const id = nameElement.value.toLowerCase().replace( /[^a-z]/g, '' ).trim();

                if ( id && !this.quests.find( quest => quest.id === id ) ) {
                    this.updateQuest( questElement, id );
                    this.rebuildQuestSelect();
                    document.querySelector( '.clear-quest' ).click();
                }
            } );
        }

        bindOnQuestClear () {
            document.querySelector( '.clear-quest' ).addEventListener( 'click', _ => {
                const questElement = document.querySelector( '.new-quest .quest' );

                questElement.querySelector( '.name' ).innerText = '';
                questElement.querySelector( 'input.name' ).value = '';
                questElement.querySelector( '.duration' ).value = '';

                [ 'heroic', 'epic' ].forEach( type => {
                    [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty => {
                        questElement.querySelector( `.${type} .${difficulty} .level` ).value = -1;
                        questElement.querySelector( `.${type} .${difficulty} .xp` ).value = -1;
                    } );
                } );
            } );
        }

        bindOnQuestSelection () {
            let throttle = null;

            document.querySelector( '#quests' ).addEventListener( 'input', e => {
                clearTimeout( throttle );

                throttle = setTimeout( () => this.displayExistingQuestById( e.target.value ), 300 );
            } );
        }

        bindOnQuestUpdate () {
            document.querySelector( '.update-quest' ).addEventListener( 'click', _ => {
                const questElement = document.querySelector( '.existing-quest .quest' );
                const id = questElement.dataset.id;

                this.updateQuest( questElement, id );
            } );
        }

        displayExistingQuestById ( id ) {
            const questElement = document.querySelector( '.display .quest' );
            const quest = this.quests.find( it => it.id === id ) || new Quest( {} );

            questElement.dataset.id = quest.id || '';
            questElement.querySelector( '.name' ).innerText = quest.name || '';
            questElement.querySelector( 'input.name' ).value = quest.name || '';
            questElement.querySelector( '.duration' ).value = quest.duration || '';

            [ 'heroic', 'epic' ].forEach( type => {
                const questType = quest[ type ] || new QuestType( {} );

                [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty => {
                    const questDifficulty = questType[ difficulty ] || new QuestDifficulty( {} );

                    questElement.querySelector( `.${type} .${difficulty} .level` ).value = questDifficulty.level || -1;
                    questElement.querySelector( `.${type} .${difficulty} .xp` ).value = questDifficulty.xp || -1;
                } );
            } );
        }

        exportQuests () {
            const downloadLink = document.createElement( 'a' );
            const data = JSON.stringify( this.quests.sort( ( a, b ) => a.id.localeCompare( b.id ) ).map( it => it.toMap() ) );

            downloadLink.download = `quests.json`;
            downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent( data );
            downloadLink.style.display = 'none';

            document.body.appendChild( downloadLink );
            downloadLink.click();
            document.body.removeChild( downloadLink );
        }

        fetchJson ( url ) {
            return fetch( url, { cache: 'no-cache' } ).then( xhr => xhr.json() );
        }

        initialize () {
            this.filteredQuests = this.quests;

            document.querySelector( '.existing-quest' ).innerHTML = this.templates.quest.innerHTML;
            document.querySelector( '.new-quest' ).innerHTML = this.templates.quest.innerHTML;

            this.rebuildQuestSelect();
            this.bindOnFilterInput();
            this.bindOnQuestSelection();
            this.bindOnQuestClear();
            this.bindOnQuestAdd();
            this.bindOnQuestUpdate();
            this.bindOnExportQuests();
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

        updateQuest ( questElement, id ) {
            const questData = { id };

            questData.name = questElement.querySelector( 'input.name' ).value.trim();
            questData.duration = questElement.querySelector( '.duration' ).value;

            [ 'heroic', 'epic' ].forEach( type => {
                const questTypeElement = questElement.querySelector( `.${type}` );

                [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty => {
                    const level = parseInt( questTypeElement.querySelector( `.${difficulty} .level` ).value, 10 );
                    const xp = parseInt( questTypeElement.querySelector( `.${difficulty} .xp` ).value, 10 );

                    if ( level > 0 && xp > -1 ) {
                        questData[ type ] = questData[ type ] || {};
                        questData[ type ][ difficulty ] = { level, xp };
                    }
                } );
            } );

            const quest = new Quest( questData );
            this.quests = this.quests.filter( it => it.id !== quest.id );

            this.quests.push( quest );
            this.quests.sort( ( a, b ) => a.name.localeCompare( b.name ) );
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

        toMap () {
            const map = { id: this.id, name: this.name, duration: this.duration };

            [ 'heroic', 'epic' ].forEach( type => {
                if ( this[ type ] ) map[ type ] = this[ type ].toMap();
            } );

            return map;
        }
    }

    class QuestType {
        static builder = data => new QuestType( data );

        constructor ( data ) {
            [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty =>
                data[ difficulty ] ? this[ difficulty ] = QuestDifficulty.builder( data[ difficulty ] ) : null
            );
        }

        toMap () {
            const map = {};

            [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty => {
                if ( this[ difficulty ] ) map[ difficulty ] = this[ difficulty ].toMap();
            } );

            return map;
        }
    }

    class QuestDifficulty {
        static builder = data => new QuestDifficulty( data );

        constructor ( data ) {
            [ 'level', 'xp' ].forEach( key => this[ key ] = data[ key ] );
        }

        toMap () {
            return { level: this.level, xp: this.xp };
        }
    }
}() );
