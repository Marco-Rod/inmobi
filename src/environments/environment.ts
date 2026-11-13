/**
 * Configuración del entorno de desarrollo
 *
 * Este archivo contiene la configuración específica para el entorno
 * de desarrollo local. Aquí se define la URL base de la API y si
 * se debe utilizar el interceptor de API mock.
 */

export const environment = {
  production: false,

  /**
   * URL base de la API REST
   *
   * En desarrollo, apunta al endpoint local simulado.
   * Todos los servicios HTTP utilizan esta URL como base.
   */
  apiUrl: '/api/v1',

  /**
   * Flag para activar/desactivar el interceptor de API mock
   *
   * true:  Intercepta las llamadas HTTP y devuelve datos simulados
   * false: Deja pasar las llamadas al backend real
   *
   * Para migrar a un backend real:
   * 1. Cambiar useMockApi a false
   * 2. Actualizar apiUrl a la URL del backend real
   * 3. No es necesario modificar componentes ni servicios
   */
  useMockApi: true,

  /**
   * Configuración de logging
   */
  enableDebugLogs: true,

  /**
   * Configuración de mock
   */
  mockApiDelay: 500, // Milisegundos de latencia simulada
};
