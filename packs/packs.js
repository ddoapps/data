( function () {
    class Application {
        constructor () {
            Promise.all( [
                this.fetchJson( '../quests/quests.json' ),
                this.fetchJson( '../packs/packs.json' ),
                this.fetchJson( '../sagas/sagas.json' )
            ] ).then( ( [ quests, packs, sagas ] ) => {
                this.quests = quests.sort( ( a, b ) => a.name.localeCompare( b.name ) ).map( Quest.builder );
                this.packs = packs.sort( ( a, b ) => a.name.localeCompare( b.name ) ).map( Pack.builder );
                this.sagas = sagas;

                this.initialize();
            } );

            this.templates = document.querySelectorAll( 'template[data-id]' ).reduce( ( all, template ) => {
                all[ template.dataset.id ] = template;
                
                return all;
            }, {} );
        }

        bindOnExportPacks () {
            document.querySelector( '#export' ).addEventListener( 'click', _ => {
                const downloadLink = document.createElement( 'a' );
                const data = JSON.stringify( this.packs.sort( ( a, b ) => a.id.localeCompare( b.id ) ).map( it => it.toMap() ) );

                downloadLink.download = `packs.json`;
                downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent( data );
                downloadLink.style.display = 'none';

                document.body.appendChild( downloadLink );
                downloadLink.click();
                document.body.removeChild( downloadLink );
            } );
        }

        bindOnFilterInput () {
            let throttle = null;

            document.querySelector( '#filter' ).addEventListener( 'input', e => {
                clearTimeout( throttle );

                throttle = setTimeout( () => {
                    this.filteredPacks = this.packs.filter( pack => !e.target.value || pack.name.toLowerCase().includes( e.target.value.toLowerCase() ) );

                    this.rebuildPackSelect();
                }, 300 );
            } );
        }

        bindOnPackAdd () {
            document.querySelector( '.add-pack' ).addEventListener( 'click', _ => {
                const packElement = document.querySelector( '.new-pack .pack' );
                const name = packElement.querySelector( 'input.name' ).value.trim();
                const id = name.replace( /[^a-zA-Z]/g, '' ).toLowerCase();
                const questElements = packElement.querySelectorAll( '.pack-quests .pack-quest' );

                const questIds = questElements
                    .map( it => it.querySelector( '.quest-name' ).value.trim() )
                    .reduce( ( all, one ) => {
                        if ( one && !all.includes( one ) && this.quests.find( it => it.id === one ) ) {
                            all.push( one );
                        }

                        return all;
                    }, [] );
                
                if ( questElements.length === questIds.length && !this.packs.find( it => it.id === id ) ) {
                    this.packs.push( Pack.builder( { id, name, quests: questIds } ) );
                    this.packs.sort( ( a, b ) => a.name.localeCompare( b.name ) );

                    document.querySelector( '.clear-pack' ).dispatchEvent( new MouseEvent( 'click' ) );
                    document.querySelector( '#filter' ).dispatchEvent( new InputEvent( 'input' ) );
                }
            } );
        }

        bindOnPackClear () {
            document.querySelector( '.clear-pack' ).addEventListener( 'click', _ => {
                const packElement = document.querySelector( '.new-pack .pack' );

                packElement.querySelector( '.name' ).innerText = '';
                packElement.querySelector( 'input.name' ).value = '';

                packElement.querySelectorAll( '.pack-quests .pack-quest' ).forEach( ( quest, index ) => {
                    if ( index > 0 ) {
                        quest.remove();
                    } else {
                        quest.querySelector( '.quest-name' ).value = '';
                    }
                } );
            } );
        }

        bindOnPackSelection () {
            let throttle = null;

            document.querySelector( '#packs' ).addEventListener( 'input', e => {
                clearTimeout( throttle );

                throttle = setTimeout( () => this.displayExistingPackById( e.target.value ), 300 );
            } );
        }

        bindOnPackUpdate () {
            document.querySelector( '.update-pack' ).addEventListener( 'click', _ => {
                const packElement = document.querySelector( '.existing-packs .pack' );
                const id = packElement.dataset.id;

                this.updatePack( packElement, id );
            } );
        }

        bindOnQuestAdd () {
            document.body.addDelegateEventListener( 'click', '.add-quest', e => {
                const newQuest = document.createElement( 'span' );

                newQuest.innerHTML = this.templates.packQuest.innerHTML;

                e.target.closest( '.pack-quests' ).appendChild( newQuest.children[ 0 ] );
            } );
        }

        bindOnQuestRemove () {
            document.body.addDelegateEventListener( 'click', '.remove-quest', e => {
                e.target.closest( '.pack-quest' ).remove();
            } );
        }

        displayExistingPackById ( id ) {
            const packElement = document.querySelector( '.display .pack' );
            const pack = this.packs.find( it => it.id === id ) || new Pack( {} );
            const quests = document.createDocumentFragment();

            packElement.dataset.id = pack.id || '';
            packElement.querySelector( '.name' ).innerText = pack.name || '';
            packElement.querySelector( 'input.name' ).value = pack.name || '';

            pack.quests.forEach( ( quest, index ) => {
                const newQuest = document.createElement( 'span' );

                newQuest.innerHTML = this.templates.packQuest.innerHTML;

                newQuest.querySelector( '.quest-name' ).value = quest;

                if ( index < 1 ) {
                    newQuest.querySelector( '.remove-quest' ).remove();
                }

                quests.appendChild( newQuest.children[ 0 ] );
            } );

            const packQuests = packElement.querySelector( '.pack-quests' );

            packQuests.innerHTML = '';

            packQuests.appendChild( quests );
        }

        fetchJson ( url ) {
            return fetch( url, { cache: 'no-cache' } ).then( xhr => xhr.json() );
        }

        initialize () {
            this.filteredPacks = this.packs;

            document.querySelector( '.existing-packs' ).innerHTML = this.templates.pack.innerHTML;
            document.querySelector( '.new-pack' ).innerHTML = this.templates.pack.innerHTML;

            this.rebuildPackSelect();
            this.bindOnFilterInput();
            this.rebuildQuests();
            this.bindOnPackSelection();
            this.bindOnPackClear();
            this.bindOnQuestAdd();
            this.bindOnQuestRemove();
            this.bindOnPackAdd();
            this.bindOnPackUpdate();
            this.bindOnExportPacks();
        }

        rebuildPackSelect () {
            const packSelect = document.querySelector( '#packs' );
            const fragment = document.createDocumentFragment();

            packSelect.innerHTML = '<option value=""></option>';

            this.filteredPacks.forEach( pack => {
                const packElement = document.createElement( 'option' );

                packElement.value = pack.id;
                packElement.innerText = pack.name;

                fragment.appendChild( packElement );
            } );

            packSelect.appendChild( fragment );
        }

        rebuildQuests () {
            const questsDatalist = document.querySelector( '#questList' );
            const fragment = document.createDocumentFragment();

            this.quests.forEach( quest => {
                const questElement = document.createElement( 'option' );

                questElement.value = quest.id;
                questElement.innerText = quest.name;

                fragment.appendChild( questElement );
            } );

            questsDatalist.appendChild( fragment );
        }

        updatePack ( packElement, id ) {
            const packData = {
                id,
                name: packElement.querySelector( 'input.name' ).value.trim(),
                quests: packElement.querySelectorAll( '.pack-quests .pack-quest .quest-name' ).map( it => it.value.trim() )
            };

            const pack = Pack.builder( packData );
            this.packs = this.packs.filter( it => it.id !== pack.id );

            this.packs.push( pack );
            this.packs.sort( ( a, b ) => a.name.localeCompare( b.name ) );
        }
    }

    new Application();

    class Pack {
        static builder = data => new Pack( data );

        constructor ( data ) {
            [ 'id', 'name' ].forEach( key => this[ key ] = data[ key ] );

            this.quests = data.quests || [ '' ];
        }

        toMap () {
            return { id: this.id, name: this.name, quests: this.quests };
        }
    }

    class Quest {
        static builder = data => new Quest( data );

        constructor ( data ) {
            [ 'id', 'name' ].forEach( key => this[ key ] = data[ key ] );
        }
    }
}() );
