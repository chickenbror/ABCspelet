/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    query: string;
    snippet: string;
    person: string;
    weekday: string;
    time: string;
    yes_no: boolean;
    command: string;
    tally: number;
    letter: string;
    questions: any;
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
