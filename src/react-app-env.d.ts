/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;

    tally: number;
    letter: string;
    questions: any;
    
    confettiSwitch: boolean
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
