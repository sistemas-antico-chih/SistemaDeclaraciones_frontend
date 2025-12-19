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
    menuType: 'situacionPatrimonial' | 'intereses' | 'aviso',
    tipoDeclaracion: string,
    declaracionSimplificada: boolean
  ) {
    const storageKey = `declaracion_saved_state_${menuType}_${declaracionSimplificada}`;
    const cleanUrl = this.normalizeUrl(url);

    const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');

    if (!savedState[menuType]) {
      savedState[menuType] = [];
    }

    // 🔥 Elimina cualquier versión vieja antes de guardar
    savedState[menuType] = savedState[menuType]
      .map((u: string) => this.normalizeUrl(u))
      .filter((u: string, i: number, arr: string[]) => arr.indexOf(u) === i);

    if (!savedState[menuType].includes(cleanUrl)) {
      savedState[menuType].push(cleanUrl);
    }

    localStorage.setItem(storageKey, JSON.stringify(savedState));

    console.log('💾 GUARDADO LIMPIO:', storageKey, savedState);
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
    return url.startsWith('/aviso/')
      ? url.replace('/aviso', '')
      : url;
  }
}