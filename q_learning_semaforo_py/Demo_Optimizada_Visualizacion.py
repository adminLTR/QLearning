import pygame
import random
import itertools
import threading
from collections import defaultdict
from q_learning import QLearningAgent, Action

pygame.init()

display_width = 600
display_height = 600

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 128, 0)
AMBAR = (226, 148, 58)
C1 = (0, 166, 255)
FPS = 24

screen = pygame.display.set_mode((display_width, display_height))
pygame.display.set_caption('Q-learning Semáforo inteligente')

class Car(object):
    def __init__(self, x, y, width, height, light, group):
        self.rect = pygame.draw.rect(screen, C1, (x, y, width, height)) #aqui dibuja un carro en una pos dada, el retorno de esta funcion es la posicion
        self.drive = True
        self.light = light
        self.carGroup = group
        self.carInFront = self.carGroup[-1] if len(self.carGroup) > 0 else None #aqui se hace que cada carro conozca al primero de su grupo verdad?

    
    # Parametros: Instancia del objeto y contador de penalizaciones
    # Función: Si carro es drive = True se ejecuta la actualizacion de su posicion, sin contarse penalidad
    # caso contrario, se incrementa en un el contador de penalidad y el carro permanece en la misma posicion
    # Retorno: None
    
    def update(self, count):
        self.drive = True
        car_group, car, light, car_in_front = self.carGroup, self.rect, self.light, self.carInFront
        if car_group is topCars:
            # IF reached edge of screen DESTROY car
            if car.y >= 610:
                i = car_group.index(self)
                if len(car_group) > 1:
                    car_group[i + 1].carInFront = None
                car_group.remove(self)
                return
            # IF at traffic light or at rear of next car then STOP
            if (car.y + car.height == light.rect.y + light.rect.height and light.status is False) \
                    or (car_in_front is not None and car.y + car.height >= car_in_front.rect.y - 10):
                self.drive = False
            # IF it's okay to drive then MOVE
            if self.drive: #lo muevo hacia abajo en 10 pixeles
                car.move_ip(0, 10) #con move_ip actualizo su posicion, es un metodo de pygame
        elif car_group is leftCars:
            if car.x >= 610:
                i = car_group.index(self)
                if len(car_group) > 1:
                    car_group[i + 1].carInFront = None
                car_group.remove(self)
                return
            if (car.x + car.width == light.rect.x + light.rect.width and light.status is False) or (
                    car_in_front is not None and car.x + car.width >= car_in_front.rect.x - 10):
                self.drive = False
            if self.drive: #lo muevo hacia la derecha en 10 px es decir (0,-10) lo manda hacia arriba en Y
                car.move_ip(10, 0) 
        elif car_group is rightCars:
            if car.x <= -20:
                i = car_group.index(self)
                if len(car_group) > 1:
                    car_group[i + 1].carInFront = None
                car_group.remove(self)
                return
            if (car.x == light.rect.x and light.status is False) or (
                    car_in_front is not None and car.x <= car_in_front.rect.x + car_in_front.rect.width + 10):
                self.drive = False
            if self.drive:
                car.move_ip(-10, 0)
        elif car_group is bottomCars:
            if car.y <= -20:
                i = car_group.index(self)
                if len(car_group) > 1:
                    car_group[i + 1].carInFront = None
                car_group.remove(self)
                return
            if (car.y == light.rect.y and light.status is False) or (
                    car_in_front is not None and car.y <= car_in_front.rect.y + car_in_front.rect.height + 10):
                self.drive = False
            if self.drive:
                car.move_ip(0, -10)
        # Record performance
        if self.drive is False:
            bucket = count // PERFORMANCE_STEPS
            performance_dict[bucket] += 1

    def draw(self):
        pygame.draw.rect(screen, C1, self.rect) # Actualiza la posicion utilizando las coordenadas anteriores

    # Returns a value between 0 & 10
    # A distance of 10 means that there is no car
    def dist_from_light(self):
        light, car, car_group = self.light, self.rect, self.carGroup
        distance = -1
        if car_group is topCars:
            distance = ((car.y + car.height) - (car.y + car.height)) / 10
        elif car_group is leftCars:
            distance = ((light.rect.x + light.rect.width) - (car.x + car.width)) / 10
        elif car_group is rightCars:
            distance = (car.x - light.rect.x) / 10
        elif car_group is bottomCars:
            distance = (car.y - light.rect.y) / 10
        return distance if 0 <= distance < 9 else 9


class TrafficLight(object):
    def __init__(self, x, y, width, height, status):
        self.rect = pygame.draw.rect(screen, GREEN, (x, y, width, height)) 
        self.colour = GREEN if status else RED
        self.status = status

    def switch(self):  # Es el que fuerza que siempre se pase por ambar
        tiempo = round(1 / FPS, 2)  # me da 66ms para 15 fps
        factor = 2.5 #el video que te comparti uso 2.5 ahi podemos ir jugando
        self.colour = AMBAR  # Cambia a color ámbar antes de la transición
        temporizador = threading.Timer(factor*tiempo, self.switch_core)
        temporizador.start()  # Inicia el temporizador

    def switch_core(self): #hace efectivo el cambio de color y es invocado despues de pasar por ambar
        self.colour = RED if self.status else GREEN
        self.status = not self.status

    def draw(self):
        pygame.draw.rect(screen, self.colour, self.rect)

def get_state(time_delay):
    closest_top_bottom_car = 9
    closest_left_right_car = 9
    for c in itertools.chain(topCars, bottomCars):
        closest_top_bottom_car = min(closest_top_bottom_car, c.dist_from_light())
    for c in itertools.chain(leftCars, rightCars):
        closest_left_right_car = min(closest_left_right_car, c.dist_from_light())
    light_state = 1 if topLight.status else 0 #2: aqui veo que el estado de top es un reflejo de light_state
    return closest_top_bottom_car, closest_left_right_car, light_state, time_delay
#3: por lo tanto que cuando top es 1 tengo verde en Y y rojo en X
def write_comparison_results(filename, q_learning_penalty, fast_switch_penalty, modelo_entrenado_penalty):
    with open(filename, 'w') as f:
        f.write("method,penalty\n")
        f.write(f"q_learning,{q_learning_penalty}\n")
        f.write(f"fast_switch,{fast_switch_penalty}\n")
        f.write(f"modelo_entrenado,{modelo_entrenado_penalty}\n")


def export_q_table_metodo_perron(q_table, filename):
    with open(filename, 'w') as f:
        for state, reward in q_table.items():
            #mi salida esperada es 
            # q_table[a][b][c][d][0]
            # q_table[a][b][c][d][1] donde a,b,c,d son numeros validos segun mis estados, mi duda es que determina que se deje de escribir en el archivo
            linea_stay = f"q_table[{state[0]}][{state[1]}][{state[2]}][{state[3]}][0] = {reward[0]};"#el ultimo indice me permite eliminar la necesidad de simular
            linea_switch = f"q_table[{state[0]}][{state[1]}][{state[2]}][{state[3]}][1] = {reward[1]};" #una lista como el valor que almacena mi array
            # Para depurar utilizare aqui mismo mi q pa ver p
            print(f"{state} --> {reward}\n")
            f.write(f"{linea_stay}\n")
            f.write(f"{linea_switch}\n")

def run_q_learning():
    clock = pygame.time.Clock()
    screen.fill(WHITE)
    q_learning_agent = QLearningAgent(state=get_state(0), action=Action.STAY)
    q_learning_penalty = 0
    time_delay = 0

    for count in range(ITERACIONES):
        #screen.fill(WHITE)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
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
        #para entrenar aprovecho al epsilon de next_best_action
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
        clock.tick(FPS)
        pygame.display.update()

def start():
    screen.fill(WHITE)
    run_q_learning()
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


