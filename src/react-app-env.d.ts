/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;

    tally: number;
    letter: string;
    questions: any;
    scoreStr: string;
    confettiSwitch: boolean
}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'TIMEOUT' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string }
;
