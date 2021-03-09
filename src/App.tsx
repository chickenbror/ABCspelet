import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";

import { dmMachine } from './dmGame';


//Animation effects
import Confetti from 'react-dom-confetti';
import TextLoop from "react-text-loop";



// import { inspect } from "@xstate/inspect";
// inspect({ url:"https://statecharts.io/inspect", iframe: false });


// State machines: ASR-TTS (voice interface) & dmGame
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
const machine = Machine<SDSContext, any, SDSEvent>({
    id: 'root',
    type: 'parallel',
    states: {
        dm: {
            ...dmMachine  //dmGame
        },
        asrtts: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        LISTEN: 'recognising',
                        SPEAK: {
                            target: 'speaking',
                            actions: assign((_context, event) => { return { ttsAgenda: event.value } })
                        }
                    }
                },
                recognising: {
                    initial: 'progress',
                    entry: 'recStart',
                    exit: 'recStop',
                    on: {
                        ASRRESULT: {
                            actions: ['recLogResult',
                                assign((_context, event) => { return { recResult: event.value } })],
                            target: '.match'
                        },
                        // TIMEOUT:"..recStop", //mic off so that say() can work
                        RECOGNISED: 'idle'
                    },
                    states: {
                        progress: {
                        },
                        match: {
                            entry: send('RECOGNISED'),
                        },
                    }
                },
                speaking: {
                    entry: 'ttsStart',
                    on: {
                        ENDSPEECH: 'idle',
                    }
                }
            }
        }
    },
},
    {
        actions: {
            recLogResult: (context: SDSContext) => {
                /* context.recResult = event.recResult; */
                console.log('<< ASR: ' + context.recResult);

            },
            test: () => {
                console.log('test')
            },
            logIntent: (context: SDSContext) => {
                /* context.nluData = event.data */
                console.log('<< NLU intent: ' + context.nluData.intent.name)
            }
        },
    });


//The big button in the centre
interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;
}
const ReactiveButton = (props: Props): JSX.Element => {
    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear"}} {...props}>
                    {/* Listening... */}

                    <TextLoop mask={true} springConfig={{ stiffness: 160, damping: 8 }} className='keywordPrompts'>
                        <div>Listening...</div>
                        <div>Say "hint"</div>
                        <div>Say "pass"</div>
                        <div>Say "clue"</div>
                        <div>Say "skip"</div>
                        <div>Say "stop"</div>
                        <div>Say "restart"</div>
                        <div>Say "repeat"</div>
                    </TextLoop>

                </button>
            );
        case props.state.matches({ asrtts: 'speaking' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "bordering 1s infinite" }} {...props}>
                    Speaking...
                </button>
            );
        default:
            return (
                <button type="button" className="glow-on-hover" {...props}>
                    Play game!
                </button >
            );
    }
}

// React webpage elements 
export default function App() {
    
    //Voice interface events (& console logs)
    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {send('ENDSPEECH') },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {send({ type: "ASRRESULT", value: result })  },
    });
    const [current, send, service] = useMachine(machine, {
        devTools: true,
        actions: {
            recStart: asEffect(() => {
                console.log('Ready to receive a voice input.');
                listen({
                    interimResults: false,
                    continuous: true
                });
            }),
            recStop: asEffect(() => {
                console.log('Recognition stopped.');
                stop()
            }),
            ttsStart: asEffect((context, effect) => {
                console.log('Speaking...');
                speak({ text: context.ttsAgenda })
            }),
            ttsCancel: asEffect((context, effect) => {
                console.log('TTS STOP...');
                cancel()
            }),
            speak: asEffect((context) => {
	            console.log('Speaking...');
                speak({text: context.ttsAgenda })
            }) 
        }
    });

    // dmMachine context to display on webpage
    const { confettiSwitch } = current.context; //triggers confetti when true
    const { tally } = current.context;
    const { recResult } = current.context;
    const { ttsAgenda } = current.context;
    const { letter } = current.context;

    
    // Config for confetti 
    const config = {
        angle: 90,
        spread: 360,
        startVelocity: 80,
        elementCount: 400,
        dragFriction: 0.12,
        duration: 7500,
        stagger: 1,
        width: "7px",
        height: "7px",
        perspective: "210px",
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
      };
    
    let clicked=0;
    const handleClick = () =>{ 
        if(clicked===0){
            console.log("clicked")
            send('CLICK')
            clicked=1
        }else{
            console.log("unclicked")
            send('UNCLICK')
            clicked=0
        }
    }

    //JSX codes
    return (
        <div className="App">
            
            <ReactiveButton state={current} onClick={() => {handleClick()}} /> 
            
            <div className='confetti'>
                <Confetti active={ confettiSwitch } config={ config }/>
            </div>    

            
            <div className='subtitles'>    
                
                <h1>{letter? letter.toUpperCase():''}</h1>
                {/* Shows socre and hearts when tally>=1 */}
                <h2><strong>{tally? 'Score: '+tally : '' }</strong> </h2>
                <h2> <strong>{tally? '💛'.repeat(tally) : '' }</strong> </h2>
                
                <Subtitles voiceout={ttsAgenda} voicein={recResult}/>
            </div>
            
            
        
            
        </div>
        
    )
};

//Displaying output/input of voice interface (ie, ttsAgenga & recResult)
const Subtitles=(props:any) =>{
    return(
        <div>
            {/* Sys subtitles-- only display when ttsAgenda!=undefined */}
            <h2>{props.voiceout? '😼 ':'' }<code> {props.voiceout? props.voiceout:'' } </code></h2> 

            {/* Player subtitles-- only display when recResult!=undefined */}
            <h3> {props.voicein? '😅 '+props.voicein : '' } </h3> 
        </div>
    )
}

// func = Element(props.Parameter) >> jsx tag = <Element Parameter={ pass value here }/>
// function Myelement(props){
//     return(
//         <div>
//             haha i can pass {props.something} which replaces the placeholder here
//         </div>
//     )
// }

