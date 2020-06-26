'use strict';

class Namespace {
    constructor () {
        const quests = this.fetchJsonFile( './quests.json' );

        Promise.all([quests]).then(([quests]) => {
            this.quests = quests.map( it => new Quest( it ) );
        });
    }

    fetchJsonFile ( path ) {
        return fetch( new Request( path ) ).then( response => response.json() );
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
