/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;

    tally: number;
    letter: string;
    questions: any;
    
    confettiSwitch: boolean;
    playingNow: boolean;

    lastLetter:string;
    lastLetters: string[];

    skipped:number;
    hinted:number;
}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'UNCLICK' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string }
;
