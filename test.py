import json
import random

actions = ["green_NS", "green_EW"]
Q = {}

alpha = 0.1  # learning rate
gamma = 0.9  # discount factor
epsilon = 0.2

def get_state() -> str:
    """
    Returns a random state in a dict\n
    Where 
        ny: Number of cars in Y (North-South)
        nx: Number of cars in X (East-West)
        al: Actual light (X=0 or Y=1)
        tw: Time cars are already waiting in red side
        py: Number of pedestrians in Y (North-South)
        px: Number of pedestrians in X (East-West)
        epy: Number of special pedestrians in Y (North-South)
        epx: Number of special pedestrians in X (East-West)
        eny: Number of special cars in Y (North-South)
        enx: Number of special cars in X (East-West)
        dy: Distance of the nearest car to pedestrian line in Y (North-South)
        dx: Distance of the nearest car to pedestrian line in X (East-West)
    """
    ny = random.randint(0, 3)
    nx = random.randint(0, 3)
    al = random.randint(0, 1)
    return f"{ny}_{nx}_{al}"

def choose_action(state:str) -> str:
    """
    Chooses an action depending on state in params\n
    if random() < epsilon: (being epsilon a hyperparameter of QLearning)\n
        returns a random action
    else:
        returns the best solution
    """
    if state not in Q:
        Q[state] = {a: 0.0 for a in actions} # Inserts the new state into the QTable with initial data: 0
    if random.random() < epsilon:
        return random.choice(actions)
    return max(Q[state], key=Q[state].get)

def get_reward(state:str, action:str) -> int:
    """
    Returns the reward depending on the state and the action taken by the agent.\n
    If results is negative, it's a bad desicion, else is a good desicion\n
    if action == "green_NS":
        return ns - ew
    else:
        return ew - ns
    
    """
    ns, ew = map(int, state.split("_"))
    if action == "green_NS":
        return ns - ew
    else:
        return ew - ns

def update_q(state:str, action:str, reward:int, next_state:str) -> None:
    """
    
    """
    if next_state not in Q:
        Q[next_state] = {a: 0.0 for a in actions}
    max_q_next = max(Q[next_state].values())
    Q[state][action] += alpha * (reward + gamma * max_q_next - Q[state][action])

def train(episodes=1000):
    for _ in range(episodes):
        state = get_state()
        action = choose_action(state)
        reward = get_reward(state, action)
        next_state = get_state()
        update_q(state, action, reward, next_state)

def save_q_table(filename="qtable.json", csvfile="qtable.csv"):
    with open(filename, "w") as f:
        json.dump(Q, f, indent=2)

def obtener_mejor_accion(state):
    if state not in Q:
        print(f"Estado '{state}' no encontrado en la Q-table.")
        return None
    
    acciones = Q[state]
    mejor_accion = max(acciones, key=acciones.get)
    return mejor_accion

# training
train(10000)
save_q_table("qtable.json")

estado = "1_3"
accion = obtener_mejor_accion(estado)

if accion:
    print(f"Mejor acción para el estado {estado}: {accion}")