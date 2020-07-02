'use strict';

class Namespace {
    constructor () {
        this.templates = {
            quest: this.loadTemplate( '#questTemplate' )
        };

        const quests = this.fetchJsonFile( './quests.json' );

        Promise.all([quests]).then(([quests]) => {
            this.quests = quests.map( it => new Quest( it ) );

            this.buildQuestsDisplay();
        });
    }

    buildQuestsDisplay () {
        const fragment = document.createDocumentFragment();
        const maxNameLength = Math.max( ...this.quests.map( it => it.name.length ) );

        this.quests.sort( ( a, b ) => a.id.localeCompare( b.id ) );

        this.quests.forEach( quest => {
            const record = document.createElement( 'span' );            
            record.innerHTML = this.templates.quest;

            const id = record.querySelector( '.id' );
            id.innerText = quest.id;

            const name = record.querySelector( '.name' );
            name.value = quest.name;
            name.style.width = ( maxNameLength * 8.2 ) + 'px';

            record.querySelector( '.duration' ).value = quest.duration;

            fragment.appendChild( record.firstChild );
        } );

        document.querySelector( '.app .content .quests .tbody' ).appendChild( fragment );
    }

    fetchJsonFile ( path ) {
        return fetch( new Request( path ) ).then( response => response.json() );
    }

    loadTemplate ( selector ) {
        return document.querySelector( selector ).innerHTML.split( '\n' ).map( it => it.trim() ).join( '' );
    }
}

class Quest {
    constructor ( data ) {
        this.id = data.id;
        this.name = data.name;
        this.duration = data.duration;
        this.heroic = new QuestType( data.heroic || {} );
        this.epic = new QuestType( data.epic || {} );
    }
}

class QuestType {
    constructor ( data ) {
        [ 'casual', 'normal', 'hard', 'elite' ].forEach( difficulty =>
            this[ difficulty ] = new QuestTypeDifficulty( data[ difficulty ] || {} )
        );
    }
}

class QuestTypeDifficulty {
    constructor ( data ) {
        this.level = data.level;
        this.experience = data.xp;
    }
}

new Namespace();
