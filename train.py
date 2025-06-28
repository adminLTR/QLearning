import json
import random

# Acciones del semáforo
actions = ["green_NS", "green_EW", "stay"]
Q = {}

# Hiperparámetros
alpha = 0.1  # learning rate
gamma = 0.9  # discount factor
epsilon = 0.2  # exploración

def get_state():
    """
    Genera un estado aleatorio del entorno de tráfico
    """
    ny = random.randint(0, 5)
    nx = random.randint(0, 5)
    al = random.randint(0, 1)
    tw = random.randint(0, 10)
    py = random.randint(0, 3)
    px = random.randint(0, 3)
    epy = random.randint(0, 1)
    epx = random.randint(0, 1)
    eny = random.randint(0, 1)
    enx = random.randint(0, 1)
    dy = random.randint(0, 10)
    dx = random.randint(0, 10)
    return f"{ny}_{nx}_{al}_{tw}_{py}_{px}_{epy}_{epx}_{eny}_{enx}_{dy}_{dx}"

def choose_action(state):
    """
    Elegir acción según política epsilon-greedy
    """
    if state not in Q:
        Q[state] = {a: 0.0 for a in actions}
    if random.random() < epsilon:
        return random.choice(actions)
    return max(Q[state], key=Q[state].get)

def get_reward(state, action):
    """
    Función de recompensa basada en la acción y el estado
    """
    ny, nx, al, tw, py, px, epy, epx, eny, enx, dy, dx = map(int, state.split("_"))

    reward = 0

    if action == "green_NS":
        reward += ny * 2  # beneficioso liberar autos en Y
        reward += py      # peatones comunes
        reward += epy * 2 # prioridad para peatones especiales
        reward += eny * 2 # prioridad autos especiales
        reward -= nx      # penaliza no liberar X si hay muchos
        reward -= tw      # penaliza mucho tiempo de espera

    elif action == "green_EW":
        reward += nx * 2
        reward += px
        reward += epx * 2
        reward += enx * 2
        reward -= ny
        reward -= tw

    elif action == "stay":
        reward -= tw * 2  # penaliza no actuar si hay espera
        reward -= (ny + nx)

    return reward

def update_q(state, action, reward, next_state):
    """
    Actualiza la Q-table usando la fórmula de Q-Learning
    """
    if next_state not in Q:
        Q[next_state] = {a: 0.0 for a in actions}
    max_q_next = max(Q[next_state].values())
    Q[state][action] += alpha * (reward + gamma * max_q_next - Q[state][action])

def train(episodes=10000):
    for _ in range(episodes):
        print(f"Epoch {_+1}-------------------------------")
        state = get_state()
        action = choose_action(state)
        reward = get_reward(state, action)
        next_state = get_state()
        update_q(state, action, reward, next_state)

def save_q_table(filename="qtable.json"):
    with open(filename, "w") as f:
        json.dump(Q, f, indent=2)

def obtener_mejor_accion(state):
    if state not in Q:
        print(f"Estado '{state}' no encontrado en la Q-table.")
        return None
    return max(Q[state], key=Q[state].get)

# Entrenamiento
train(7000000)
save_q_table()

# Consulta de ejemplo
ejemplo = "3_2_1_4_1_1_0_0_0_0_5_4"
mejor_accion = obtener_mejor_accion(ejemplo)
if mejor_accion:
    print(f"Mejor acción para el estado {ejemplo}: {mejor_accion}")