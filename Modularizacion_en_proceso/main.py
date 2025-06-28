import pygame
from entorno import setup_environment
from logica import start_simulation

def main():
    pygame.init()
    screen = pygame.display.set_mode((600, 600))
    pygame.display.set_caption('Q-learning Semáforo inteligente')

    # Configurar entorno
    lights, allCars = setup_environment(screen)

    # Iniciar simulación
    start_simulation(screen, lights, allCars)

    pygame.quit()

if __name__ == "__main__":
    main()
