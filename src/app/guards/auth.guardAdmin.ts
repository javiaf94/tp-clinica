import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import Swal from 'sweetalert2';


export const authGuardAdmin: CanActivateFn = (route, state) => {
  
  const auth = inject(AuthService);

  return auth.getUserEmail().pipe(
    map((email) => {
      if (email === 'administrador@prueba.com') {
        console.log("Puede pasar");
        return true;
      } else {
        console.log("No puede pasar");

        Swal.fire({ 
          title: 'Error!',
          text: 'Debe iniciar sesión como administrador para acceder a esta página',
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        });
        return false;
      }
    })
  );
};
