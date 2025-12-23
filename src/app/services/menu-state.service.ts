// Crear este archivo: src/app/shared/services/menu-state.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SavedState {
  situacionPatrimonial?: string[];
  intereses?: string[];
  aviso?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  private savedStateSubject = new BehaviorSubject<SavedState>({});
  public savedState$: Observable<SavedState> = this.savedStateSubject.asObservable();

  constructor() {
    console.log('🚀 MenuStateService inicializado');
  }

  /**
   * Obtiene la clave de almacenamiento según el tipo de declaración
   */
  private getStorageKey(tipoDeclaracion: string, declaracionSimplificada: boolean): string {
    return `declaracion_saved_state_${tipoDeclaracion}_${declaracionSimplificada}`;
  }

  /**
   * Carga el estado guardado desde localStorage
   */
  loadSavedState(tipoDeclaracion: string, declaracionSimplificada: boolean): SavedState {
    const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
    const savedState = localStorage.getItem(storageKey);
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      this.savedStateSubject.next(parsedState);
      return parsedState;
    }
    
    return {};
  }

  /**
   * Marca una sección como guardada
   */
  markSectionAsSaved(
    url: string, 
    section: 'situacionPatrimonial' | 'intereses' | 'aviso',
    tipoDeclaracion: string,
    declaracionSimplificada: boolean
  ): void {
    const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
    let savedState = JSON.parse(localStorage.getItem(storageKey) || '{}') as SavedState;
    
    console.log('🔵 Marcando sección como guardada:', {
      url,
      section,
      tipoDeclaracion,
      declaracionSimplificada,
      storageKey,
      estadoAntes: savedState
    });
    
    // Inicializar el array si no existe
    if (!savedState[section]) {
      savedState[section] = [];
    }
    
    // Agregar la URL si no está ya guardada
    if (!savedState[section].includes(url)) {
      savedState[section].push(url);
    }
    
    // Guardar en localStorage
    localStorage.setItem(storageKey, JSON.stringify(savedState));
    
    console.log('✅ Estado guardado:', savedState);
    console.log('💾 LocalStorage:', localStorage.getItem(storageKey));
    
    // Notificar cambios
    this.savedStateSubject.next(savedState);
  }

  /**
   * Limpia el estado guardado
   */
  clearSavedState(tipoDeclaracion: string, declaracionSimplificada: boolean): void {
    const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
    localStorage.removeItem(storageKey);
    this.savedStateSubject.next({});
  }

  /**
   * Verifica si una URL ha sido guardada
   */
  isUrlSaved(
    url: string, 
    section: 'situacionPatrimonial' | 'intereses' | 'aviso',
    tipoDeclaracion: string,
    declaracionSimplificada: boolean
  ): boolean {
    const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
    const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}') as SavedState;
    
    return savedState[section]?.includes(url) || false;
  }

  // ============================================
// AGREGAR ESTE MÉTODO AL MenuStateService
// ============================================

/**
 * Limpia COMPLETAMENTE el estado guardado para un tipo de declaración específico
 * Útil cuando se crea un registro nuevo desde cero
 */
clearState(
  tipoDeclaracion: string,
  declaracionSimplificada: boolean
): void {
  const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
  
  console.log('🗑️ Limpiando estado guardado:', {
    tipoDeclaracion,
    declaracionSimplificada,
    storageKey
  });

  // Limpiar localStorage
  localStorage.removeItem(storageKey);
  
  // Limpiar el estado en memoria
  this.savedStateSubject.next({});
  
  console.log('✅ Estado limpiado completamente');
}

/**
 * Limpia solo una sección específica del estado guardado
 */
clearSection(
  section: 'situacionPatrimonial' | 'intereses' | 'aviso',
  tipoDeclaracion: string,
  declaracionSimplificada: boolean
): void {
  const storageKey = this.getStorageKey(tipoDeclaracion, declaracionSimplificada);
  const currentState = this.loadSavedState(tipoDeclaracion, declaracionSimplificada);
  
  console.log('🗑️ Limpiando sección:', {
    section,
    estadoAntes: currentState
  });

  // Eliminar la sección específica
  delete currentState[section];
  
  // Guardar el estado actualizado
  localStorage.setItem(storageKey, JSON.stringify(currentState));
  this.savedStateSubject.next(currentState);
  
  console.log('✅ Sección limpiada:', {
    section,
    estadoDespues: currentState
  });
}
}