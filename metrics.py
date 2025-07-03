import json
import random
from train import get_reward, get_state, simulate_next_state

with open("qtable.json", "r") as f:
    Q = json.load(f)

episodes = 10000
rewards = []
vehicle_queue_Y = []
vehicle_queue_X = []
changes = []


def choose_best_action(state):
    if state not in Q:
        return random.choice(["green_Y", "green_X"])
    return max(Q[state], key=Q[state].get)

change_counter = 0
for ep in range(episodes):
    state = get_state()
    total_reward = 0
    prev_action = None
    episode_changes = 0

    for step in range(50):  # duración del episodio
        action = choose_best_action(state)

        if action != prev_action and prev_action is not None:
            episode_changes += 1
        prev_action = action

        reward = get_reward(state, action)
        total_reward += reward

        ny, nx, *_ = map(int, state.split("_"))
        vehicle_queue_Y.append(ny)
        vehicle_queue_X.append(nx)

        state = simulate_next_state(state, action)

    rewards.append(total_reward)
    changes.append(episode_changes)


import matplotlib.pyplot as plt

plt.figure(figsize=(12, 8))

# Gráfico 1: Recompensa por episodio
plt.subplot(2, 2, 1)
import numpy as np

def moving_average(data, window_size=10):
    return np.convolve(data, np.ones(window_size), 'valid') / window_size
plt.plot(moving_average(rewards, 1000))
# plt.plot(rewards)
plt.title("Recompensa por episodio")
plt.xlabel("Episodio")
plt.ylabel("Recompensa acumulada")

# Gráfico 2: Vehículos en eje Y
plt.subplot(2, 2, 2)
plt.plot(vehicle_queue_Y, color="blue", alpha=0.6, label="Y")
# plt.plot(vehicle_queue_X, color="red", alpha=0.6, label="X")
plt.title("Cola de vehículos por paso")
plt.xlabel("Paso")
plt.ylabel("Cantidad de vehículos")
plt.legend()

# Gráfico 3: Cambios de semáforo por episodio
plt.subplot(2, 2, 3)
plt.plot(changes, color="green")
plt.title("Número de cambios de semáforo")
plt.xlabel("Episodio")
plt.ylabel("Cambios")

# Gráfico 4: Histograma de recompensas
plt.subplot(2, 2, 4)
plt.hist(rewards, bins=20, color="orange")
plt.title("Distribución de recompensas")
plt.xlabel("Recompensa total")
plt.ylabel("Frecuencia")



plt.tight_layout()
plt.show()


avg_reward = sum(rewards) / len(rewards)
avg_cars = (sum(vehicle_queue_Y) + sum(vehicle_queue_X)) / (len(vehicle_queue_Y) + len(vehicle_queue_X))
eficiencia = avg_reward / (avg_cars + 1)
print(f"⚙️ Eficiencia global del agente: {eficiencia:.2f}")
