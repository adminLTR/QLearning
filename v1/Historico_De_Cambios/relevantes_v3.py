import pygame
import random
import itertools
from collections import defaultdict
from q_learning import QLearningAgent, Action

pygame.init()

display_width = 600
display_height = 600

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 128, 0)
C1 = (0, 166, 255)

screen = pygame.display.set_mode((display_width, display_height))
pygame.display.set_caption('Q-learning Semáforo inteligente')
class Car(object):
    #No se cambio el codigo
class TrafficLight(object):
    #No se cambio el codigo
def get_state(time_delay):
    #No se cambio el codigo
def write_comparison_results(filename, q_learning_penalty, fast_switch_penalty, modelo_entrenado_penalty):
    with open(filename, 'w') as f:
        f.write("method,penalty\n")
        f.write(f"q_learning,{q_learning_penalty}\n")
        f.write(f"fast_switch,{fast_switch_penalty}\n")
        f.write(f"modelo_entrenado,{modelo_entrenado_penalty}\n")

def export_q_table_to_cpp(q_table, filename):
    with open(filename, 'w') as f:
        f.write("std::unordered_map<std::tuple<int, int, int, int>, std::array<double, 2>> q_table = {\n")
        for state, actions in q_table.items():
            state_str = f"{{{state[0]}, {state[1]}, {state[2]}, {state[3]}}}"
            actions_str = f"{{{actions[0]:.2f}, {actions[1]:.2f}}}"
            f.write(f"    {{{state_str}, {actions_str}}},\n")
        f.write("};\n")

def run_q_learning():
    screen.fill(WHITE)
    q_learning_agent = QLearningAgent(state=get_state(0), action=Action.STAY)
    q_learning_penalty = 0
    time_delay = 0

    for count in range(ITERACIONES):
        if count % (random.randint(0, 10) + 5) == 0:
            car_to_append = random.randint(0, 3)
            if car_to_append == 0:
                topCars.append(Car(307, 0, 10, 10, topLight, topCars))
            elif car_to_append == 1:
                leftCars.append(Car(0, 283, 10, 10, leftLight, leftCars))
            elif car_to_append == 2:
                rightCars.append(Car(590, 307, 10, 10, rightLight, rightCars))
            elif car_to_append == 3:
                bottomCars.append(Car(283, 590, 10, 10, bottomLight, bottomCars))
        # Draw lanes
        pygame.draw.rect(screen, BLACK, (280, 0, 38, 600))
        pygame.draw.rect(screen, BLACK, (0, 280, 600, 38))

        action = q_learning_agent.next_best_action(state=get_state(time_delay))
        for l in lights:
            l.draw()

        if action == Action.SWITCH and time_delay == 0:
            time_delay = 3
            for l in lights:
                l.switch()

        for carGroup in allCars:
            for c in carGroup:
                c.update(count=count)
                c.draw() #agregado
                if not c.drive:
                    q_learning_penalty += 1

        time_delay = max(time_delay - 1, 0)
        pygame.display.flip()
    export_q_table_to_cpp(q_learning_agent._q_table, "q_table_traffic_v3.h")
    return q_learning_penalty, q_learning_agent

def run_fast_switch():
    fast_switch_penalty = 0
    for count in range(ITERACIONES):
        if count % (random.randint(0, 10) + 5) == 0:
            car_to_append = random.randint(0, 3)
            if car_to_append == 0:
                topCars.append(Car(307, 0, 10, 10, topLight, topCars))
            elif car_to_append == 1:
                leftCars.append(Car(0, 283, 10, 10, leftLight, leftCars))
            elif car_to_append == 2:
                rightCars.append(Car(590, 307, 10, 10, rightLight, rightCars))
            elif car_to_append == 3:
                bottomCars.append(Car(283, 590, 10, 10, bottomLight, bottomCars))

        if count % 3 == 0: #aqui debe cambiar cada 3 para hacerlo justo
            for l in lights:
                l.switch()

        for carGroup in allCars:
            for c in carGroup:
                c.update(count=count)
                if not c.drive:
                    fast_switch_penalty += 1

    return fast_switch_penalty

def run_modelo_entrenado(tabla_entrenada):
    screen.fill(WHITE)
    q_learning_agent = tabla_entrenada
    q_learning_trained_penalty = 0
    time_delay = 0

    for count in range(ITERACIONES):
        if count % (random.randint(0, 10) + 5) == 0:
            car_to_append = random.randint(0, 3)
            if car_to_append == 0:
                topCars.append(Car(307, 0, 10, 10, topLight, topCars))
            elif car_to_append == 1:
                leftCars.append(Car(0, 283, 10, 10, leftLight, leftCars))
            elif car_to_append == 2:
                rightCars.append(Car(590, 307, 10, 10, rightLight, rightCars))
            elif car_to_append == 3:
                bottomCars.append(Car(283, 590, 10, 10, bottomLight, bottomCars))
        # Draw lanes
        pygame.draw.rect(screen, BLACK, (280, 0, 38, 600))
        pygame.draw.rect(screen, BLACK, (0, 280, 600, 38))

        action = q_learning_agent.next_best_action(state=get_state(time_delay))
        for l in lights:
            l.draw()

        if action == Action.SWITCH and time_delay == 0:
            time_delay = 3
            for l in lights:
                l.switch()

        for carGroup in allCars:
            for c in carGroup:
                c.update(count=count)
                c.draw() #agregado
                if not c.drive:
                    q_learning_trained_penalty += 1

        time_delay = max(time_delay - 1, 0)
        pygame.display.flip()
    return q_learning_trained_penalty


def start():
    screen.fill(WHITE)
    retorno_q_learning = run_q_learning()
    q_learning_penalty = retorno_q_learning[0]
    fast_switch_penalty = run_fast_switch()
    modelo_entrenado_penalty = run_modelo_entrenado(retorno_q_learning[1])
    write_comparison_results("penalty_results_3_post.csv", q_learning_penalty, fast_switch_penalty,modelo_entrenado_penalty)
    pygame.quit()

if __name__ == '__main__':
    topLight = TrafficLight(295, 270, 10, 10, True) #1: veo que se inicializan los del eje Y como true
    rightLight = TrafficLight(320, 295, 10, 10, False)
    bottomLight = TrafficLight(295, 320, 10, 10, True)
    leftLight = TrafficLight(270, 295, 10, 10, False)
    lights = [topLight, rightLight, bottomLight, leftLight]
    topCars = []
    bottomCars = []
    leftCars = []
    rightCars = []
    allCars = [topCars, leftCars, rightCars, bottomCars]
    ITERACIONES=1000000
    PERFORMANCE_STEPS = 1000
    performance_dict = defaultdict(int)
    start()
