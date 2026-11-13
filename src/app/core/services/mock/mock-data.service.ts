/**
 * Servicio de Datos Mock
 *
 * Este servicio mantiene los datos simulados en memoria durante la sesión.
 * Funciona como una "base de datos" temporal que persiste mientras la
 * aplicación está ejecutándose.
 *
 * RESPONSABILIDADES:
 * 1. Almacenar datos de propiedades en memoria
 * 2. Generar IDs únicos secuenciales
 * 3. Proporcionar datos seed iniciales
 * 4. Mantener la consistencia de los datos
 *
 * IMPORTANTE: Este servicio es singleton (providedIn: 'root'),
 * lo que garantiza que todos los interceptores y servicios
 * compartan la misma instancia y por lo tanto los mismos datos.
 */

import { Injectable } from '@angular/core';
import { Property } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  /**
   * Almacén de propiedades en memoria
   *
   * Este array actúa como nuestra "tabla" de propiedades.
   * Las operaciones CRUD modifican directamente este array.
   */
  private properties: Property[] = [];

  /**
   * Contador para generar IDs únicos
   *
   * Se incrementa cada vez que se crea una nueva propiedad.
   */
  private nextId = 1;

  constructor() {
    // Inicializar con datos seed al crear el servicio
    this.seedData();
  }

  /**
   * Obtiene todas las propiedades
   *
   * NOTA: Devuelve una copia del array para evitar mutaciones
   * accidentales desde fuera del servicio.
   */
  getAllProperties(): Property[] {
    return [...this.properties];
  }

  /**
   * Obtiene una propiedad por ID
   *
   * @param id - ID de la propiedad
   * @returns La propiedad o undefined si no existe
   */
  getPropertyById(id: number): Property | undefined {
    return this.properties.find((p) => p.id === id);
  }

  /**
   * Crea una nueva propiedad
   *
   * @param propertyData - Datos de la propiedad (sin ID)
   * @returns La propiedad creada con ID asignado
   */
  createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const now = new Date();

    const newProperty: Property = {
      ...propertyData,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    };

    this.properties.push(newProperty);
    return newProperty;
  }

  /**
   * Actualiza una propiedad existente
   *
   * @param id - ID de la propiedad
   * @param updates - Campos a actualizar
   * @returns La propiedad actualizada o undefined si no existe
   */
  updateProperty(id: number, updates: Partial<Property>): Property | undefined {
    const index = this.properties.findIndex((p) => p.id === id);

    if (index === -1) {
      return undefined;
    }

    // Crear nueva propiedad con los cambios (inmutabilidad)
    this.properties[index] = {
      ...this.properties[index],
      ...updates,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date(),
    };

    return this.properties[index];
  }

  /**
   * Elimina una propiedad
   *
   * @param id - ID de la propiedad
   * @returns true si se eliminó, false si no existía
   */
  deleteProperty(id: number): boolean {
    const index = this.properties.findIndex((p) => p.id === id);

    if (index === -1) {
      return false;
    }

    this.properties.splice(index, 1);
    return true;
  }

  /**
   * Reinicia los datos a su estado inicial
   *
   * Útil para testing o para "resetear" la aplicación.
   */
  resetData(): void {
    this.properties = [];
    this.nextId = 1;
    this.seedData();
  }

  /**
   * Obtiene el total de propiedades
   */
  getCount(): number {
    return this.properties.length;
  }

  /**
   * Verifica si existe una propiedad con el ID dado
   */
  exists(id: number): boolean {
    return this.properties.some((p) => p.id === id);
  }

  /**
   * Inicializa el almacén con datos de ejemplo
   *
   * Estos datos simulan un CRM con diferentes tipos de propiedades,
   * ubicaciones, precios y estados.
   */
  private seedData(): void {
    const seedProperties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Casas en venta
      {
        title: 'Casa residencial en zona exclusiva',
        description:
          'Hermosa casa de dos pisos con acabados de lujo, jardín amplio y alberca. Ubicada en fraccionamiento privado con seguridad 24/7.',
        propertyType: 'house',
        operation: 'sale',
        price: 4500000,
        currency: 'MXN',
        city: 'Guadalajara',
        state: 'Jalisco',
        status: 'available',
        bedrooms: 4,
        bathrooms: 3,
        areaM2: 280,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      },
      {
        title: 'Casa moderna con vista panorámica',
        description:
          'Casa estilo contemporáneo con grandes ventanales y terraza. Vista espectacular de la ciudad.',
        propertyType: 'house',
        operation: 'sale',
        price: 3200000,
        currency: 'MXN',
        city: 'Monterrey',
        state: 'Nuevo León',
        status: 'available',
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 220,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      },
      {
        title: 'Casa tradicional en centro histórico',
        description:
          'Casa colonial restaurada con patio central, fuente y detalles arquitectónicos originales.',
        propertyType: 'house',
        operation: 'sale',
        price: 2800000,
        currency: 'MXN',
        city: 'Querétaro',
        state: 'Querétaro',
        status: 'negotiating',
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 200,
      },
      {
        title: 'Casa de campo con terreno amplio',
        description:
          'Propiedad rural ideal para desarrollo sustentable o proyecto ecoturístico.',
        propertyType: 'house',
        operation: 'sale',
        price: 1500000,
        currency: 'MXN',
        city: 'Valle de Bravo',
        state: 'Estado de México',
        status: 'available',
        bedrooms: 2,
        bathrooms: 1,
        areaM2: 150,
      },

      // Departamentos en venta
      {
        title: 'Departamento de lujo en torre nueva',
        description:
          'Departamento completamente equipado en torre de lujo con amenidades: gimnasio, alberca, salón de eventos.',
        propertyType: 'apartment',
        operation: 'sale',
        price: 3500000,
        currency: 'MXN',
        city: 'Ciudad de México',
        state: 'Ciudad de México',
        status: 'available',
        bedrooms: 2,
        bathrooms: 2,
        areaM2: 95,
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      },
      {
        title: 'Departamento céntrico amueblado',
        description:
          'Departamento completamente amueblado listo para habitar. Excelente ubicación cerca de plazas comerciales.',
        propertyType: 'apartment',
        operation: 'sale',
        price: 1800000,
        currency: 'MXN',
        city: 'Guadalajara',
        state: 'Jalisco',
        status: 'sold',
        bedrooms: 2,
        bathrooms: 1,
        areaM2: 70,
      },

      // Departamentos en renta
      {
        title: 'Departamento moderno en renta',
        description:
          'Departamento de reciente construcción con cocina integral y acabados modernos.',
        propertyType: 'apartment',
        operation: 'rent',
        price: 15000,
        currency: 'MXN',
        city: 'Monterrey',
        state: 'Nuevo León',
        status: 'available',
        bedrooms: 2,
        bathrooms: 1,
        areaM2: 80,
      },
      {
        title: 'Estudio amueblado cerca de universidades',
        description: 'Estudio ideal para estudiantes o profesionistas. Incluye servicios.',
        propertyType: 'apartment',
        operation: 'rent',
        price: 8000,
        currency: 'MXN',
        city: 'Guadalajara',
        state: 'Jalisco',
        status: 'rented',
        bedrooms: 1,
        bathrooms: 1,
        areaM2: 45,
      },

      // Terrenos
      {
        title: 'Terreno comercial sobre avenida principal',
        description:
          'Terreno plano con uso de suelo comercial. Ideal para desarrollo de plaza o edificio de oficinas.',
        propertyType: 'land',
        operation: 'sale',
        price: 5000000,
        currency: 'MXN',
        city: 'Querétaro',
        state: 'Querétaro',
        status: 'available',
        bedrooms: 0,
        bathrooms: 0,
        areaM2: 1200,
      },
      {
        title: 'Terreno residencial en fraccionamiento',
        description: 'Lote residencial con servicios (agua, luz, drenaje). Listo para construir.',
        propertyType: 'land',
        operation: 'sale',
        price: 800000,
        currency: 'MXN',
        city: 'Mérida',
        state: 'Yucatán',
        status: 'available',
        bedrooms: 0,
        bathrooms: 0,
        areaM2: 300,
      },

      // Locales comerciales
      {
        title: 'Local comercial en plaza',
        description:
          'Local ubicado en plaza comercial con alto flujo de personas. Incluye medio baño.',
        propertyType: 'commercial',
        operation: 'rent',
        price: 25000,
        currency: 'MXN',
        city: 'Guadalajara',
        state: 'Jalisco',
        status: 'available',
        bedrooms: 0,
        bathrooms: 1,
        areaM2: 60,
      },
      {
        title: 'Local en esquina con amplio escaparate',
        description: 'Excelente ubicación para negocio. Amplios ventanales y bodega.',
        propertyType: 'commercial',
        operation: 'rent',
        price: 18000,
        currency: 'MXN',
        city: 'Monterrey',
        state: 'Nuevo León',
        status: 'rented',
        bedrooms: 0,
        bathrooms: 1,
        areaM2: 50,
      },

      // Oficinas
      {
        title: 'Oficina corporativa en torre empresarial',
        description:
          'Piso completo en torre clase A. Incluye estacionamiento y acceso a sala de juntas.',
        propertyType: 'office',
        operation: 'rent',
        price: 45000,
        currency: 'MXN',
        city: 'Ciudad de México',
        state: 'Ciudad de México',
        status: 'available',
        bedrooms: 0,
        bathrooms: 2,
        areaM2: 200,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      },
      {
        title: 'Oficina en renta zona financiera',
        description: 'Oficina lista para usar con mobiliario incluido. Internet de alta velocidad.',
        propertyType: 'office',
        operation: 'rent',
        price: 22000,
        currency: 'MXN',
        city: 'Monterrey',
        state: 'Nuevo León',
        status: 'available',
        bedrooms: 0,
        bathrooms: 1,
        areaM2: 85,
      },

      // Más propiedades para tener datos suficientes
      {
        title: 'Casa en condominio horizontal',
        description: 'Casa en privada con áreas comunes y seguridad.',
        propertyType: 'house',
        operation: 'sale',
        price: 2200000,
        currency: 'MXN',
        city: 'Puebla',
        state: 'Puebla',
        status: 'available',
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 160,
      },
      {
        title: 'Penthouse con terraza',
        description: 'Departamento en último piso con terraza privada y vista espectacular.',
        propertyType: 'apartment',
        operation: 'sale',
        price: 4200000,
        currency: 'MXN',
        city: 'Guadalajara',
        state: 'Jalisco',
        status: 'negotiating',
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 140,
      },
    ];

    // Crear todas las propiedades seed
    seedProperties.forEach((data) => {
      this.createProperty(data);
    });

    console.log(`✅ MockDataService inicializado con ${this.properties.length} propiedades`);
  }
}

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué usar un servicio para datos mock?
 *
 * Alternativa (NO recomendada):
 * ```typescript
 * // En el interceptor directamente
 * const MOCK_DATA = [ ... ]; // ❌ No persiste entre peticiones
 * ```
 *
 * Problemas:
 * - Cada petición vería datos diferentes
 * - CRUD no funcionaría (crear no se reflejaría en listar)
 * - No hay single source of truth
 *
 * Solución (lo que hacemos):
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * class MockDataService { ... }
 * ```
 *
 * Ventajas:
 * ✅ Datos persisten durante la sesión
 * ✅ CRUD funciona correctamente
 * ✅ Singleton garantiza misma instancia
 * ✅ Fácil de testear
 * ✅ Fácil de resetear
 */

/**
 * ¿Por qué devolver copias del array?
 *
 * ```typescript
 * // ❌ Mal: Expone referencia interna
 * getAllProperties() {
 *   return this.properties;
 * }
 * // Problema: El código externo podría mutar el array
 *
 * // ✅ Bien: Devuelve copia
 * getAllProperties() {
 *   return [...this.properties];
 * }
 * ```
 *
 * Esto protege la encapsulación del servicio.
 * Solo las métodos del servicio pueden modificar los datos.
 */

/**
 * ¿Por qué incrementar IDs secuencialmente?
 *
 * En una base de datos real, los IDs suelen ser:
 * - Secuenciales (1, 2, 3, ...) en PostgreSQL/MySQL
 * - UUIDs en sistemas distribuidos
 *
 * Para el mock, usamos secuenciales porque:
 * ✅ Más fácil de debuguear
 * ✅ URLs más legibles (/properties/1/)
 * ✅ Simula el comportamiento típico de Django/FastAPI
 *
 * En producción, el backend es responsable de generar IDs únicos.
 */
