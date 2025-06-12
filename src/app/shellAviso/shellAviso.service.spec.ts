import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationGuard, AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { ShellAvisoComponent } from './shellAviso.component';
import { ShellAviso } from './shellAviso.service';

describe('ShellAviso', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShellAvisoComponent],
      providers: [AuthenticationGuard, { provide: AuthenticationService, useClass: MockAuthenticationService }],
    });
  });

  describe('childRoutes', () => {
    it('should create routes as children of shell', () => {
      // Prepare
      const testRoutes = [{ path: 'test' }];

      // Act
      const result = ShellAviso.childRoutes(testRoutes);

      // Assert
      expect(result.path).toBe('');
      expect(result.children).toBe(testRoutes);
      expect(result.component).toBe(ShellAvisoComponent);
    });
  });
});
