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
      url: '/ingresos-netos', simplificada: true
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
    {
      text: 'Participación en empresas, sociedades o asociaciones (hasta los dos últimos años) ',
      url: '/participacion-empresa'
    },
    {
      text: '¿Participa en la toma de decisiones de alguna de estas instituciones? (hasta los dos últimos años)',
      url: '/toma-decisiones'
    },
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

    // 🔑 NUEVO: Suscribirse a cambios en el estado guardado DESDE EL CONSTRUCTOR
    // Esto permite que los colores se actualicen cuando los componentes marcan secciones como guardadas
    const stateSub = this.menuStateService.savedState$
      .subscribe(state => {
        console.log('🔄 Estado del menú actualizado (constructor):', state);
        // Actualizar colores cuando cambia el estado
        setTimeout(() => {
          this.updateStepColors();
        }, 150);
      });
    this.subscriptions.push(stateSub);

    // Obtener tipo de declaración desde la URL
    this.extractDeclaracionInfo();
  }

  ngOnInit(): void {
    this.url = this.router.url;
    console.log('🎯 URL inicial:', this.url);

    // Extraer info de la declaración
    this.extractDeclaracionInfo();

    // 🔑 IMPORTANTE: Cargar el estado guardado
    console.log('📦 Cargando estado guardado desde localStorage...');
    const savedState = this.menuStateService.loadSavedState(
      this.tipoDeclaracion,
      this.declaracionSimplificada
    );
    console.log('📦 Estado inicial cargado:', savedState);
  }

  ngAfterViewInit(): void {
    console.log('🎨 ngAfterViewInit ejecutado');

    // 🔑 CRÍTICO: Usar MutationObserver para esperar a que el DOM esté listo
    this.waitForStepsAndApplyColors();

    // Observar cambios en los steps de Angular Material
    this.steps.changes.subscribe(() => {
      console.log('📊 Steps de Angular Material cambiaron');
      setTimeout(() => {
        this.updateStepColors();
      }, 100);
    });

    // Observar cambios en los elementos del DOM
    if (this.stepElements) {
      this.stepElements.changes.subscribe(() => {
        console.log('📊 Step elements cambiaron');
        setTimeout(() => {
          this.updateStepColors();
        }, 100);
      });
    }
  }

  /**
   * 🔑 NUEVO MÉTODO CRÍTICO: Espera a que los mat-step-header existan en el DOM
   * antes de aplicar colores por primera vez
   */
  private waitForStepsAndApplyColors(): void {
    console.log('⏳ Esperando a que los steps se rendericen en el DOM...');

    // Intentar aplicar colores inmediatamente por si ya están renderizados
    setTimeout(() => {
      const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');

      if (stepHeaders.length > 0) {
        console.log('✅ Steps encontrados inmediatamente, aplicando colores...');
        this.updateStepColors();
      } else {
        console.log('⏳ Steps no encontrados, configurando MutationObserver...');
        this.setupMutationObserver();
      }
    }, 100);

    // También intentar después de más tiempo por si acaso
    setTimeout(() => {
      const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');
      if (stepHeaders.length > 0) {
        console.log('✅ Steps encontrados después de 500ms, aplicando colores...');
        this.updateStepColors();
      }
    }, 500);

    setTimeout(() => {
      const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');
      if (stepHeaders.length > 0) {
        console.log('✅ Steps encontrados después de 1000ms, aplicando colores...');
        this.updateStepColors();
      }
    }, 1000);
  }

  /**
   * 🔑 NUEVO MÉTODO: Configura un observador para detectar cuando los steps aparecen en el DOM
   */
  private setupMutationObserver(): void {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback: MutationCallback = (mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');

          if (stepHeaders.length > 0) {
            console.log('✅ MutationObserver detectó steps en el DOM, aplicando colores...');
            this.updateStepColors();
            observer.disconnect(); // Dejar de observar una vez encontrados
            break;
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Desconectar después de 5 segundos para no dejar el observer corriendo indefinidamente
    setTimeout(() => {
      observer.disconnect();
      console.log('⏱️ MutationObserver desconectado después de 5 segundos');
    }, 5000);
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
        declaracionCompleta: this.declaracionCompleta,
        url: this.router.url
      });
    }
  }

  /**
 * MÉTODO CORREGIDO: Actualiza los colores de los steps
 * Ahora maneja correctamente los DOS menús cuando declaracionCompleta === true
 */
  private updateStepColors(): void {
    console.log('🎨 Actualizando colores de steps');
    console.log('📊 Estado actual:', {
      tipoDeclaracion: this.tipoDeclaracion,
      declaracionSimplificada: this.declaracionSimplificada,
      declaracionCompleta: this.declaracionCompleta,
      url: this.url
    });

    // Determinar si estamos en modo de DOS MENÚS
    const twoMenusMode = this.tipoDeclaracion !== 'aviso' && this.declaracionCompleta;

    if (twoMenusMode) {
      // MODO DOS MENÚS: Actualizar AMBOS menús simultáneamente
      console.log('📋 Modo DOS MENÚS detectado - Actualizando Situación Patrimonial e Intereses');

      setTimeout(() => {
        // Calcular opciones visibles de situación patrimonial
        const visibleSituacionOptions = this.declaracionSimplificada
          ? this.situacionPatrimonialOptions.filter(opt => opt.simplificada)
          : this.situacionPatrimonialOptions;

        // Actualizar menú I - Situación Patrimonial
        this.updateSingleMenu(
          'situacionPatrimonial',
          visibleSituacionOptions,
          0  // Índice de inicio: 0
        );

        // Actualizar menú II - Intereses
        // El índice de inicio es el número de opciones visibles del primer menú
        this.updateSingleMenu(
          'intereses',
          this.interesesOptions,
          visibleSituacionOptions.length
        );
      }, 50);
    } else {
      // MODO UN SOLO MENÚ: Lógica original
      let options: MenuOption[] = [];
      let section: 'situacionPatrimonial' | 'intereses' | 'aviso';

      if (this.tipoDeclaracion === 'aviso') {
        options = this.avisoOptions;
        section = 'aviso';
      } else if (this.url.includes('/intereses/')) {
        options = this.interesesOptions;
        section = 'intereses';
      } else {
        options = this.declaracionSimplificada
          ? this.situacionPatrimonialOptions.filter(opt => opt.simplificada)
          : this.situacionPatrimonialOptions;
        section = 'situacionPatrimonial';
      }

      console.log(`📋 Modo UN MENÚ: ${section} con ${options.length} opciones`);

      setTimeout(() => {
        this.updateSingleMenu(section, options, 0);
      }, 50);
    }
  }

  /**
 * Actualiza un menú específico
 * @param section - Sección del menú ('aviso' | 'situacionPatrimonial' | 'intereses')
 * @param options - Opciones del menú
 * @param startIndex - Índice de inicio en el DOM (para cuando hay múltiples menús)
 */
  private updateSingleMenu(
    section: 'situacionPatrimonial' | 'intereses' | 'aviso',
    options: MenuOption[],
    startIndex: number
  ): void {
    console.log(`🎨 Actualizando menú: ${section} (inicio en índice ${startIndex})`);

    // Buscar todos los mat-step-header en el documento
    const stepHeaders = document.querySelectorAll('mat-vertical-stepper .mat-step-header');

    console.log(`📊 Total de step-headers encontrados en DOM: ${stepHeaders.length}`);
    console.log(`📊 Opciones a procesar: ${options.length}`);

    if (stepHeaders.length === 0) {
      console.warn('⚠️ No se encontraron step-headers en el DOM, reintentando...');
      setTimeout(() => {
        this.updateSingleMenu(section, options, startIndex);
      }, 200);
      return;
    }

    // Actualizar cada step del menú
    options.forEach((option, index) => {
      const globalIndex = startIndex + index;

      if (globalIndex < stepHeaders.length) {
        const stepHeader = stepHeaders[globalIndex];
        const isCurrentRecord = this.isCurrentRecord(option.url);

        // Remover todas las clases primero
        stepHeader.classList.remove('step-current');
        stepHeader.classList.remove('step-from-previous');

        // Aplicar la clase correcta
        if (isCurrentRecord) {
          // AZUL - registro actual
          stepHeader.classList.add('step-current');
          console.log(`  🔵 Step ${globalIndex} [${section}]: "${option.text}" → AZUL (current)`);
        } else {
          // GRIS - registro anterior
          stepHeader.classList.add('step-from-previous');
          console.log(`  ⚪ Step ${globalIndex} [${section}]: "${option.text}" → GRIS (previous)`);
        }
      } else {
        console.warn(`⚠️ Step ${globalIndex} fuera de rango (max: ${stepHeaders.length - 1})`);
      }
    });
  }


  /**
   * Determina si una opción es del REGISTRO ACTUAL (azul) o ANTERIOR (gris)
   */
  isCurrentRecord(url: string): boolean {
    let section: 'situacionPatrimonial' | 'intereses' | 'aviso';

    if (this.tipoDeclaracion === 'aviso') {
      section = 'aviso';
    } else if (url.includes('/ingresos-netos') ||
      url.includes('/servidor-publico') ||
      url.includes('/bienes-inmuebles') ||
      url.includes('/vehiculos') ||
      url.includes('/bienes-muebles') ||
      url.includes('/inversiones') ||
      url.includes('/adeudos') ||
      url.includes('/prestamos-terceros') ||
      url.includes('/datos-generales') ||
      url.includes('/domicilio-declarante') ||
      url.includes('/datos-curriculares') ||
      url.includes('/datos-empleo') ||
      url.includes('/experiencia-laboral') ||
      url.includes('/datos-pareja') ||
      url.includes('/datos-dependiente')) {
      // URLs de Situación Patrimonial
      section = 'situacionPatrimonial';
    } else {
      // URLs de Intereses
      section = 'intereses';
    }

    const isCurrentRecord = this.menuStateService.isUrlSaved(
      url,
      section,
      this.tipoDeclaracion,
      this.declaracionSimplificada
    );

    console.log(`🔍 Verificando URL "${url}" en sección "${section}":`, isCurrentRecord ? '✅ AZUL' : '❌ GRIS');

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