def write_comparison_results(filename, q_learning_penalty, fast_switch_penalty, modelo_entrenado_penalty):
    with open(filename, 'w') as f:
        f.write("method,penalty\n")
        f.write(f"q_learning,{q_learning_penalty}\n")
        f.write(f"fast_switch,{fast_switch_penalty}\n")
        f.write(f"modelo_entrenado,{modelo_entrenado_penalty}\n")