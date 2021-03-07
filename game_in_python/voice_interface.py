import speech_recognition as sr # recognise speech
import playsound # to play an audio file
from gtts import gTTS # google text to speech
import random
import tempfile

import pyttsx3
engine = pyttsx3.init()


"""
Only words on local CLI and require several modules...
Needs to update to Flask version to work in browsers!
"""

def say(phrase=str):
    # Using Google TTS:
    # with tempfile.NamedTemporaryFile(delete=True) as file:
    #     tts = gTTS(text=phrase, lang='en-US') # text to speech(voice)
    #     audio_file = f'{file.name}.mp3'
    #     tts.save(audio_file) # save as temporary mp3

    #     print(f"[Says]: {phrase}") # print what is to be said
    #     playsound.playsound(audio_file) # play the audio file
    
    # Using PyTTS:
    print(f"[Says]: {phrase}") # print what is to be said
    engine.say(phrase)
    engine.runAndWait()



def voice_input( prompt=False):
    r = sr.Recognizer() # initialise a recogniser
    with sr.Microphone() as source:
        # Say prompt message if it's given
        if prompt:
            say(prompt)
        
        print('Listening now... ')
        audio = r.listen(source)
        recognised = ''

        try:
            recognised = r.recognize_google(audio)  # audio to text; using Sphinx or Google
            print(f"[Heard]: {recognised.lower()}") # print what user said 
        except sr.UnknownValueError: # error: recognizer does not understand
            say('I didn\'t get that')
        except sr.RequestError:
            say('Sorry, the service is down') # error: recognizer is not connected
        
        return recognised.lower()

# Two input/output modes, depending on using typing or talking
def get_input(prompt=str, audio=False):
    
    if audio==False:
        return input(prompt)
    else:
        return voice_input(prompt)


def get_output(prompt=str, audio=False):
    
    if audio==False:
        print(prompt)
    else:
        say(prompt)




def play(effect, audio=False):
    # Only play sound effects when audioOn in main program
    if audio==False:
        return

    if effect=='correct':
        playsound.playsound('audio_correct.wav')
    if effect=='win':
        playsound.playsound('audio_win.wav')
    if effect=='wrong':
        playsound.playsound('audio_wrong.wav')

if __name__ == '__main__':
    say('Hello I can speak')
    voice_input('tell me something')