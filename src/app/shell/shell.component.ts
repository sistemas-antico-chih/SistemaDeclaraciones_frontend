import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MenuStateService } from '@app/services/menu-state.service';

interface MenuOption {
  text: string;
  url: string;
  simplificada?: boolean;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isMobile = false;
  url: string = '';
  tipoDeclaracion: string = 'aviso';
  declaracionSimplificada: boolean = false;
  declaracionCompleta: boolean = true;
  
  private subscriptions: Subscription[] = [];
  
  // Opciones del menú de Aviso
  avisoOptions: MenuOption[] = [
    { text: '1. Datos generales', url: '/datos-generales' },
    { text: '2. Domicilio del declarante', url: '/domicilio-declarante' },
    { text: '3. Datos del empleo, cargo o comisión', url: '/datos-empleo' }
  ];
  
  // Opciones del menú de Situación Patrimonial
  situacionPatrimonialOptions: MenuOption[] = [
    { text: '1. Datos generales', url: '/datos-generales', simplificada: true },
    { text: '2. Domicilio del declarante', url: '/domicilio-declarante', simplificada: true },
    { text: '3. Datos curriculares del declarante', url: '/datos-curriculares', simplificada: false },
    { text: '4. Datos del empleo, cargo o comisión', url: '/datos-empleo', simplificada: true },
    { text: '5. Experiencia laboral', url: '/experiencia-laboral', simplificada: false },
  ];
  
  // Opciones del menú de Intereses
  interesesOptions: MenuOption[] = [
    { text: '1. Participación en empresas', url: '/participacion-empresas' },
    { text: '2. Participación en instituciones', url: '/participacion-instituciones' },
    { text: '3. Socios o accionistas', url: '/socios-accionistas' },
  ];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private menuStateService: MenuStateService
  ) {
    console.log('🚀 ShellComponent inicializado');
    
    // Detectar si es móvil
    const breakpointSub = this.breakpointObserver
      .observe(['(max-width: 959px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
    this.subscriptions.push(breakpointSub);
    
    // Escuchar cambios de ruta
    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.url = event.url;
      console.log('📍 Navegación a:', this.url);
      
      // Extraer info cada vez que cambia la ruta
      this.extractDeclaracionInfo();
      
      if (this.isMobile) {
        this.sidenav?.close();
      }
    });
    this.subscriptions.push(routerSub);

    // Obtener tipo de declaración desde la URL
    this.extractDeclaracionInfo();
  }

  ngOnInit(): void {
    this.url = this.router.url;
    console.log('🎯 URL inicial:', this.url);
    
    // Extraer info de la declaración
    this.extractDeclaracionInfo();
    
    // Cargar el estado guardado desde localStorage
    console.log('📦 Cargando estado guardado...');
    this.menuStateService.loadSavedState(this.tipoDeclaracion, this.declaracionSimplificada);
    
    // Suscribirse a cambios en el estado guardado
    const stateSub = this.menuStateService.savedState$
      .subscribe(state => {
        console.log('🔄 Estado del menú actualizado:', state);
        console.log('🔍 Tipo declaración:', this.tipoDeclaracion);
        console.log('🔍 Declaración simplificada:', this.declaracionSimplificada);
      });
    this.subscriptions.push(stateSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Extrae el tipo de declaración y si es simplificada desde la URL
   */
  private extractDeclaracionInfo(): void {
    const urlChunks = this.router.url.split('/').filter(chunk => chunk);
    
    if (urlChunks.length > 0) {
      this.tipoDeclaracion = urlChunks[0]; // 'aviso', 'inicial', 'modificacion', etc.
      this.declaracionSimplificada = urlChunks[1] === 'simplificada';
      this.declaracionCompleta = !this.declaracionSimplificada;
      
      console.log('📋 Info extraída:', {
        tipoDeclaracion: this.tipoDeclaracion,
        declaracionSimplificada: this.declaracionSimplificada,
        url: this.router.url,
        urlChunks
      });
    }
  }

  /**
   * LÓGICA CORREGIDA:
   * Determina si una opción es del REGISTRO ACTUAL (azul) o ANTERIOR (gris)
   * 
   * true = 🔵 AZUL (registro ACTUAL - datos guardados recientemente)
   * false = ⚪ GRIS (registro ANTERIOR - datos precargados o sin datos)
   */
  isCurrentRecord(url: string): boolean {
    // Determinar la sección según el tipo de declaración actual
    let section: 'situacionPatrimonial' | 'intereses' | 'aviso';
    
    if (this.tipoDeclaracion === 'aviso') {
      section = 'aviso';
    } else if (this.url.includes('/intereses/') || url.includes('participacion') || url.includes('socios')) {
      section = 'intereses';
    } else {
      section = 'situacionPatrimonial';
    }

    // Si está en localStorage = registro ACTUAL → AZUL (true)
    // Si NO está en localStorage = registro ANTERIOR → GRIS (false)
    const isCurrentRecord = this.menuStateService.isUrlSaved(
      url, 
      section,
      this.tipoDeclaracion,
      this.declaracionSimplificada
    );

    console.log(`🔍 Verificando "${url}":`, {
      section,
      isCurrentRecord,
      tipoDeclaracion: this.tipoDeclaracion,
      declaracionSimplificada: this.declaracionSimplificada,
      color: isCurrentRecord ? '🔵 AZUL (actual)' : '⚪ GRIS (anterior)'
    });

    return isCurrentRecord;
  }

  /**
   * Navegar a sección de Aviso - CORREGIDO
   */
  goToAvisoSection(event: any): void {
    console.log('🚦 goToAvisoSection event:', event);
    
    // El evento puede venir como { selectedIndex: number } o directamente el step
    const selectedIndex = event?.selectedIndex ?? event;
    
    if (selectedIndex !== undefined && this.avisoOptions[selectedIndex]) {
      const option = this.avisoOptions[selectedIndex];
      const fullUrl = `/aviso${option.url}`;
      console.log('🚀 Navegando a:', fullUrl, 'desde index:', selectedIndex);
      this.router.navigate([fullUrl]);
    } else {
      console.warn('⚠️ No se pudo navegar, selectedIndex:', selectedIndex);
    }
  }

  /**
   * Navegar a sección de Situación Patrimonial - CORREGIDO
   */
  goToSituacionPatrimonialSection(event: any): void {
    console.log('🚦 goToSituacionPatrimonialSection event:', event);
    
    const selectedIndex = event?.selectedIndex ?? event;
    
    if (selectedIndex !== undefined) {
      const visibleOptions = this.declaracionSimplificada
        ? this.situacionPatrimonialOptions.filter(opt => opt.simplificada)
        : this.situacionPatrimonialOptions;
      
      if (visibleOptions[selectedIndex]) {
        const option = visibleOptions[selectedIndex];
        const basePath = this.declaracionSimplificada 
          ? `/${this.tipoDeclaracion}/simplificada/situacion-patrimonial`
          : `/${this.tipoDeclaracion}/situacion-patrimonial`;
        const fullUrl = `${basePath}${option.url}`;
        console.log('🚀 Navegando a:', fullUrl, 'desde index:', selectedIndex);
        this.router.navigate([fullUrl]);
      }
    }
  }

  /**
   * Navegar a sección de Intereses - CORREGIDO
   */
  goToInteresesSection(event: any): void {
    console.log('🚦 goToInteresesSection event:', event);
    
    const selectedIndex = event?.selectedIndex ?? event;
    
    if (selectedIndex !== undefined && this.interesesOptions[selectedIndex]) {
      const option = this.interesesOptions[selectedIndex];
      const fullUrl = `/${this.tipoDeclaracion}/intereses${option.url}`;
      console.log('🚀 Navegando a:', fullUrl, 'desde index:', selectedIndex);
      this.router.navigate([fullUrl]);
    }
  }

  /**
   * TrackBy para optimizar renderizado
   */
  trackByUrl(index: number, item: MenuOption): string {
    return item.url;
  }
}