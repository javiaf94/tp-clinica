import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import Swal from 'sweetalert2';
import { Firestore } from '@angular/fire/firestore';
import { collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';


export const authGuardPacienteAdmin: CanActivateFn = (route, state) => {
  
  const auth = inject(AuthService);
  const db = inject(Firestore)

  auth.getUserEmail().subscribe(async (email) => {
    if (email) {
      try {
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
        const usuario = doc.data();
        const usuarioDocId = doc.id; // Guardar el ID del documento

        if (usuario['tipo'] == 'paciente' || usuario['tipo'] == 'admin')
        {
          return true;
        }
        else
        {
          Swal.fire({ 
            title: 'Error!',
            text: 'Solo puede acceder a solicitar turnos siendo paciente o administrador',
            icon: 'error',
            confirmButtonColor: '#4CAF50',
            background: '#f2f2f2',
            heightAuto: false
          });
          return false;
        }
        });
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    }
  });
  alert("algo paso xd");
  return false;
};
