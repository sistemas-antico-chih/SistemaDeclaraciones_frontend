import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewChildren, QueryList, Renderer2 } from '@angular/core';
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
    if (!this.steps || this.steps.length === 0) {
      console.log('⚠️ No hay steps disponibles aún');
      return;
    }

    console.log('🎨 Actualizando colores de steps, total:', this.steps.length);

    // 🔍 DEBUG: Verificar que los steps existen
    this.steps.forEach((step, index) => {
      const stepElement = (step as any)._elementRef?.nativeElement;
      console.log(`Step ${index}:`, {
        exists: !!stepElement,
        classes: stepElement?.className,
        hasHeader: !!stepElement?.querySelector('.mat-step-header')
      });
    });

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

    // Aplicar clases a cada step
    this.steps.forEach((step, index) => {
      if (index < options.length) {
        const option = options[index];
        const isCurrentRecord = this.isCurrentRecord(option.url);

        // Obtener el elemento nativeElement del step
        const stepElement = (step as any)._elementRef?.nativeElement;

        if (stepElement) {
          // Remover todas las clases primero
          this.renderer.removeClass(stepElement, 'step-current');
          this.renderer.removeClass(stepElement, 'step-from-previous');

          // Aplicar la clase correcta
          if (isCurrentRecord) {
            // AZUL - registro actual
            this.renderer.addClass(stepElement, 'step-current');
            console.log(`  🔵 Step ${index}: "${option.text}" → AZUL (current)`);
          } else {
            // GRIS - registro anterior
            this.renderer.addClass(stepElement, 'step-from-previous');
            console.log(`  ⚪ Step ${index}: "${option.text}" → GRIS (previous)`);
          }

          // IMPORTANTE: También aplicar las clases al mat-step-header dentro del step
          const stepHeader = stepElement.querySelector('.mat-step-header');
          if (stepHeader) {
            this.renderer.removeClass(stepHeader, 'step-current');
            this.renderer.removeClass(stepHeader, 'step-from-previous');

            if (isCurrentRecord) {
              this.renderer.addClass(stepHeader, 'step-current');
            } else {
              this.renderer.addClass(stepHeader, 'step-from-previous');
            }
          }
        }
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
    } else if (this.url.includes('/intereses/') || url.includes('participacion') || url.includes('socios')) {
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
}