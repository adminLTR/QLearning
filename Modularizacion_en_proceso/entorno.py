import pygame
from collections import defaultdict
from .config.py import GREEN, RED, AMBAR, C1
""" Recomendacion pero curiosamente no veo una dependencia de var global
class Car:
    # Clase `Car` idéntica pero eliminando dependencias directas de variables globales
"""
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

    def switch(self):
        self.colour = RED if self.status else GREEN
        self.status = not self.status

    def draw(self):
        pygame.draw.rect(screen, self.colour, self.rect)

def setup_environment(screen):
    # Inicializar semáforos
    topLight = TrafficLight(295, 270, 10, 10, True)
    rightLight = TrafficLight(320, 295, 10, 10, False)
    bottomLight = TrafficLight(295, 320, 10, 10, True)
    leftLight = TrafficLight(270, 295, 10, 10, False)
    lights = [topLight, rightLight, bottomLight, leftLight]

    # Inicializar autos
    topCars = []
    bottomCars = []
    leftCars = []
    rightCars = []
    allCars = [topCars, leftCars, rightCars, bottomCars]

    return lights, allCars
