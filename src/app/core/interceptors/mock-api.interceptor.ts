/**
 * Mock API Interceptor
 *
 * Interceptor HTTP funcional que simula una API REST completa.
 *
 * PROPÓSITO:
 * Interceptar TODAS las peticiones HTTP que coincidan con la URL de la API
 * y devolver respuestas simuladas sin realizar llamadas de red reales.
 *
 * FUNCIONAMIENTO:
 * 1. Angular HttpClient hace una petición
 * 2. Este interceptor la intercepta
 * 3. Verifica si debe simularla (según environment.useMockApi)
 * 4. Si sí, procesa la petición y devuelve respuesta simulada
 * 5. Si no, deja pasar la petición al backend real
 *
 * CARACTERÍSTICAS:
 * - ✅ Simula latencia de red
 * - ✅ Maneja errores HTTP (400, 404, 500)
 * - ✅ Valida datos de entrada
 * - ✅ Implementa paginación
 * - ✅ Soporta filtros y búsqueda
 * - ✅ Mantiene estado entre peticiones
 * - ✅ Fácilmente desactivable
 *
 * IMPORTANTE:
 * Este es un FUNCTIONAL interceptor (Angular 22+), no un class-based interceptor.
 */

import { HttpInterceptorFn, HttpResponse, HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { MockDataService } from '../services/mock/mock-data.service';
import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
  PaginatedResponse,
  DashboardSummary,
  CityDistribution,
  MonthlyStats,
  PropertyTypeDistribution,
  PropertyType,
} from '../models';

/**
 * Interceptor funcional para simular API
 *
 * SINTAXIS MODERNA:
 * Angular 22+ usa functional interceptors en lugar de class-based.
 *
 * Ventajas:
 * - Más simple (no requiere clase)
 * - Tree-shakeable (mejor para bundle size)
 * - Composable (fácil combinar múltiples)
 * - Tipado más estricto
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectar servicio de datos mock
  const mockData = inject(MockDataService);

  /**
   * Verificar si el mock está habilitado
   *
   * Si useMockApi es false, dejar pasar la petición sin modificarla.
   */
  if (!environment.useMockApi) {
    return next(req);
  }

  /**
   * Verificar si la URL coincide con nuestra API
   *
   * Solo interceptamos peticiones a /api/v1/*
   */
  if (!req.url.includes('/api/v1/')) {
    return next(req);
  }

  console.log(`🔄 [MockAPI] Interceptando: ${req.method} ${req.url}`);

  /**
   * Procesar la petición según el endpoint
   *
   * Aquí es donde la magia sucede: analizamos la URL y método HTTP
   * para determinar qué operación se está solicitando.
   */
  const response = handleRequest(req, mockData);

  /**
   * Simular latencia de red
   *
   * En desarrollo real, las peticiones HTTP toman tiempo.
   * Simulamos esto con un delay configurable.
   */
  return response.pipe(delay(environment.mockApiDelay));
};

/**
 * Maneja la petición y devuelve la respuesta apropiada
 */
function handleRequest(
  req: HttpRequest<unknown>,
  mockData: MockDataService
): Observable<HttpEvent<unknown>> {
  const { method, url } = req;

  // ============================================================================
  // ENDPOINTS DE PROPIEDADES
  // ============================================================================

  // GET /api/v1/properties/ - Listar propiedades
  if (method === 'GET' && url.match(/\/api\/v1\/properties\/?\??/)) {
    return handleListProperties(req, mockData);
  }

  // GET /api/v1/properties/{id}/ - Obtener propiedad específica
  if (method === 'GET' && url.match(/\/api\/v1\/properties\/\d+\/$/)) {
    const id = extractIdFromUrl(url);
    return handleGetProperty(id, mockData);
  }

  // POST /api/v1/properties/ - Crear propiedad
  if (method === 'POST' && url.match(/\/api\/v1\/properties\/$/)) {
    return handleCreateProperty(req.body as PropertyCreateDto, mockData);
  }

  // PUT /api/v1/properties/{id}/ - Actualizar propiedad completa
  if (method === 'PUT' && url.match(/\/api\/v1\/properties\/\d+\/$/)) {
    const id = extractIdFromUrl(url);
    return handleUpdateProperty(id, req.body as PropertyUpdateDto, mockData);
  }

  // PATCH /api/v1/properties/{id}/ - Actualizar propiedad parcial
  if (method === 'PATCH' && url.match(/\/api\/v1\/properties\/\d+\/$/)) {
    const id = extractIdFromUrl(url);
    return handlePatchProperty(id, req.body as Partial<Property>, mockData);
  }

  // DELETE /api/v1/properties/{id}/ - Eliminar propiedad
  if (method === 'DELETE' && url.match(/\/api\/v1\/properties\/\d+\/$/)) {
    const id = extractIdFromUrl(url);
    return handleDeleteProperty(id, mockData);
  }

  // ============================================================================
  // ENDPOINTS DE DASHBOARD
  // ============================================================================

  // GET /api/v1/dashboard/summary/
  if (method === 'GET' && url.includes('/dashboard/summary/')) {
    return handleDashboardSummary(mockData);
  }

  // GET /api/v1/dashboard/city-distribution/
  if (method === 'GET' && url.includes('/dashboard/city-distribution/')) {
    return handleCityDistribution(mockData);
  }

  // GET /api/v1/dashboard/monthly-stats/
  if (method === 'GET' && url.includes('/dashboard/monthly-stats/')) {
    return handleMonthlyStats(mockData);
  }

  // GET /api/v1/dashboard/type-distribution/
  if (method === 'GET' && url.includes('/dashboard/type-distribution/')) {
    return handleTypeDistribution(mockData);
  }

  // ============================================================================
  // ENDPOINT NO ENCONTRADO
  // ============================================================================

  return throwError(
    () =>
      new HttpErrorResponse({
        error: { detail: 'Endpoint not found' },
        status: 404,
        statusText: 'Not Found',
        url: url,
      })
  );
}

// ============================================================================
// HANDLERS DE PROPIEDADES
// ============================================================================

/**
 * GET /api/v1/properties/ - Listar propiedades con paginación y filtros
 */
function handleListProperties(
  req: HttpRequest<unknown>,
  mockData: MockDataService
): Observable<HttpEvent<PaginatedResponse<Property>>> {
  let properties = mockData.getAllProperties();

  // Extraer query parameters usando HttpParams o URL
  const params = parseQueryParams(req);
  const page = parseInt(params['page'] || '1');
  const pageSize = parseInt(params['page_size'] || '10');

  // Aplicar filtros
  if (params['search']) {
    const searchLower = params['search'].toLowerCase();
    properties = properties.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)
    );
  }

  if (params['city']) {
    properties = properties.filter((p) => p.city.toLowerCase() === params['city'].toLowerCase());
  }

  if (params['property_type']) {
    properties = properties.filter((p) => p.propertyType === params['property_type']);
  }

  if (params['operation']) {
    properties = properties.filter((p) => p.operation === params['operation']);
  }

  if (params['status']) {
    properties = properties.filter((p) => p.status === params['status']);
  }

  if (params['min_price']) {
    const minPrice = parseFloat(params['min_price']);
    properties = properties.filter((p) => p.price >= minPrice);
  }

  if (params['max_price']) {
    const maxPrice = parseFloat(params['max_price']);
    properties = properties.filter((p) => p.price <= maxPrice);
  }

  // Aplicar ordenamiento
  const sortBy = params['sort_by'] || 'createdAt';
  const sortOrder = params['sort_order'] || 'desc';

  properties.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'areaM2':
        aValue = a.areaM2;
        bValue = b.areaM2;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
      default:
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Aplicar paginación
  const totalCount = properties.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProperties = properties.slice(startIndex, endIndex);

  // Construir respuesta paginada
  const response: PaginatedResponse<Property> = {
    count: totalCount,
    next: page < totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: paginatedProperties,
  };

  console.log(`✅ [MockAPI] Devolviendo ${paginatedProperties.length} de ${totalCount} propiedades (página ${page}/${totalPages})`);

  return of(new HttpResponse({ status: 200, body: response }));
}

/**
 * GET /api/v1/properties/{id}/ - Obtener propiedad específica
 */
function handleGetProperty(id: number, mockData: MockDataService): Observable<HttpEvent<Property>> {
  const property = mockData.getPropertyById(id);

  if (!property) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { detail: 'Property not found' },
          status: 404,
          statusText: 'Not Found',
        })
    );
  }

  console.log(`✅ [MockAPI] Devolviendo propiedad #${id}: ${property.title}`);
  return of(new HttpResponse({ status: 200, body: property }));
}

/**
 * POST /api/v1/properties/ - Crear nueva propiedad
 */
function handleCreateProperty(body: PropertyCreateDto, mockData: MockDataService): Observable<HttpEvent<Property>> {
  // Validar datos
  const validationErrors = validatePropertyData(body);
  if (Object.keys(validationErrors).length > 0) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: {
            detail: 'Validation error',
            errors: validationErrors,
          },
          status: 400,
          statusText: 'Bad Request',
        })
    );
  }

  // Crear propiedad
  const newProperty = mockData.createProperty({
    ...body,
    status: 'available', // Estado por defecto
  });

  console.log(`✅ [MockAPI] Propiedad creada #${newProperty.id}: ${newProperty.title}`);
  return of(new HttpResponse({ status: 201, body: newProperty }));
}

/**
 * PUT /api/v1/properties/{id}/ - Actualizar propiedad completa
 */
function handleUpdateProperty(id: number, body: PropertyUpdateDto, mockData: MockDataService): Observable<HttpEvent<Property>> {
  if (!mockData.exists(id)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { detail: 'Property not found' },
          status: 404,
          statusText: 'Not Found',
        })
    );
  }

  const validationErrors = validatePropertyData(body);
  if (Object.keys(validationErrors).length > 0) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: {
            detail: 'Validation error',
            errors: validationErrors,
          },
          status: 400,
          statusText: 'Bad Request',
        })
    );
  }

  const updated = mockData.updateProperty(id, body);
  console.log(`✅ [MockAPI] Propiedad actualizada #${id}`);
  return of(new HttpResponse({ status: 200, body: updated }));
}

/**
 * PATCH /api/v1/properties/{id}/ - Actualizar propiedad parcialmente
 */
function handlePatchProperty(id: number, body: Partial<Property>, mockData: MockDataService): Observable<HttpEvent<Property>> {
  if (!mockData.exists(id)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { detail: 'Property not found' },
          status: 404,
          statusText: 'Not Found',
        })
    );
  }

  const updated = mockData.updateProperty(id, body);
  console.log(`✅ [MockAPI] Propiedad parcheada #${id}`);
  return of(new HttpResponse({ status: 200, body: updated }));
}

/**
 * DELETE /api/v1/properties/{id}/ - Eliminar propiedad
 */
function handleDeleteProperty(id: number, mockData: MockDataService): Observable<HttpEvent<null>> {
  const deleted = mockData.deleteProperty(id);

  if (!deleted) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { detail: 'Property not found' },
          status: 404,
          statusText: 'Not Found',
        })
    );
  }

  console.log(`✅ [MockAPI] Propiedad eliminada #${id}`);
  return of(new HttpResponse({ status: 204, body: null }));
}

// ============================================================================
// HANDLERS DE DASHBOARD
// ============================================================================

function handleDashboardSummary(mockData: MockDataService): Observable<HttpEvent<DashboardSummary>> {
  const properties = mockData.getAllProperties();

  const summary: DashboardSummary = {
    totalProperties: properties.length,
    availableProperties: properties.filter((p) => p.status === 'available').length,
    soldProperties: properties.filter((p) => p.status === 'sold').length,
    rentedProperties: properties.filter((p) => p.status === 'rented').length,
    negotiatingProperties: properties.filter((p) => p.status === 'negotiating').length,
    averagePrice: properties.reduce((sum, p) => sum + p.price, 0) / properties.length || 0,
    currency: 'MXN',
    totalInventoryValue: properties.filter((p) => p.status === 'available').reduce((sum, p) => sum + p.price, 0),
  };

  return of(new HttpResponse({ status: 200, body: summary }));
}

function handleCityDistribution(mockData: MockDataService): Observable<HttpEvent<CityDistribution[]>> {
  const properties = mockData.getAllProperties();
  const cityMap = new Map<string, number>();

  properties.forEach((p) => {
    cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
  });

  const distribution: CityDistribution[] = Array.from(cityMap.entries())
    .map(([city, count]) => ({
      city,
      count,
      percentage: (count / properties.length) * 100,
      averagePrice: properties.filter((p) => p.city === city).reduce((sum, p) => sum + p.price, 0) / count,
    }))
    .sort((a, b) => b.count - a.count);

  return of(new HttpResponse({ status: 200, body: distribution }));
}

function handleMonthlyStats(_mockData: MockDataService): Observable<HttpEvent<MonthlyStats[]>> {
  // Simular estadísticas de los últimos 6 meses
  const months: MonthlyStats[] = [
    { month: '2026-06', sales: 5, rentals: 9, totalRevenue: 16500000 },
    { month: '2026-07', sales: 9, rentals: 11, totalRevenue: 22100000 },
    { month: '2026-08', sales: 7, rentals: 15, totalRevenue: 19800000 },
    { month: '2026-09', sales: 10, rentals: 8, totalRevenue: 25600000 },
    { month: '2026-10', sales: 6, rentals: 10, totalRevenue: 18200000 },
    { month: '2026-11', sales: 8, rentals: 12, totalRevenue: 23500000 },
  ];

  return of(new HttpResponse({ status: 200, body: months }));
}

function handleTypeDistribution(mockData: MockDataService): Observable<HttpEvent<PropertyTypeDistribution[]>> {
  const properties = mockData.getAllProperties();
  const typeMap = new Map<PropertyType, number>();

  properties.forEach((p) => {
    typeMap.set(p.propertyType, (typeMap.get(p.propertyType) || 0) + 1);
  });

  const distribution: PropertyTypeDistribution[] = Array.from(typeMap.entries())
    .map(([propertyType, count]) => ({
      propertyType,
      count,
      percentage: (count / properties.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return of(new HttpResponse({ status: 200, body: distribution }));
}

// ============================================================================
// UTILIDADES
// ============================================================================

function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\//);
  return match ? parseInt(match[1]) : 0;
}

function parseQueryParams(req: HttpRequest<unknown>): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Método 1: Leer de HttpParams (recomendado en Angular)
  // HttpParams es la forma correcta de enviar query params en Angular
  req.params.keys().forEach((key) => {
    const value = req.params.get(key);
    if (value !== null) {
      params[key] = value;
    }
  });
  
  // Método 2: Fallback - parsear URL si no hay HttpParams
  // Esto cubre casos donde los params están directamente en la URL
  if (Object.keys(params).length === 0) {
    const queryString = req.url.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
  }

  return params;
}

function validatePropertyData(data: Partial<PropertyCreateDto>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (data.title !== undefined) {
    if (!data.title || data.title.length < 3) {
      errors['title'] = ['El título debe tener al menos 3 caracteres.'];
    }
    if (data.title && data.title.length > 200) {
      errors['title'] = [...(errors['title'] || []), 'El título no puede exceder 200 caracteres.'];
    }
  }

  if (data.price !== undefined && data.price <= 0) {
    errors['price'] = ['El precio debe ser mayor que cero.'];
  }

  if (data.areaM2 !== undefined && data.areaM2 <= 0) {
    errors['areaM2'] = ['La superficie debe ser mayor que cero.'];
  }

  if (data.bedrooms !== undefined && data.bedrooms < 0) {
    errors['bedrooms'] = ['El número de habitaciones no puede ser negativo.'];
  }

  if (data.bathrooms !== undefined && data.bathrooms < 0) {
    errors['bathrooms'] = ['El número de baños no puede ser negativo.'];
  }

  return errors;
}
