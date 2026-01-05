import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewChildren, QueryList, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatStep } from '@angular/material/stepper';
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
export class ShellComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChildren(MatStep) steps!: QueryList<MatStep>;
  @ViewChildren('stepElement', { read: ElementRef }) stepElements!: QueryList<ElementRef>;

  isMobile = false;
  url: string = '';
  tipoDeclaracion: string = 'aviso';
  declaracionSimplificada: boolean = false;
  declaracionCompleta: boolean = true;

  private subscriptions: Subscription[] = [];

  // Opciones del menú de Aviso
  avisoOptions: MenuOption[] = [
    { text: 'Datos generales', url: '/datos-generales' },
    { text: 'Domicilio del declarante', url: '/domicilio-declarante' },
    { text: 'Datos del empleo, cargo o comisión', url: '/datos-empleo' }
  ];

  // Opciones del menú de Situación Patrimonial
  situacionPatrimonialOptions: MenuOption[] = [
    { text: 'Datos generales', url: '/datos-generales', simplificada: true },
    { text: 'Domicilio del declarante', url: '/domicilio-declarante', simplificada: true },
    { text: 'Datos curriculares del declarante', url: '/datos-curriculares', simplificada: true },
    { text: 'Datos del empleo, cargo o comisión', url: '/datos-empleo', simplificada: true },
    { text: 'Experiencia laboral', url: '/experiencia-laboral', simplificada: true },
    { text: 'Datos de la pareja', url: '/datos-pareja', simplificada: false },
    { text: 'Datos del dependiente económico', url: '/datos-dependiente', simplificada: false },
    {
      text: 'Ingresos netos del declarante, pareja y/o dependientes económicos',
      url: '/ingresos-netos',simplificada: true
    },
    {
      text: '¿Te desempeñaste como servidor público en el año inmediato anterior?',
      url: '/servidor-publico', simplificada: true,
    },
    { text: 'Bienes inmuebles', url: '/bienes-inmuebles', simplificada: false },
    { text: 'Vehículos', url: '/vehiculos', simplificada: false },
    { text: 'Bienes muebles', url: '/bienes-muebles', simplificada: false },
    {
      text: 'Inversiones, cuentas bancarias u otro tipo de valores / activos',
      url: '/inversiones', simplificada: false
    },
    { text: 'Adeudos / pasivos', url: '/adeudos', simplificada: false },
    { text: 'Préstamo o comodato por terceros', url: '/prestamos-terceros', simplificada: false },
  ];

  // Opciones del menú de Intereses
  interesesOptions: MenuOption[] = [
    { text: 'Participación en empresas, sociedades o asociaciones (hasta los dos últimos años) ',
       url: '/participacion-empresa' },
    { text: '¿Participa en la toma de decisiones de alguna de estas instituciones? (hasta los dos últimos años)',
       url: '/toma-decisiones' },
    { text: 'Apoyos o beneficios públicos (hasta los dos últimos años)', url: '/apoyos-publicos' },
    { text: 'Representación (hasta los dos últimos años)', url: '/representacion' },
    { text: 'Clientes principales (hasta los dos últimos años)', url: '/clientes-principales' },
    { text: 'Beneficios privados (hasta los dos últimos años)', url: '/beneficios-privados' },
    { text: 'Fideicomisos (hasta los dos últimos años)', url: '/fideicomisos' },
  ];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private menuStateService: MenuStateService,
    private renderer: Renderer2
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

      // Actualizar colores después de la navegación
      setTimeout(() => {
        this.updateStepColors();
      }, 100);

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
    const savedState = this.menuStateService.loadSavedState(this.tipoDeclaracion, this.declaracionSimplificada);
    console.log('📦 Estado cargado:', savedState);

    // Suscribirse a cambios en el estado guardado
    const stateSub = this.menuStateService.savedState$
      .subscribe(state => {
        console.log('🔄 Estado del menú actualizado:', state);
        // Actualizar colores cuando cambia el estado
        setTimeout(() => {
          this.updateStepColors();
        }, 100);
      });
    this.subscriptions.push(stateSub);
  }

  ngAfterViewInit(): void {
    // Aplicar colores iniciales después de que la vista esté lista
    setTimeout(() => {
      this.updateStepColors();
    }, 200);

    // Observar cambios en los steps
    this.steps.changes.subscribe(() => {
      setTimeout(() => {
        this.updateStepColors();
      }, 100);
    });

    // Observar cambios en los elementos del DOM
    if (this.stepElements) {
      this.stepElements.changes.subscribe(() => {
        setTimeout(() => {
          this.updateStepColors();
        }, 100);
      });
    }
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
      this.tipoDeclaracion = urlChunks[0];
      this.declaracionSimplificada = urlChunks[1] === 'simplificada';
      this.declaracionCompleta = !this.declaracionSimplificada;

      console.log('📋 Info extraída:', {
        tipoDeclaracion: this.tipoDeclaracion,
        declaracionSimplificada: this.declaracionSimplificada,
        url: this.router.url
      });
    }
  }

  /**
   * MÉTODO CLAVE: Actualiza los colores de los steps
   */
  /**
 * MÉTODO CLAVE: Actualiza los colores de los steps
 * VERSIÓN MEJORADA - Aplica clases en múltiples lugares para asegurar que funcione
 */
  private updateStepColors(): void {
    console.log('🎨 Actualizando colores de steps');

    let options: MenuOption[] = [];

    // Determinar qué opciones usar según el tipo de declaración
    if (this.tipoDeclaracion === 'aviso') {
      options = this.avisoOptions;
    } else if (this.url.includes('/intereses/')) {
      options = this.interesesOptions;
    } else {
      options = this.declaracionSimplificada
        ? this.situacionPatrimonialOptions.filter(opt => opt.simplificada)
        : this.situacionPatrimonialOptions;
    }

    // Esperar a que el DOM esté listo
    setTimeout(() => {
      // Buscar todos los mat-step-header en el documento
      const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');

      console.log(`📊 Total de step-headers encontrados: ${stepHeaders.length}`);

      stepHeaders.forEach((stepHeader, index) => {
        if (index < options.length) {
          const option = options[index];
          const isCurrentRecord = this.isCurrentRecord(option.url);

          // Remover todas las clases primero
          stepHeader.classList.remove('step-current');
          stepHeader.classList.remove('step-from-previous');

          // Aplicar la clase correcta
          if (isCurrentRecord) {
            // AZUL - registro actual
            stepHeader.classList.add('step-current');
            console.log(`  🔵 Step ${index}: "${option.text}" → AZUL (current)`);
          } else {
            // GRIS - registro anterior
            stepHeader.classList.add('step-from-previous');
            console.log(`  ⚪ Step ${index}: "${option.text}" → GRIS (previous)`);
          }
        }
      });
    }, 50);
  }

  /**
   * Determina si una opción es del REGISTRO ACTUAL (azul) o ANTERIOR (gris)
   */
  isCurrentRecord(url: string): boolean {
    let section: 'situacionPatrimonial' | 'intereses' | 'aviso';

    if (this.tipoDeclaracion === 'aviso') {
      section = 'aviso';
    } else if (this.url.includes('/intereses/')) {
      section = 'intereses';
    } else {
      section = 'situacionPatrimonial';
    }

    const isCurrentRecord = this.menuStateService.isUrlSaved(
      url,
      section,
      this.tipoDeclaracion,
      this.declaracionSimplificada
    );

    return isCurrentRecord;
  }

  /**
   * Navegar a sección de Aviso
   */
  goToAvisoSection(event: any): void {
    const selectedIndex = event?.selectedIndex ?? event;

    if (selectedIndex !== undefined && this.avisoOptions[selectedIndex]) {
      const option = this.avisoOptions[selectedIndex];
      const fullUrl = `/aviso${option.url}`;
      console.log('🚀 Navegando a:', fullUrl);
      this.router.navigate([fullUrl]);
    }
  }

  /**
   * Navegar a sección de Situación Patrimonial
   */
  goToSituacionPatrimonialSection(event: any): void {
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
        console.log('🚀 Navegando a:', fullUrl);
        this.router.navigate([fullUrl]);
      }
    }
  }

  /**
   * Navegar a sección de Intereses
   */
  goToInteresesSection(event: any): void {
    const selectedIndex = event?.selectedIndex ?? event;

    if (selectedIndex !== undefined && this.interesesOptions[selectedIndex]) {
      const option = this.interesesOptions[selectedIndex];
      const fullUrl = `/${this.tipoDeclaracion}/intereses${option.url}`;
      console.log('🚀 Navegando a:', fullUrl);
      this.router.navigate([fullUrl]);
    }
  }

  /**
   * TrackBy para optimizar renderizado
   */
  trackByUrl(index: number, item: MenuOption): string {
    return item.url;
  }

  getStepControl(index: number): any {
    return null;
  }
}