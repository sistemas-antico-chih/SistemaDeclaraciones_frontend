import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';

import { AuthenticationService, CredentialsService } from '@app/auth';
import { MatStep } from '@angular/material/stepper';

@Component({
  selector: 'app-shellAviso',
  templateUrl: './shellAviso.component.html',
  styleUrls: ['./shellAviso.component.scss'],
})
export class ShellAvisoComponent implements OnInit {
  situacionPatrimonialOptions = [
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


  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  url: string = null;

  constructor(
    private router: Router,
    private titleService: Title,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private media: MediaObserver
  ) {}


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

    console.log("tipoDeclaracionAviso: "+this.tipoDeclaracion);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = this.router.url;
      }
    });
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
}
