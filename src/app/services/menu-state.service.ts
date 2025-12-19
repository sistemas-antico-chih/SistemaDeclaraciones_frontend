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
    menu: 'aviso' | 'situacionPatrimonial' | 'intereses',
    tipoDeclaracion: string,
    declaracionSimplificada: boolean
  ): void {
    const storageKey = `declaracion_saved_state_${tipoDeclaracion}_${declaracionSimplificada}`;
    const cleanUrl = this.normalizeUrl(url); // 👈 AQUÍ
    const savedState = JSON.parse(
      localStorage.getItem(storageKey) || '{}'
    );

    if (!savedState[menu]) {
      savedState[menu] = [];
    }

    if (!savedState[menu].includes(url)) {
      savedState[menu].push(url);
    }

    localStorage.setItem(storageKey, JSON.stringify(savedState));

    console.log('💾 GUARDADO EN LOCALSTORAGE:', storageKey, savedState);
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

  private normalizeUrl(url: string): string {
    if (!url) return url;

    // Elimina el prefijo /aviso si existe
    return url.startsWith('/aviso/')
      ? url.replace('/aviso', '')
      : url;
  }
}