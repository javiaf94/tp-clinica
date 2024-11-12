import { CommonModule } from '@angular/common';
import { Component, Renderer2  } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Firestore, collection, query, where, getDocs} from '@angular/fire/firestore';
import { SpinnerComponent } from '../spinner/spinner.component';
import { IonicModule } from '@ionic/angular';
import { IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { person, personCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, IonicModule], // IonIcon, IonFab, IonFabButton, IonFabList],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  form!: FormGroup;
  email1: string = 'paciente@prueba.com';
  email2: string = 'especialista@prueba.com';
  email3: string = 'administrador@prueba.com';
  password: string = 'test123';

  loading: boolean = false;

  fabOpen = false;
  usuarios = [
    { nombre: 'Admin', imagen: 'admin.png', email: 'administrador@prueba.com'},
    { nombre: 'Especialista 1', imagen: 'doctor.png', email: 'especialista@prueba.com' },
    { nombre: 'Especialista 2', imagen: 'doctor.png', email: 'especialista2@prueba.com' },
    { nombre: 'Paciente 1', imagen: 'paciente.png', email: 'paciente@prueba.com'},
    { nombre: 'Paciente 2', imagen: 'paciente.png', email: 'paciente2@prueba.com' },
    { nombre: 'Paciente 3', imagen: 'paciente.png', email: 'paciente3@prueba.com' }
  ];

  toggleFab() {
    this.fabOpen = !this.fabOpen;
  }
  seleccionarUsuario(usuario: any) {
    this.form.patchValue( {['email']: usuario.email, ['contraseña']: this.password});
    // Agrega la lógica de redirección o manejo según el tipo de usuario seleccionado
  }
  constructor(private fb:FormBuilder, private router: Router, private auth:AuthService, private firestore: Firestore)
  {
    addIcons({personCircle });

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
    this.loading = true;
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
      this.loading = false;
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
            this.loading = false;
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
            this.loading = false;
            }
          }
    }
 }

  goToRegister()
  {
    this.router.navigate(['registro']);
  }


  completarAccesoRapido(email:string, password:string)
  {
    this.form.patchValue( {['email']: email, ['contraseña']: password});
  }

  
}

