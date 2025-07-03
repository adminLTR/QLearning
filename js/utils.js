/**
 * Normaliza la cantidad de autos en un eje a un valor discreto entre 0 y 3.
 * 
 * Este método agrupa cantidades de vehículos en niveles de tráfico para facilitar
 * su uso como entrada discreta en modelos de aprendizaje por refuerzo.
 * 
 * Rango de salida:
 * - 0: Sin autos
 * - 1: Baja cantidad (1–7 autos)
 * - 2: Media cantidad (8–15 autos)
 * - 3: Alta cantidad (16 o más autos)
 * 
 * @param {number} n - Número de autos detectados en un eje.
 * @returns {number} Nivel de tráfico normalizado (0–3).
 * 
 * @example
 * normalizeNumberCars(0);  // 0
 * normalizeNumberCars(6);  // 1
 * normalizeNumberCars(10); // 2
 * normalizeNumberCars(20); // 3
 */
function normalizeNumberCars(n) {
    if (n <= 0) { return 0; }
    if (n < 8) { return 1; }
    if (n < 16) { return 2; }
    return 3;
}

/**
 * Normaliza la distancia de un vehículo al cruce peatonal en una escala discreta de 0 a 3.
 * 
 * Esta función clasifica la distancia relativa (proporcional al tamaño de la vía)
 * para usarla como parte del estado en modelos de decisión como Q-learning.
 * 
 * Rango de salida:
 * - 0: El vehículo no está presente o está a una distancia lejana.
 * - 1: Cercano al cruce (menor a 25% del trayecto).
 * - 2: Muy cercano (entre 25% y 50% del trayecto).
 * - 3: Inminente cruce (50% o más del trayecto recorrido).
 * 
 * @param {number} n - Distancia normalizada al cruce (valor entre 0.0 y 1.0, típicamente).
 * @returns {number} Nivel discretizado de proximidad (0–3).
 * 
 * @example
 * normalizeDistance(0);     // 0
 * normalizeDistance(0.2);   // 1
 * normalizeDistance(0.4);   // 2
 * normalizeDistance(0.8);   // 3
 */
function normalizeDistance(n) {
    if (n <= 0) { return 0; }
    if (n < 0.25) { return 1; }
    if (n < 0.5) { return 2; }
    return 3;
  }

/**
 * Normaliza el tiempo de espera de los vehículos en una escala discreta de 0 a 3.
 * 
 * Esta función transforma el tiempo de espera en segundos (u otra unidad de tiempo)
 * en un valor discreto para simplificar la representación del estado en el modelo de IA.
 * 
 * Rango de salida:
 * - 0: Sin espera o espera nula.
 * - 1: Espera baja (menos de 10 unidades).
 * - 2: Espera media (entre 10 y 15 unidades).
 * - 3: Espera alta (más de 15 unidades).
 * 
 * @param {number} t - Tiempo acumulado de espera del vehículo.
 * @returns {number} Nivel discretizado de espera (0–3).
 * 
 * @example
 * normalizeTime(0);    // 0
 * normalizeTime(5);    // 1
 * normalizeTime(12);   // 2
 * normalizeTime(20);   // 3
 */
function normalizeTime(t) {
  if (t <= 0) { return 0; }
  if (t < 10) { return 1; }
  if (t < 16) { return 2; }
  return 3;
}