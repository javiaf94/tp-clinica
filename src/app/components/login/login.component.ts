import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Firestore, collection, query, where, getDocs} from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  form!: FormGroup;
  email1: string = 'paciente@prueba.com';
  email2: string = 'especialista@prueba.com';
  email3: string = 'administrador@prueba.com';
  password: string = 'test123';

  constructor(private fb:FormBuilder, private router: Router, private auth:AuthService, private firestore: Firestore)
  {

  }

  ngOnInit()
  {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin()
  {
    try
    {
      let user = await this.auth.login(this.form.get('email')?.value, this.form.get('contraseña')?.value);

      const col = collection(this.firestore, 'usuarios'); // Colección de usuarios
      const q = query(col, where('email', '==', user.email)); // Consulta
      const querySnapshot = await getDocs(q);
      const userData:any[]  = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
      this.auth.mailUsuario = userData[0].email;
      this.auth.tipoUsuario = userData[0].tipo;
      this.auth.nombreUsuario = userData[0].nombre;
      
      const estado = userData[0].estado;
      
      switch(this.auth.tipoUsuario)
      {
        case 'paciente':
          this.router.navigate(['perfil']);
          break;
        
        case 'admin':
          this.router.navigate(['usuarios']);
          break;


        case 'especialista':
          if(estado != 'aprobado')
          {
            this.auth.logout();
            throw new Error("Su usuario debe ser aprobado por un administrador primero")
          }
          else
          {
            this.router.navigate(['perfil']);
          }
          break;


        default:
          this.router.navigate(['perfil']);
      }

    }
    catch(e)
    {
      if (e instanceof Error) 
        {
          if(e.message == 'Firebase: Error (auth/invalid-credential).')
          {
            Swal.fire( { title: 'Error!',
              text: 'Usuario y/o contraseña incorrectos',
              icon: 'error',
              confirmButtonColor: '#4CAF50',
              background: '#f2f2f2',
              heightAuto: false
            }); 
          }
          else
          {
            Swal.fire( { title: 'Error!',
              text: e.message,
              icon: 'error',
              confirmButtonColor: '#4CAF50',
              background: '#f2f2f2',
              heightAuto: false
            }); 
            }
          }
    }
 }

  goToRegister()
  {
    this.router.navigate(['registro']);
  }

  onSubmit()
  {

  }

  completarAccesoRapido(email:string, password:string)
  {
    this.form.patchValue( {['email']: email, ['contraseña']: password});
  }
}