"""Reads questions.json file and create a questions object"""

import random
#============================================================
# Reads questions from external JSON file and updates them to a dictionary
import json
with open('questions.json') as file:
    questions = json.load(file)

    categories={}
    for question in questions['questions']:
        category = question['category']
        answers = question['answers']
        categories[category] = answers


def eligible_cats(letter):
    '''Returns a list of categories that contain things starting with *letter. '''
    cats_with_letter = [cat for cat in categories if len([t for t in categories[cat] if t[0]==letter])>0]
    return cats_with_letter


# Define a questions class, which when instantiated has a random letter & 5 or more associated categories
class questions():
    '''A questions object, with a letter and a list of five relevant categories. '''
    def __init__(self): 
        self.letter = ''
        self.five_cats = []
        
        # Choose a letter&categories pair; and there must be at least 5 categories
        done=False
        while done==False:
            self.letter = random.choice('abcdefghijklmnopqrstvvwxyz') # a random letter
            candidates = eligible_cats(self.letter) 
            if len(candidates)>=5: # Check if there are 5 or more eligible categories, if not, choose a new letter.
                done=True
        
        random.shuffle(candidates) # shuffle the elgible categories
        self.five_cats = candidates 

if __name__=='__main__':
    q = questions()
    print(q.letter)
    print(q.five_cats)