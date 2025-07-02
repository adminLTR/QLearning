import json
import random
import time
from tqdm import tqdm

# Acciones posibles
actions = ["green_Y", "green_X"]
Q = {}

# Hiperparámetros
alpha = 0.1     # learning rate (Un alpha bajo aprende lentamente, un alpha alto puede ser inestable)
gamma = 0.9     # discount factor (gamma alto prioriza recompensas futuras, gamma bajo prioriza recompensas inmediatas)
epsilon = 0.5   # exploración (epsilon alto explora más, epsilon bajo explora menos)

def get_state() -> str:
    """
    Returns a random state where:
    * ny: Number of cars in Y \n
    * nx: Number of cars in X \n
    * al: Actual light \n
    * tw: Time cars are already waiting \n
    * py: Pedestrians in Y \n
    * px: Pedestrians in X \n
    * spy: Special pedestrians in Y \n
    * spx: Special pedestrians in X \n
    * scy: Special cars in Y \n
    * scx: Special cars in X \n
    * dy: Distance from nearest car to pedestrian line in Y \n
    * dx: Distance from nearest car to pedestrian line in X \n
    STATE: ny_nx_al_tw_py_px_spy_spx_scy_scx_dy_dx
    """
    ny = random.randint(0, 3) # 
    nx = random.randint(0, 3) #
    al = random.randint(0, 1) # 0:x - 1:y
    tw = random.randint(0, 3)
    py = random.randint(0, 3) #
    px = random.randint(0, 3) #
    spy = random.randint(0, 1) # 
    spx = random.randint(0, 1) #
    scy = random.randint(0, 1) #
    scx = random.randint(0, 1) #
    dy = random.randint(0, 3) 
    dx = random.randint(0, 3)
    return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{spy}_{spx}_{scy}_{scx}_{dy}_{dx}"

def choose_action(state):
    if state not in Q:
        Q[state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    if random.random() < epsilon:
        return random.choice(actions)
    return max(Q[state], key=Q[state].get)

# def get_reward(state, action):
#     ny, nx, al, tw, py, px, spy, spx, scy, scx, dy, dx = map(int, state.split("_"))
#     reward = 0

#     if action == "green_Y":
#         reward += (ny) - (nx)
#         reward += (spy * 5) + (py * 2) + (scy * 10)
#         reward -= (tw * 1.5)
#         reward += max(0, (3 - dy))
#         reward -= (px + spx * 2)

#     else:
#         reward += (nx) - (ny)
#         reward += (spx * 5) + (px * 2) + (scx * 10)
#         reward -= (tw * 1.5)
#         reward += max(0, (3 - dx))
#         reward -= (py + spy * 2)

#     return reward
def get_reward(state, action):
    ny, nx, al, tw, py, px, spy, spx, scy, scx, dy, dx = map(int, state.split("_"))
    reward = 0

    if action == "green_Y":
        # Vehículos especiales
        if scy: reward += 100
        if scx: reward -= 100

        # Peatones especiales
        reward += spy * 20 - spx * 20

        # Cantidad de autos
        reward += ny * 5 - nx * 5
        reward -= ny**2 + nx**2  # penaliza acumulación

        # Peatones normales
        reward += py * 2 - px * 2

        # Distancia
        if dy <= 1: reward += 5
        if dx <= 1: reward -= 5

    else:
        if scx: reward += 100
        if scy: reward -= 100

        reward += spx * 20 - spy * 20
        reward += nx * 5 - ny * 5
        reward -= nx**2 + ny**2
        reward += px * 2 - py * 2

        if dx <= 1: reward += 5
        if dy <= 1: reward -= 5

    # Penaliza por mantener demasiado tiempo sin cambiar
    reward -= tw * 2

    return reward

# def simulate_next_state(state, action):
#     ny, nx, al, tw, py, px, spy, spx, scy, scx, dy, dx = map(int, state.split("_"))

#     if action == "green_Y":
#         ny = max(0, ny - random.randint(1, 2))
#         tw = 0
#     else:
#         nx = max(0, nx - random.randint(1, 2))
#         tw = 0

#     # Regeneración parcial de tráfico
#     ny = min(3, ny + random.randint(0, 1))
#     nx = min(3, nx + random.randint(0, 1))
#     py = random.randint(0, 3)
#     px = random.randint(0, 3)
#     spy = random.randint(0, 1)
#     spx = random.randint(0, 1)
#     scy = random.randint(0, 1)
#     scx = random.randint(0, 1)
#     dy = random.randint(0, 3)
#     dx = random.randint(0, 3)
#     al = 1 if action == "green_Y" else 0

#     return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{spy}_{spx}_{scy}_{scx}_{dy}_{dx}"

def simulate_next_state(state, action):
    ny, nx, al, tw, py, px, spy, spx, scy, scx, dy, dx = map(int, state.split("_"))

    # Reducir tráfico del eje con luz verde
    if action == "green_Y":
        ny = max(0, ny - random.randint(1, 2))
        py = max(0, py - random.randint(0, 1))
        spy = max(0, spy - 1)
        scy = 0  # asumimos que pasó
        tw = 0
    else:
        nx = max(0, nx - random.randint(1, 2))
        px = max(0, px - random.randint(0, 1))
        spx = max(0, spx - 1)
        scx = 0
        tw = 0

    # Regenerar nuevos vehículos y peatones
    ny = min(3, ny + random.randint(0, 1))
    nx = min(3, nx + random.randint(0, 1))
    py = min(3, py + random.randint(0, 1))
    px = min(3, px + random.randint(0, 1))
    spy = random.randint(0, 1)
    spx = random.randint(0, 1)
    scy = random.randint(0, 1)
    scx = random.randint(0, 1)
    dy = random.randint(0, 3)
    dx = random.randint(0, 3)
    al = 1 if action == "green_Y" else 0

    return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{spy}_{spx}_{scy}_{scx}_{dy}_{dx}"

def update_q(state, action, reward, next_state):
    if next_state not in Q:
        Q[next_state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    max_q_next = max(Q[next_state].values())
    Q[state][action] += alpha * (reward + gamma * max_q_next - Q[state][action])

def save_q_table(filename="qtable.json"):
    with open(filename, "w") as f:
        json.dump(Q, f, indent=2)
  
def train(episodes=10000):
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
# ejemplo = "2_0_0_0_0_2_0_0_0_1_3_3"
# mejor_accion = obtener_mejor_accion(ejemplo)
# if mejor_accion:
#     print(f"Mejor acción para el estado {ejemplo}: {mejor_accion}")
