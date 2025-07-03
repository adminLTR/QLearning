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
    Genera un estado aleatorio del entorno del semáforo inteligente.

    El estado está compuesto por 12 variables que representan el contexto
    actual del cruce vial, incluyendo tráfico vehicular, peatones, vehículos
    especiales y la luz del semáforo. La salida es una cadena formateada con
    los valores separados por guiones bajos (_), en el siguiente orden:

    Formato:
        "ny_nx_al_tw_py_px_spy_spx_scy_scx_dy_dx"

    Descripción de variables:
        ny   : Número de vehículos en el eje Y (0 a 3)
        nx   : Número de vehículos en el eje X (0 a 3)
        al   : Luz actual del semáforo (0 = verde en X, 1 = verde en Y)
        tw   : Tiempo de espera acumulado del semáforo (0 a 3)
        py   : Número de peatones en el eje Y (0 a 3)
        px   : Número de peatones en el eje X (0 a 3)
        spy  : Presencia de peatones especiales en Y (0 o 1)
        spx  : Presencia de peatones especiales en X (0 o 1)
        scy  : Presencia de vehículos especiales en Y (0 o 1)
        scx  : Presencia de vehículos especiales en X (0 o 1)
        dy   : Distancia del vehículo más cercano a la línea peatonal en Y (0 a 3)
        dx   : Distancia del vehículo más cercano a la línea peatonal en X (0 a 3)

    Returns:
        str: Cadena que representa el estado actual simulado del entorno.
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
    """
    Selecciona una acción para un estado dado utilizando una política 
    ε-greedy (epsilon-greedy).

    Si el estado no existe aún en la tabla Q, se inicializa con valores 
    aleatorios pequeños para cada acción posible.

    Estrategia:
    - Con probabilidad ε (exploración), se elige una acción aleatoria.
    - Con probabilidad (1 - ε) (explotación), se elige la acción con el 
      mayor valor Q conocido.

    Args:
        state (str): Cadena que representa el estado actual del entorno 
                     (formato generado por get_state()).

    Returns:
        str: Acción seleccionada, que puede ser "green_Y" o "green_X".
    """
    if state not in Q:
        Q[state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    if random.random() < epsilon:
        return random.choice(actions)
    return max(Q[state], key=Q[state].get)

def get_reward(state, action):
    """
    Calcula la recompensa para una acción dada en un estado específico.

    Esta función simula un entorno de semáforo inteligente y devuelve una
    recompensa numérica basada en varios factores que influyen en la 
    decisión del semáforo, como la presencia de vehículos especiales 
    (ej. ambulancias), peatones normales y especiales, acumulación de tráfico,
    y la distancia de los autos a la línea peatonal.

    Lógica de recompensa:
    - Se prioriza el paso de vehículos especiales (alta recompensa).
    - Se da importancia a peatones especiales, pero menos que a vehículos especiales.
    - Se penaliza la acumulación excesiva de autos (cuadráticamente).
    - Se valora la proximidad de los autos a la línea peatonal.
    - Se penaliza mantener una luz verde demasiado tiempo (representado por `tw`).

    Args:
        state (str): Cadena del estado actual, en formato 
                     "ny_nx_al_tw_py_px_spy_spx_scy_scx_dy_dx".
        action (str): Acción tomada, ya sea "green_Y" o "green_X".

    Returns:
        float: Valor de recompensa calculado.
    """

    ny, nx, al, tw, py, px, spy, spx, scy, scx, dy, dx = map(int, state.split("_"))
    reward = 0

    if action == "green_Y":
        # Vehículos especiales
        if scy: reward += 100
        if scx: reward -= 100

        # Peatones especiales
        reward += spy * 3 - spx * 3

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

        reward += spx * 3 - spy * 3
        reward += nx * 5 - ny * 5
        reward -= nx**2 + ny**2
        reward += px * 2 - py * 2

        if dx <= 1: reward += 5
        if dy <= 1: reward -= 5

    # Penaliza por mantener demasiado tiempo sin cambiar
    reward -= tw * 10

    return reward


def simulate_next_state(state, action):
    """
    Simula el próximo estado del entorno tras ejecutar una acción.

    Esta función modela de forma simplificada cómo cambia el entorno 
    (semáforo inteligente) al ejecutar una acción determinada ("green_Y" o "green_X"),
    incluyendo la reducción del tráfico actual, el paso de vehículos y peatones,
    y la generación aleatoria de nuevos elementos.

    Lógica principal:
    - Disminuye el tráfico y los peatones en el eje con luz verde.
    - Reinicia el tiempo de espera `tw` al cambiar de luz.
    - Genera aleatoriamente nuevos autos, peatones y distancias.
    - Actualiza la luz activa (`al`) de acuerdo a la acción tomada.

    Args:
        state (str): Cadena que representa el estado actual en formato:
                     "ny_nx_al_tw_py_px_spy_spx_scy_scx_dy_dx"
        action (str): Acción ejecutada, puede ser "green_Y" (dar paso en eje Y)
                      o "green_X" (dar paso en eje X).

    Returns:
        str: Cadena con el nuevo estado simulado en el mismo formato.
    """
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
    """
    Actualiza el valor Q (Q-table) para un estado y acción específicos
    utilizando la ecuación del Q-Learning.

    Esta función implementa la regla de actualización de Q-Learning, la cual
    permite al agente aprender a través de la interacción con el entorno. 
    Se ajusta el valor de Q para reflejar una mejor estimación del valor esperado
    de tomar una acción en un estado determinado y luego seguir la mejor política.

    Si el `next_state` no existe en la Q-table, se inicializa con valores pequeños aleatorios.

    Fórmula:
        Q(s, a) ← Q(s, a) + α * [r + γ * max_a' Q(s', a') - Q(s, a)]

    Donde:
    - s  : estado actual
    - a  : acción tomada
    - r  : recompensa recibida
    - s' : siguiente estado
    - α  : tasa de aprendizaje (alpha)
    - γ  : factor de descuento (gamma)

    Args:
        state (str): Estado actual antes de tomar la acción.
        action (str): Acción ejecutada desde el estado actual.
        reward (float): Recompensa obtenida al tomar la acción.
        next_state (str): Estado resultante después de ejecutar la acción.
    """
    if next_state not in Q:
        Q[next_state] = {a: random.uniform(-0.1, 0.1) for a in actions}
    max_q_next = max(Q[next_state].values())
    Q[state][action] += alpha * (reward + gamma * max_q_next - Q[state][action])

def save_q_table(filename="qtable.json"):
    """
    Guarda la tabla Q (Q-table) actual en un archivo JSON.

    Esta función persiste el diccionario `Q`, que representa la tabla 
    de valores Q aprendidos por el agente durante el entrenamiento. 
    El archivo generado puede ser reutilizado posteriormente para continuar 
    el aprendizaje o ejecutar decisiones sin necesidad de reentrenar.

    Args:
        filename (str): Nombre del archivo donde se guardará la Q-table.
                        Por defecto es 'qtable.json'.

    Ejemplo:
        save_q_table("mi_qtable.json")
    """
    with open(filename, "w") as f:
        json.dump(Q, f, indent=2)
  
def train(episodes=10000):
    """
    Entrena al agente mediante el algoritmo Q-Learning por un número determinado de episodios.

    Durante cada episodio, se genera un estado aleatorio del entorno (intersección vial),
    se selecciona una acción basada en una política ε-greedy, se calcula la recompensa,
    se simula el siguiente estado, y se actualiza la Q-table con la información obtenida.

    También se lleva un registro de todos los estados únicos visitados durante el entrenamiento
    para evaluar la exploración del agente. Al finalizar, se guarda la Q-table en un archivo JSON.

    Args:
        episodes (int): Número de episodios de entrenamiento. Por defecto es 10,000.

    Salida:
        Imprime el tiempo total de entrenamiento y la cantidad de estados únicos visitados.
        Guarda el archivo 'qtable.json' con la Q-table entrenada.

    Ejemplo de uso:
        train(50000)
    """
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

if __name__ == '__main__':
    # Ejecutar entrenamiento
    train(25000000)

