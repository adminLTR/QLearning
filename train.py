import json
import random
import time
from tqdm import tqdm

# Acciones posibles
actions = ["green_NS", "green_EW", "stay"]
Q = {}

# Hiperparámetros
alpha = 0.1     # learning rate
gamma = 0.9     # discount factor
epsilon = 0.5   # exploración

def get_state():
    ny = random.randint(0, 3) # 
    nx = random.randint(0, 3) #
    al = random.randint(0, 1) #
    tw = random.randint(0, 3)
    py = random.randint(0, 3) #
    px = random.randint(0, 3) #
    epy = random.randint(0, 1) # 
    epx = random.randint(0, 1) #
    eny = random.randint(0, 1) #
    enx = random.randint(0, 1) #
    dy = random.randint(0, 3) 
    dx = random.randint(0, 3)
    return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{epy}_{epx}_{eny}_{enx}_{dy}_{dx}"

def choose_action(state):
    if state not in Q:
        Q[state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    if random.random() < epsilon:
        return random.choice(actions)
    return max(Q[state], key=Q[state].get)

def get_reward(state, action):
    ny, nx, al, tw, py, px, epy, epx, eny, enx, dy, dx = map(int, state.split("_"))
    reward = 0

    if action == "green_NS":
        reward += (ny * 2) - (nx * 1.5)
        reward += (epy * 5) + (py * 2) + (eny * 3)
        reward -= (tw * 1.5)
        reward += max(0, (3 - dy))
        reward -= (px + epx * 2)

    elif action == "green_EW":
        reward += (nx * 2) - (ny * 1.5)
        reward += (epx * 5) + (px * 2) + (enx * 3)
        reward -= (tw * 1.5)
        reward += max(0, (3 - dx))
        reward -= (py + epy * 2)

    elif action == "stay":
        reward -= (ny + nx) + (tw * 2)
        reward -= (epy + epx) * 3

    return reward

def simulate_next_state(state, action):
    ny, nx, al, tw, py, px, epy, epx, eny, enx, dy, dx = map(int, state.split("_"))

    if action == "green_NS":
        ny = max(0, ny - random.randint(1, 2))
        tw = 0
    elif action == "green_EW":
        nx = max(0, nx - random.randint(1, 2))
        tw = 0
    else:
        tw = min(3, tw + 1)

    # Regeneración parcial de tráfico
    ny = min(3, ny + random.randint(0, 1))
    nx = min(3, nx + random.randint(0, 1))
    py = random.randint(0, 3)
    px = random.randint(0, 3)
    epy = random.randint(0, 1)
    epx = random.randint(0, 1)
    eny = random.randint(0, 1)
    enx = random.randint(0, 1)
    dy = random.randint(0, 3)
    dx = random.randint(0, 3)
    al = 1 if action == "green_NS" else 0 if action == "green_EW" else al

    return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{epy}_{epx}_{eny}_{enx}_{dy}_{dx}"

def update_q(state, action, reward, next_state):
    if next_state not in Q:
        Q[next_state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    max_q_next = max(Q[next_state].values())
    Q[state][action] += alpha * (reward + gamma * max_q_next - Q[state][action])

def save_q_table(filename="qtable.json"):
    with open(filename, "w") as f:
        json.dump(Q, f, indent=2)

  

def train(episodes=10000, autosave_interval=1000000):
    unique_states = set()
    start_time = time.time()

    for episode in tqdm(range(1, episodes + 1), desc="Entrenando"):
        state = get_state()
        action = choose_action(state)
        reward = get_reward(state, action)
        next_state = simulate_next_state(state, action)
        update_q(state, action, reward, next_state)

        unique_states.add(state)

    elapsed = time.time() - start_time
    print(f"\n✅ Entrenamiento completo en {elapsed:.2f} segundos.")
    print(f"📊 Estados únicos visitados: {len(unique_states)} de ~2,097,152 posibles.")

    save_q_table()

# Ejecutar entrenamiento
train(25000000)

# Consulta de ejemplo
ejemplo = "2_0_0_0_0_2_0_0_0_1_3_3"
mejor_accion = obtener_mejor_accion(ejemplo)
if mejor_accion:
    print(f"Mejor acción para el estado {ejemplo}: {mejor_accion}")
