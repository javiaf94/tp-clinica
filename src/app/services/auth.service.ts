import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged, authState, sendEmailVerification } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable, map } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public tipoUsuario!: string;
  public mailUsuario!: string;
  public nombreUsuario!: string;

  

  constructor(private auth: Auth) {

   }


  // Login con email y password
  async login(email:string, password:string){
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      if (user && user.emailVerified) {
        return user; // Retorna el usuario si está verificado
      } 
      else if (email == 'especialista@prueba.com' || email == 'administrador@prueba.com' || email == 'paciente@prueba.com')
      {
        return user; // Retorna el usuario si está verificado
      }
      else {      
        await signOut(this.auth); // Cierra la sesión si no está verificado
        throw new Error("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
      }

  }

 async register(email:string, password:string){
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
    const user = userCredential.user;
    if (user) {
      await sendEmailVerification(user);  // Envía el correo de verificación al usuario registrado
      await signOut(this.auth); // Cierra la sesión automáticamente después del registro
    }
    return user;
  }

  //Logout
  logout(){
    return signOut(this.auth);
  }

  isLoggedIn(): Observable<any | null> {
    return authState(this.auth); // authState function that emits user or null
  }

  getUserEmail(): Observable<string | null> {
    return this.isLoggedIn().pipe(
      map((user) => user ? user.email : null) // Devuelve el correo o null
    );
  }
}
