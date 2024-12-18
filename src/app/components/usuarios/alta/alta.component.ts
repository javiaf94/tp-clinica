import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Firestore, addDoc, collection,getDocs, query, where } from '@angular/fire/firestore';
import { ref, uploadString, getDownloadURL, getStorage } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { SpinnerComponent } from '../../spinner/spinner.component';


@Component({
  selector: 'app-alta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpinnerComponent],
  templateUrl: './alta.component.html',
  styleUrl: './alta.component.scss'
})
export class AltaComponent {
  especialista:boolean = false;
  otra:boolean = false;
  especialidades: string[] = [];
  imagenesInvalid: boolean = false; // Para validar las imágenes
  imagenesInvalidEspecialista: boolean = false; // Para validar las imágenes
  imagenesInvalidAdministrador: boolean = false; // Para validar las imágenes

  selectedUserType: string = 'paciente';

  usuarioForm!: FormGroup;
  especialistaForm!: FormGroup;
  adminForm!: FormGroup;

  loading: boolean = false;

  

  constructor( private firestore: Firestore,  private router: Router, private authService: AuthService, private fb: FormBuilder, private storage: Storage)
  {
 
  }
 

  ngOnInit()
  {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(8), Validators.minLength(8)]],
      edad: [[], [Validators.required,  Validators.pattern('^[0-9]*$'), Validators.max(125)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      obrasocial: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\\s]+$')]],
      imagenes: [null, this.imageValidator.bind(this)] // Asigna el validador aquí
    });

    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(8), Validators.minLength(8)]],
      edad: [[], [Validators.required,  Validators.pattern('^[0-9]*$'), Validators.min(21), Validators.max(65)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      especialidad: [[], [Validators.required]],
      especialidadadicional: [''],

      imagenes: [null, this.imageValidator.bind(this)] // Asigna el validador aquí

    });

    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(8), Validators.minLength(8)]],
      edad: [[], [Validators.required,  Validators.pattern('^[0-9]*$'), Validators.min(21), Validators.max(65)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      imagenes: [null, this.imageValidator.bind(this)] // Asigna el validador aquí

    });

    this.especialistaForm.get('especialidadadicional')?.clearValidators();
    this.especialistaForm.get('especialidadadicional')?.updateValueAndValidity();
  }


  imageValidator(control: any) {
    if (this.selectedUserType  == 'especialista') {
      // Para el formulario especialista: 1 imagen es requerida
      if (!control.value || control.value.length !== 1) {
        return { required: true }; // Invalido si no hay imagen o no es exactamente 1
      }
    }
    else if (this.selectedUserType  == 'administrador') {
      // Para el formulario especialista: 1 imagen es requerida
      if (!control.value || control.value.length !== 1) {
        return { required: true }; // Invalido si no hay imagen o no es exactamente 1
      }
    }
     else {
      // Para el formulario usuario: 2 imágenes son requeridas
      if (!control.value || control.value.length !== 2) {
        return { required: true }; // Invalido si no hay imagen o no son exactamente 2
      }
    }
    return null; // Válido si cumple con las condiciones
  }

  onFileChange(event: any) {
    const files = event.target.files;

    // Verificar que se hayan subido la cantidad correcta de imágenes
    if ( ((this.selectedUserType  == 'especialista' || this.selectedUserType  == 'administrador') && files.length === 1  ) || this.selectedUserType  != 'especialista' && files.length === 2) {
        const fileArray = Array.from(files);
        const imageDataArray: any[] = [];

        // Convertir cada imagen a dataUrl
        fileArray.forEach((file: any, index: number) => {
            const reader = new FileReader();
            reader.onload = () => {
                imageDataArray.push({ dataUrl: reader.result });
                
                // Verificar si ya hemos procesado todas las imágenes
                if (imageDataArray.length === fileArray.length) {
                    // Actualizar el valor en el formulario una vez que se han convertido todas
                    if (this.selectedUserType  == 'especialista') {
                        this.especialistaForm.patchValue({ imagenes: imageDataArray });
                        this.imagenesInvalidEspecialista = false;
                    } else if (this.selectedUserType  == 'paciente') {
                        this.usuarioForm.patchValue({ imagenes: imageDataArray });
                        this.imagenesInvalid = false;
                    }
                    else
                    {
                      this.adminForm.patchValue({ imagenes: imageDataArray });
                      this.imagenesInvalidAdministrador = false;
                    }
                }
            };
            reader.readAsDataURL(file); // Convierte la imagen a dataUrl
        });
    } else {
        if (this.selectedUserType  == 'especialista') {
            this.imagenesInvalidEspecialista = true;
        } else if (this.selectedUserType  == 'paciente') {
            this.imagenesInvalid = true;
        }
        else
        {
          this.imagenesInvalidAdministrador = true;

        }
    }

    // Actualizar la validez del control de imágenes
    this.especialistaForm.get('imagenes')?.updateValueAndValidity();
    this.usuarioForm.get('imagenes')?.updateValueAndValidity();
    this.adminForm.get('imagenes')?.updateValueAndValidity();

}


 
  onCheckboxChange(value: string) {
    const index = this.especialidades.indexOf(value);
    if (index === -1) {
      this.especialidades.push(value); // Agregar si no está presente
      if(value=='Otra')
      {

        this.otra = !this.otra;
        this.especialistaForm.patchValue({ especialidad: this.especialidades });
  
        this.especialistaForm.get('especialidadadicional')?.setValidators([
          Validators.required,
          Validators.pattern('^(?!\\s*$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')
        ]);
      }

    } else {
      this.especialidades.splice(index, 1); // Eliminar si ya está presente
      if(value=='Otra')
      {
        this.otra = !this.otra;
        this.especialistaForm.patchValue({ especialidad: this.especialidades });
        this.especialistaForm.get('especialidadadicional')?.clearValidators();

      }
    }
    this.especialistaForm.patchValue({ especialidad: this.especialidades }); // Actualizar el FormGroup
    this.especialistaForm.get('especialidadadicional')?.updateValueAndValidity();

  }

  

  async onSubmit()
  {
    this.loading = true;
    const nombre = this.usuarioForm.get('nombre')?.value;
    const apellido = this.usuarioForm.get('apellido')?.value;      
    const dni = this.usuarioForm.get('dni')?.value;      
    const edad = this.usuarioForm.get('edad')?.value;      
    const email = this.usuarioForm.get('email')?.value; 
    const contraseña = this.usuarioForm.get('contraseña')?.value; 
    const obrasocial = this.usuarioForm.get('obrasocial')?.value; 

    try
    {
      await this.authService.register(email, contraseña);

      const storage = getStorage();
      const imagenes = this.usuarioForm.get('imagenes')?.value;
      const imageRef1 = ref(storage, `usuarios/${email}_1`);
      const imageRef2 = ref(storage, `usuarios/${email}_2`);

          // Subir la primera imagen
      await uploadString(imageRef1, imagenes[0].dataUrl, 'data_url');
      const imageURL1 = await getDownloadURL(imageRef1);

      // Subir la segunda imagen
      await uploadString(imageRef2, imagenes[1].dataUrl, 'data_url');
      const imageURL2 = await getDownloadURL(imageRef2);

      const col = collection(this.firestore, 'usuarios'); // Colección de usuarios
      await addDoc(col, {
        email: email,
        dni: dni,
        nombre: nombre,
        apellido: apellido,
        edad: edad, // Asignamos la imagen
        obrasocial: obrasocial, // Puedes definir el estado inicial que desees
        foto1: imageURL1,
        foto2: imageURL2,
        tipo: 'paciente'
      });

      Swal.fire( { title: 'Usuario creado',
        text: 'El usuario fue creado correctamente. Se envió un email para que el usuario valide la cuenta antes de poder ingresar',
        icon: 'success',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      });    
      this.router.navigate(['login']);
      this.loading = false;
    }
    catch(e)
    {
      Swal.fire( { title: 'Error!',
        text: "El usuario ya se encuentra en uso",
        icon: 'error',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      })    
      this.loading = false;
    }      
   }

  async onSubmitEspecialista()
  {
    this.loading = true;
    const nombre = this.especialistaForm.get('nombre')?.value;
    const apellido = this.especialistaForm.get('apellido')?.value;      
    const dni = this.especialistaForm.get('dni')?.value;      
    const edad = this.especialistaForm.get('edad')?.value;      
    const email = this.especialistaForm.get('email')?.value; 
    const contraseña = this.especialistaForm.get('contraseña')?.value; 
    const especialidades = this.especialistaForm.get('especialidad')?.value; 

    const especialidadesArray = especialidades.map((especialidad: string) => 
      especialidad === 'Otra' ? this.especialistaForm.get('especialidadadicional')?.value : especialidad
    );
  
    try
    {
      await this.authService.register(email, contraseña);

      const storage = getStorage();
      const imagenes = this.especialistaForm.get('imagenes')?.value;
      const imageRef1 = ref(storage, `usuarios/${email}_1`);

     // Subir la primera imagen
      await uploadString(imageRef1, imagenes[0].dataUrl, 'data_url');
      const imageURL1 = await getDownloadURL(imageRef1);

      const col = collection(this.firestore, 'usuarios'); // Colección de usuarios
      await addDoc(col, {
        email: email,
        dni: dni,
        nombre: nombre,
        apellido: apellido,
        edad: edad, // Asignamos la imagen
        especialidades: especialidadesArray, // Puedes definir el estado inicial que desees
        foto1: imageURL1,
        tipo: 'especialista',
        estado: 'aprobado'
      });
      Swal.fire( { title: 'Usuario creado',
        text: 'El usuario fue creado correctamente. Se envió un email para que el usuario valide la cuenta antes de poder ingresar.',
        icon: 'success',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      });    
      this.loading = false;
      this.router.navigate(['login']);
    }
    catch(e)
    {
      Swal.fire( { title: 'Error!',
        text: "El usuario ya se encuentra en uso",
        icon: 'error',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      })  
      this.loading = false;
    }  
    }

  goToLogin(){
    this.router.navigate(['login']);
  }

  onUserTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Obtiene el elemento select
    this.selectedUserType = selectElement.value; // Asigna el valor seleccionado a selectedUserType
    console.log('Tipo de usuario seleccionado:', this.selectedUserType);
    
  }

  async onSubmitAdministrador()
  {
    this.loading = true;
    const nombre = this.adminForm.get('nombre')?.value;
    const apellido = this.adminForm.get('apellido')?.value;      
    const dni = this.adminForm.get('dni')?.value;      
    const edad = this.adminForm.get('edad')?.value;      
    const email = this.adminForm.get('email')?.value; 
    const contraseña = this.adminForm.get('contraseña')?.value;
    try
    {
      await this.authService.register(email, contraseña);

      const storage = getStorage();
      const imagenes = this.adminForm.get('imagenes')?.value;
      const imageRef1 = ref(storage, `usuarios/${email}_1`);

     // Subir la primera imagen
      await uploadString(imageRef1, imagenes[0].dataUrl, 'data_url');
      const imageURL1 = await getDownloadURL(imageRef1);

      const col = collection(this.firestore, 'usuarios'); // Colección de usuarios
      await addDoc(col, {
        email: email,
        dni: dni,
        nombre: nombre,
        apellido: apellido,
        edad: edad, // Asignamos la imagen
        foto1: imageURL1,
        tipo: 'admin',
        estado: ''
      });
      Swal.fire( { title: 'Usuario creado',
        text: 'El usuario fue creado correctamente. Se envió un email para que el usuario valide la cuenta antes de poder ingresar',
        icon: 'success',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      });    
      this.loading = false;
      this.router.navigate(['login']);
    }
    catch(e)
    {
      Swal.fire( { title: 'Error!',
        text: "El usuario ya se encuentra en uso",
        icon: 'error',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      })  
      this.loading = false;
    }  
  }
}
