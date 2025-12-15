import { Title } from '@angular/platform-browser';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';

import { AuthenticationService, CredentialsService } from '@app/auth';
import { MatStep } from '@angular/material/stepper';
import { MenuStateService } from '@shared/services/menu-state.service'; // Importar el servicio

interface MenuOption {
  text: string;
  url: string;
  simplificada?: boolean;
  saved?: boolean;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  situacionPatrimonialOptions: MenuOption[] = [
    { text: 'Datos generales', url: '/situacion-patrimonial/datos-generales', simplificada: true },
    { text: 'Domicilio del declarante', url: '/situacion-patrimonial/domicilio-declarante', simplificada: true },
    { text: 'Datos curriculares del declarante', url: '/situacion-patrimonial/datos-curriculares', simplificada: true },
    {
      text: 'Datos del empleo, cargo o comisión',
      url: '/situacion-patrimonial/datos-empleo',
      simplificada: true,
    },
    {
      text: 'Experiencia laboral (últimos cinco empleos)',
      url: '/situacion-patrimonial/experiencia-laboral',
      simplificada: true,
    },
    { text: 'Datos de la pareja', url: '/situacion-patrimonial/datos-pareja' },
    { text: 'Datos del dependiente económico', url: '/situacion-patrimonial/datos-dependiente' },
    {
      text: 'Ingresos netos del declarante, pareja y/o dependientes económicos',
      url: '/situacion-patrimonial/ingresos-netos',
      simplificada: true,
    },
    {
      text: '¿Te desempeñaste como servidor público en el año inmediato anterior?',
      url: '/situacion-patrimonial/servidor-publico',
      simplificada: true,
    },
    { text: 'Bienes inmuebles', url: '/situacion-patrimonial/bienes-inmuebles' },
    { text: 'Vehículos', url: '/situacion-patrimonial/vehiculos' },
    { text: 'Bienes muebles', url: '/situacion-patrimonial/bienes-muebles' },
    {
      text: 'Inversiones, cuentas bancarias u otro tipo de valores / activos',
      url: '/situacion-patrimonial/inversiones',
    },
    { text: 'Adeudos / pasivos', url: '/situacion-patrimonial/adeudos' },
    { text: 'Préstamo o comodato por terceros', url: '/situacion-patrimonial/prestamos-terceros' },
  ];

  interesesOptions: MenuOption[] = [
    {
      text: 'Participación en empresas, sociedades o asociaciones (hasta los dos últimos años)',
      url: '/intereses/participacion-empresa',
    },
    {
      text: '¿Participa en la toma de decisiones de alguna de estas instituciones? (hasta los dos últimos años)',
      url: '/intereses/toma-decisiones',
    },
    { text: 'Apoyos o beneficios públicos (hasta los dos últimos años)', url: '/intereses/apoyos-publicos' },
    { text: 'Representación (hasta los dos últimos años)', url: '/intereses/representacion' },
    { text: 'Clientes principales (hasta los dos últimos años)', url: '/intereses/clientes-principales' },
    { text: 'Beneficios privados (hasta los dos últimos años)', url: '/intereses/beneficios-privados' },
    { text: 'Fideicomisos (hasta los dos últimos años)', url: '/intereses/fideicomisos' },
  ];

  avisoOptions: MenuOption[] = [
    { text: 'Datos generales', url: '/datos-generales' },
    { text: 'Domicilio del declarante', url: '/domicilio-declarante'},
    {
      text: 'Aviso cambio de dependencia',
      url: '/datos-empleo',
    },
  ];

  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  url: string = null;

  constructor(
    private router: Router,
    private titleService: Title,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private media: MediaObserver,
    private menuStateService: MenuStateService, // Inyectar el servicio
    private cdr: ChangeDetectorRef // Agregar ChangeDetectorRef
  ) {}

  goToAvisoSection(selectedStep: MatStep) {
    const selected = this.avisoOptions.find((opt) => opt.text === selectedStep.label);
    const route = `/${this.tipoDeclaracion}/${selected.url}`;
    this.router.navigate([route], {
      replaceUrl: true,
    });
  }

  goToInteresesSection(optionIndex: number) {
    this.router.navigate([`/${this.tipoDeclaracion}${this.interesesOptions[optionIndex].url}`], { replaceUrl: true });
  }

  goToSituacionPatrimonialSection(selectedStep: MatStep) {
    const selected = this.situacionPatrimonialOptions.find((opt) => opt.text === selectedStep.label);
    const route =
      this.declaracionSimplificada && selected.simplificada
        ? `/${this.tipoDeclaracion}/simplificada${selected.url}`
        : `/${this.tipoDeclaracion}${selected.url}`;

    this.router.navigate([route], {
      replaceUrl: true,
    });
  }

  ngOnInit() {
    this.url = this.router.url;

    const chunks = this.router.url.split('/');
    this.tipoDeclaracion = chunks[1] || null;
    this.declaracionSimplificada = chunks[2] === 'simplificada';

    // Cargar el estado de guardado desde el servicio
    this.loadSavedState();

    // Suscribirse a cambios en el estado
    this.menuStateService.savedState$.subscribe(state => {
      console.log('🔄 Estado actualizado desde observable:', state);
      this.updateOptionsState(this.situacionPatrimonialOptions, state.situacionPatrimonial);
      this.updateOptionsState(this.interesesOptions, state.intereses);
      this.updateOptionsState(this.avisoOptions, state.aviso);
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = this.router.url;
        
        // ✅ CRÍTICO: Recargar el estado cada vez que navegamos
        console.log('🔄 Navegación detectada, recargando estado...');
        this.loadSavedState();
      }
    });
  }

  /**
   * Carga el estado de guardado desde el servicio
   */
  private loadSavedState() {
    console.log('📂 Cargando estado guardado:', {
      tipoDeclaracion: this.tipoDeclaracion,
      declaracionSimplificada: this.declaracionSimplificada
    });
    
    // Forzar recarga desde localStorage
    const storageKey = `declaracion_saved_state_${this.tipoDeclaracion}_${this.declaracionSimplificada}`;
    const savedStateStr = localStorage.getItem(storageKey);
    
    console.log('💾 Datos en localStorage:', savedStateStr);
    
    const savedState = savedStateStr ? JSON.parse(savedStateStr) : {};
    
    console.log('📋 Estado parseado:', savedState);
    
    this.updateOptionsState(this.situacionPatrimonialOptions, savedState.situacionPatrimonial || []);
    this.updateOptionsState(this.interesesOptions, savedState.intereses || []);
    this.updateOptionsState(this.avisoOptions, savedState.aviso || []);
    
    console.log('📊 Estado final de avisoOptions:', 
      this.avisoOptions.map(o => ({ text: o.text, url: o.url, saved: o.saved }))
    );
  }

  /**
   * Actualiza el estado 'saved' de las opciones del menú
   */
  private updateOptionsState(options: MenuOption[], savedUrls: string[] = []) {
    if (!savedUrls) {
      savedUrls = [];
    }
    
    console.log('🔄 Actualizando estado de opciones:', { savedUrls });
    
    let hasChanges = false;
    
    options.forEach(opt => {
      const newSavedState = savedUrls.includes(opt.url);
      
      if (opt.saved !== newSavedState) {
        opt.saved = newSavedState;
        hasChanges = true;
        console.log(`  ${opt.saved ? '🔵' : '⚪'} ${opt.text}: ${opt.url}`);
      }
    });
    
    // Si hubo cambios, forzar detección
    if (hasChanges) {
      console.log('✅ Se detectaron cambios, forzando actualización de vista');
      this.cdr.detectChanges();
    }
  }

  logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  get username(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.user.username : null;
  }

  get isMobile(): boolean {
    return this.media.isActive('xs') || this.media.isActive('sm');
  }

  get title(): string {
    return this.titleService.getTitle();
  }

  /**
   * Verifica si una URL está guardada leyendo directamente de localStorage
   */
  isOptionSaved(url: string): boolean {
    const storageKey = `declaracion_saved_state_${this.tipoDeclaracion}_${this.declaracionSimplificada}`;
    const savedStateStr = localStorage.getItem(storageKey);
    
    if (!savedStateStr) return false;
    
    try {
      const savedState = JSON.parse(savedStateStr);
      const allSavedUrls = [
        ...(savedState.situacionPatrimonial || []),
        ...(savedState.intereses || []),
        ...(savedState.aviso || [])
      ];
      
      return allSavedUrls.includes(url);
    } catch (e) {
      return false;
    }
  }

  /**
   * TrackBy function para mejorar performance de ngFor
   */
  trackByUrl(index: number, item: MenuOption): string {
    return item.url;
  }
} 