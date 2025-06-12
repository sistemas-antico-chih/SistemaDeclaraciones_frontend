import { Routes, Route } from '@angular/router';

import { AuthenticationGuard } from '@app/auth';
import { ShellAvisoComponent } from './shellAviso.component';

/**
 * Provides helper methods to create routes.
 */
export class ShellAviso {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: ShellAvisoComponent,
      children: routes,
      canActivate: [AuthenticationGuard],
    };
  }
}
