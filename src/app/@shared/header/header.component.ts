import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../auth/authentication.service';
import { CredentialsService } from '../../auth/credentials.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isDeclarant = false;

  constructor(
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private router: Router
  ) {
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    this.isAdmin = this.credentialsService.isAdmin();
    this.isDeclarant = this.credentialsService.isDeclarant();
  }

  goTo(route: string) {
    console.log('route: '+route);
    this.router.navigate([`/${route}`], { replaceUrl: true });
    console.log('probando: '+this.router.navigate([`/${route}`], { replaceUrl: true }));
  }

  /*goToPDF(route: string) {
    console.log('route: '+route);
    const url = this.router.createUrlTree([`/${route}`]);
    console.log('url: '+url);
    window.open(url.toString(), '_blank');
  }*/

  ngOnInit() {}

  logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }
}
