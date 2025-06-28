class Car(object):
    #No se cambio el codigo
class TrafficLight(object):
    #No se cambio el codigo
def get_state(time_delay):
    #No se cambio el codigo
def export_q_table_to_cpp(q_table, filename):
    with open(filename, 'w') as f:
        f.write("std::unordered_map<std::tuple<int, int, int, int>, std::array<double, 2>> q_table = {\n")
        for state, actions in q_table.items():
            state_str = f"{{{state[0]}, {state[1]}, {state[2]}, {state[3]}}}"
            actions_str = f"{{{actions[0]:.2f}, {actions[1]:.2f}}}"
            f.write(f"    {{{state_str}, {actions_str}}},\n")
        f.write("};\n")

def write_comparison_results(filename, q_learning_penalty):
    with open(filename, 'w') as f:
        f.write("method,penalty\n")
        f.write(f"q_learning_traffic_v1,{q_learning_penalty}\n")

def start():
    max_iterations = 1000000  # Define un límite de iteraciones AHORA SON 1 MILLON
    count, time_delay = 0, 0
    #clock = pygame.time.Clock() #con esto manejo los FPS
    screen.fill(WHITE)
    # Setup Q-learning agent
    action = Action.STAY
    q_learning_agent = QLearningAgent(state=get_state(time_delay), action=action) #inicialmente no hay carros verdad? y lo que hacemos es esperar a que se generen de manera aleatoria, una

    # Start main event loop
    run = True
    while run:
        if count > max_iterations:
            run = False
            write_to_file(f"count_{count}.csv", performance_dict)
            export_q_table_to_cpp(q_learning_agent._q_table, "q_table_traffic_v1.h")
            break
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    write_to_file(f"count_{count}.csv", performance_dict)
                    pygame.quit()
                    quit()

        # Randomly generate a new car in 1 direction
        if count % (random.randint(0, 10) + 5) == 0:
            car_to_append = random.randint(0, 3)
            if car_to_append == 0:
                topCars.append(Car(307, 0, 10, 10, topLight, topCars))
            elif car_to_append == 1:
                leftCars.append(Car(0, 283, 10, 10, leftLight, leftCars))
            if car_to_append == 2:
                rightCars.append(Car(590, 307, 10, 10, rightLight, rightCars))
            if car_to_append == 3:
                bottomCars.append(Car(283, 590, 10, 10, bottomLight, bottomCars))

        # Draw lanes
        pygame.draw.rect(screen, BLACK, (280, 0, 38, 600))
        pygame.draw.rect(screen, BLACK, (0, 280, 600, 38))

        # (1) Perform step with action and update state
        for carGroup in allCars:
            for c in carGroup:
                c.update(count=count)
                c.draw()
                if not c.drive:
                    q_learning_penalty[0] += 1
        for l in lights:
            l.draw()
        if action == Action.SWITCH and time_delay == 0:
            time_delay = 3
            for l in lights:
                l.switch()

        new_state = get_state(time_delay=time_delay)
        action = q_learning_agent.next_best_action(state=new_state) 
        if count % 1000 == 0:
            print('count =', count // 1000)
        time_delay = max(time_delay - 1, 0)
        count = count + 1
        pygame.display.flip()


if __name__ == '__main__':
    topLight = TrafficLight(295, 270, 10, 10, True) #x,y, width, height color rojito
    rightLight = TrafficLight(320, 295, 10, 10, False) #amarillo
    bottomLight = TrafficLight(295, 320, 10, 10, True) #morado
    leftLight = TrafficLight(270, 295, 10, 10, False) #azul
    lights = [topLight, rightLight, bottomLight, leftLight]

    topCars = []
    bottomCars = []
    leftCars = []
    rightCars = []
    allCars = [topCars, leftCars, rightCars, bottomCars]
    q_learning_penalty = [0]
    PERFORMANCE_STEPS = 1000
    performance_dict = defaultdict(int)

    start() 
    write_comparison_results("penalty_results_traffic_v1.csv", q_learning_penalty[0])
    pygame.quit()
    quit()
