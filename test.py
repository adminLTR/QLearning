import json

class TestCase:
    def __init__(self, state, spected_value):
        self.state = state
        self.spected_value = spected_value

    def test(self, qtable):
        tested_value = get_from_qtable(self.state)
        return self.spected_value == tested_value

def get_from_qtable(state):
    global qtable
    if state not in qtable:
        return None
    actions = qtable[state]
    better_action = max(actions, key=actions.get)
    return better_action

with open('./qtable.json', 'r') as f:
    qtable = json.load(f)

corrects = 0
incorrects = 0

#"{ny}_{nx}_{al}_{tw}_{py}_{px}_{epy}_{epx}_{eny}_{enx}_{dy}_{dx}"
test_cases = [
    TestCase("3_2_0_1_1_2_0_0_0_0_1_2", "green_Y"),
    TestCase("3_2_0_1_1_2_0_0_1_0_1_2", "green_Y"),
    TestCase("3_2_0_1_1_2_0_0_0_1_1_2", "green_X"),
    TestCase("1_3_0_1_1_2_0_0_0_0_1_2", "green_X"),

    # Nuevos casos agregados
    TestCase("0_0_1_0_0_0_0_0_0_0_0_0", "green_X"),  # Estado inicial, sin tráfico, mantener actual (EW)
    TestCase("3_1_1_2_2_1_1_0_0_0_1_1", "green_Y"),  # Más tráfico y espera en Y
    TestCase("1_3_0_3_1_2_0_1_0_1_1_1", "green_X"),  # Más tráfico/espera en X
    TestCase("2_2_0_2_3_3_1_1_0_0_2_1", "green_Y"),  # Empate pero más epy
    TestCase("2_3_1_1_0_0_0_0_1_1_1_2", "green_X"),  # Nada en Y, sc en X
    TestCase("0_2_1_0_0_0_0_0_0_0_0_3", "green_X"),  # Sólo autos viniendo desde X
    TestCase("2_2_0_3_2_2_1_1_1_1_1_1", "green_Y"),  # Empate total, mantener Y
    TestCase("1_1_1_0_1_1_0_0_0_0_2_3", "green_X"),  # Ligeramente más en X
    TestCase("3_3_0_0_3_3_1_1_1_1_3_3", "green_Y"),  # Tráfico completo, dar paso a Y
    TestCase("1_3_1_0_0_2_0_0_0_0_1_1", "green_X"),  # Tráfico completo, dar paso a Y
]

for tc in test_cases:
    if tc.test(qtable):
        corrects += 1
    else:
        incorrects += 1
        print(f"FALLÓ: Estado: {tc.state} - Esperado: {tc.spected_value} - Obtenido: {get_from_qtable(tc.state)}")

print(f"\n✅ Correctos: {corrects}")
print(f"❌ Incorrectos: {incorrects}")