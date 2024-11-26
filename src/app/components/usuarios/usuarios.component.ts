import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AltaComponent } from './alta/alta.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { HistoriaComponent } from './historia/historia.component';
import { trigger, transition, style, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { query, where } from 'firebase/firestore';
import { EdadPipe } from '../../pipes/edad.pipe';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AltaComponent, SpinnerComponent, HistoriaComponent, EdadPipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('expand', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ]),
    trigger('slideInFromTop', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
  
})
export class UsuariosComponent {

  activeTab: string = 'listado';
  usuarios: any[] = []; // Variable para almacenar los usuarios
  usuariosFiltrados: any[] = [];     // Lista de usuarios filtrados según el tipo seleccionado
  selectedUserType: string = 'especialista'; // Tipo de usuario seleccionado en el filtro


  loading: boolean = false;

  downloadExcel() {
    // Estructura de datos para el Excel
    const datosExcel = this.usuariosFiltrados.map(usuario => {
      const baseData: any = {
        'Nombre Completo': `${usuario.nombre} ${usuario.apellido}`,
        DNI: usuario.dni,
        Edad: usuario.edad,
        Email: usuario.email,
        Imagen: usuario.foto1, // Podrías usar la URL de la imagen.
      };
  
      // Campos adicionales según el tipo de usuario
      if (this.selectedUserType === 'especialista') {
        baseData['Activo'] = usuario.estado === 'aprobado' ? 'Sí' : 'No';
      } else if (this.selectedUserType === 'paciente') {
        baseData['Obra Social'] = usuario.obrasocial;
      }
  
      return baseData;
    });
  
    // Crear la hoja de trabajo (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
  
    // Crear el libro de trabajo (workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  
    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Crear un Blob y descargar el archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `usuarios_${this.selectedUserType}.xlsx`);
  }
  

  constructor(private firestore: Firestore)
  {

  }

  async ngOnInit() {
    await this.obtenerUsuarios();
    this.filterUsers() 
  }

  async obtenerUsuarios() {
    this.loading = true;
    const col = collection(this.firestore, 'usuarios'); // Asegúrate que 'usuarios' sea el nombre correcto de la colección
    const querySnapshot = await getDocs(col);
    this.usuarios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    this.loading = false;
  }

  filterUsers() 
  {
    this.usuariosFiltrados = this.usuarios.filter(user => user.tipo === this.selectedUserType);
  }

  async toggleEstado(usuario: any, event: Event) {
    const nuevoEstado = (event.target as HTMLInputElement).checked ? 'aprobado' : 'pendiente';
    
    try {
      // Referencia al documento del usuario en la base de datos
      const userRef = doc(this.firestore, `usuarios/${usuario.id}`);
      
      // Actualización del estado en la base de datos
      await updateDoc(userRef, { estado: nuevoEstado });
      
      // Actualiza el valor localmente para evitar recargar la lista
      usuario.estado = nuevoEstado;
      
      console.log(`Usuario ${usuario.nombre} actualizado a estado: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error actualizando el estado:', error);
    }
  }

  async descargarTurnos(usuario: any) {
    try {
      const turnosRef = collection(this.firestore, 'turnos'); // Referencia a la colección "turnos"
      let q = null;
      this.selectedUserType == 'paciente' ? q = query(turnosRef, where('emailPaciente', '==', usuario.email)) : q = query(turnosRef, where('emailEspecialista', '==', usuario.email)); // Filtrar por emailPaciente

      // Obtener los documentos de la consulta
      const querySnapshot = await getDocs(q);
  
      // Mapear los datos necesarios
      const turnos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const datosPrincipales = data['datosPrincipales'] || [null, null, null, null]; // Asegurar que siempre tenga 4 elementos
        const datosDinamicos = data['datosDinamicos'] || {}; // Asegurar que siempre tenga un objeto vacío
  
        // Obtener hasta tres pares clave-valor de datosDinamicos
        const clavesValores = Object.entries(datosDinamicos).slice(0, 3);
        const datoDinamico1 = clavesValores[0] ? `${clavesValores[0][0]}: ${clavesValores[0][1]}` : 'N/A';
        const datoDinamico2 = clavesValores[1] ? `${clavesValores[1][0]}: ${clavesValores[1][1]}` : 'N/A';
        const datoDinamico3 = clavesValores[2] ? `${clavesValores[2][0]}: ${clavesValores[2][1]}` : 'N/A';
  
        return {
          turno: data['turno'],
          emailPaciente: data['emailPaciente'],
          paciente: data['paciente'],
          emailEspecialista: data['emailEspecialista'],
          especialista: data['especialista'],
          especialidad: data['especialidad'],
          estado: data['estado'],
          altura: datosPrincipales[0] || 'N/A',
          peso: datosPrincipales[1] || 'N/A',
          temperatura: datosPrincipales[2] || 'N/A',
          presion: datosPrincipales[3] || 'N/A',
          datoDinamico1,
          datoDinamico2,
          datoDinamico3,
        };
      });
  
      // Verificar si hay datos
      if (turnos.length === 0) {
        Swal.fire({
          title: 'Error!',
          text: 'No se encontraron turnos para este usuario',
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false,
        });
        return;
      }
  
      // Generar Excel
      const worksheet = XLSX.utils.json_to_sheet(turnos); // Convertir los datos a una hoja de Excel
      const workbook = XLSX.utils.book_new(); // Crear un nuevo libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Turnos'); // Agregar la hoja al libro
  
      // Descargar el archivo
      const nombreArchivo = `Turnos_${usuario.nombre}_${usuario.apellido}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
    } catch (error) {
      console.error('Error al descargar los turnos:', error);
    }
  }
  

  async mostrarHistoriasClinicas(usuario: any) {
    try {
      const emailPaciente = usuario.email;  // Obtener el email del usuario
      const turnosRef = collection(this.firestore, 'turnos'); // Obtener la colección "turnos"
      const q = query(
        turnosRef,
        where('emailPaciente', '==', emailPaciente),  // Filtrar por el email del paciente
        where('datosPrincipales', '!=', null)  // Filtrar solo los turnos que tengan datosPrincipales
      );
  
      // Obtener los documentos de la consulta
      const querySnapshot = await getDocs(q);
  
      const historiasClinicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        turno: doc.data()['turno'],
        especialidad: doc.data()['especialidad'],
        especialista: doc.data()['especialista'],
        paciente: doc.data()['paciente'],
        datosPrincipales: doc.data()['datosPrincipales'],
        datosDinamicos: doc.data()['datosDinamicos'],
      }));
  
      if (historiasClinicas.length === 0) {
        Swal.fire({
          title: 'Error!',
          text: 'No se encontraron historias clínicas para este usuario',
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false,
        });
        return;
      }
  
      // Crear HTML para mostrar todos los turnos e historias clínicas
      let htmlContenido = '<div>';
      historiasClinicas.forEach(turno => {
        // Etiquetas para los datos principales
        const etiquetasPrincipales = ['Altura (cm)', 'Peso (kg)', 'Temperatura', 'Presión'];
        const datosPrincipales = turno.datosPrincipales || [];
  
        // HTML de los datos principales
        let htmlPrincipales = `<h3>Turno: ${turno.turno} - Especialidad: ${turno.especialidad}</h3>`;
        htmlPrincipales += '<ul>';
        datosPrincipales.forEach((dato: string, index: number) => {
          htmlPrincipales += `<li><strong>${etiquetasPrincipales[index]}:</strong> ${dato || 'N/A'}</li>`;
        });
        htmlPrincipales += '</ul>';
  
        // HTML de los datos dinámicos
        const datosDinamicos = turno.datosDinamicos || {};
        let htmlDinamicos = '<h4>Datos Adicionales</h4>';
        if (Object.keys(datosDinamicos).length > 0) {
          htmlDinamicos += '<ul>';
          for (const [clave, valor] of Object.entries(datosDinamicos)) {
            htmlDinamicos += `<li><strong>${clave}:</strong> ${valor}</li>`;
          }
          htmlDinamicos += '</ul>';
        } else {
          htmlDinamicos += '<p>No hay datos adicionales.</p>';
        }
  
        // Agregar todo el contenido del turno al HTML final
        htmlContenido += htmlPrincipales + htmlDinamicos;
      });
      htmlContenido += '</div>';
  
      // Mostrar SweetAlert con todos los turnos
      Swal.fire({
        title: 'Historias Clínicas',
        html: htmlContenido,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: '800px',
        heightAuto: false,
        showCloseButton: true,
      });
  
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error);
    }
  }
  
}
