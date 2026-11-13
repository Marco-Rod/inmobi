/**
 * Configuración del entorno de producción
 *
 * Este archivo contiene la configuración para el entorno de producción.
 * Se utiliza cuando la aplicación es compilada con el flag --prod.
 */

export const environment = {
  production: true,

  /**
   * URL base de la API REST en producción
   *
   * IMPORTANTE: Actualizar esta URL con la dirección del backend real
   * antes de desplegar a producción.
   */
  apiUrl: 'https://api.realestate-crm.com/v1',

  /**
   * En producción, el mock debe estar desactivado
   */
  useMockApi: false,

  /**
   * Logging desactivado en producción por rendimiento
   */
  enableDebugLogs: false,

  /**
   * No hay delay en producción
   */
  mockApiDelay: 0,
};
