import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import Swal from 'sweetalert2';


export const authGuard: CanActivateFn = (route, state) => {
  
  const auth = inject(AuthService);
  const router = inject(Router); // Inyectar Router


  return auth.isLoggedIn().pipe(
    map((user) => {
      if (user) {
        console.log("Puede pasar");
        return true;
      } else {
        console.log("No puede pasar");

        Swal.fire( { title: 'Error!',
          text: 'Debe iniciar sesión para acceder a esta página',
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        })
        
        return false;
      }
    })
  );
};
