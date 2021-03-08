import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { dmMachine } from './dmGame';

// import Confetti from 'react-confetti'

import Confetti from 'react-dom-confetti';






// inspect({
//     url: "https://statecharts.io/inspect",
//     iframe: false
// });

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



interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;
}
const ReactiveButton = (props: Props): JSX.Element => {
    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear" }} {...props}>
                    Listening...
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

export default function App() {
    


    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {
            send('ENDSPEECH');
        },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {
            send({ type: "ASRRESULT", value: result });
        },
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
    const { confettiSwitch } = current.context;
    const { scoreStr } = current.context;
    const { tally } = current.context;
    const { recResult } = current.context;
    const { ttsAgenda } = current.context;
    // let scoreDisplay= (!tally)? '':'Score: ' //Only show it when tally!=undefined
    
    // Config for confetti, triggered when context.confettiSwitch===true
    const config = {
        angle: 90,
        spread: 360,
        startVelocity: 80,
        elementCount: 350,
        dragFriction: 0.12,
        duration: 5000,
        stagger: 1,
        width: "7px",
        height: "7px",
        perspective: "210px",
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
      };
      


    return (
        <div className="App">
            
            <ReactiveButton state={current} onClick={() => send('CLICK')} />
            
            <div className='confetti'>

                {/* <Confetti recycle={false} numberOfPieces={500} 
                width={window.innerWidth} height={window.innerHeight+200} /> */}
                
                <Confetti active={ confettiSwitch } config={ config }/>
                

                <h2> {scoreStr} <strong>{tally}</strong> </h2>
                {/* <h2> {scoreDisplay} {tally}</h2> */}
                <h2><code> 😼  <strong>{ttsAgenda}</strong> </code></h2>
                <h3> 😅 <strong>{recResult}</strong> </h3>
                
            </div>
            
        </div>
        
    )
};






const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);
