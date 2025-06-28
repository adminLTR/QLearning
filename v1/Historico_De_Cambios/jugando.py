from typing import Tuple, Dict, List
from enum import Enum
import itertools
import random
"""
state = (
    range(2),
    range(2),
    range(2),
    range(2)
)
for i,j,k,l in itertools.product(*state):
    print(i,j,k,l)
"""
state=(0,1,2,3)
car_waiting_in_top_bot_lanes = state[0] == 0 
print(state[-1])



