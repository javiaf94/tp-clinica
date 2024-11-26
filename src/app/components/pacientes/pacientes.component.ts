import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { CapitalizeFirstLetterPipe } from '../../pipes/capitalize-nombres';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, CapitalizeFirstLetterPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' }))
      ])
    ]),
    trigger('turnoExpand', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('500ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PacientesComponent {
  historiasClinicas: any[] = []; // Lista de historias clínicas originales
  historiasClinicasAgrupadas: any[] = []; // Historias agrupadas por paciente

  usuario: any;
  usuarioDocId: string = ''; // ID del documento de usuario

  constructor(private authService: AuthService, private firestore: Firestore) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe(async (email) => {
      if (email) {
        try {
          const usuariosRef = collection(this.firestore, 'usuarios');
          const q = query(usuariosRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            this.usuario = doc.data();
            this.usuarioDocId = doc.id;
          });

          if (!this.usuario) {
            console.log('Usuario no encontrado');
          }

          this.getHistoriasClinicas(); // Llamar a la función para cargar las historias clínicas
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
        }
      }
    });
  }

  async getHistoriasClinicas() {
    try {
      const emailEspecialista = this.usuario.email;
      const turnosRef = collection(this.firestore, 'turnos');
      const q = query(
        turnosRef,
        where('emailEspecialista', '==', emailEspecialista),
        where('estado', '==', 'finalizado')
      );

      const querySnapshot = await getDocs(q);

      this.historiasClinicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        turno: doc.data()['turno'],
        especialidad: doc.data()['especialidad'],
        paciente: doc.data()['paciente'],
        datosPrincipales: doc.data()['datosPrincipales'],
        datosDinamicos: doc.data()['datosDinamicos'],
        emailPaciente: doc.data()['emailPaciente'],
        resena: doc.data()['resena'],
        imagen: doc.data()['imagenPaciente']
      }));

      this.agruparHistoriasPorPaciente(); // Agrupar las historias por paciente
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error);
    }
  }


  

  agruparHistoriasPorPaciente() {
    const agrupado: { [key: string]: any } = {};
  
    // Agrupa las historias por el email del paciente
    this.historiasClinicas.forEach(historia => {
      if (!agrupado[historia.emailPaciente]) {
        agrupado[historia.emailPaciente] = {
          paciente: historia.paciente,
          imagen: historia.imagen,
          turnos: []
        };
      }
      agrupado[historia.emailPaciente].turnos.push(historia);
    });
  
    // Convierte el objeto agrupado en un array y ordena los turnos por fecha
    this.historiasClinicasAgrupadas = Object.values(agrupado).map(grupo => {
      grupo.turnos.sort((a: { turno: string }, b: { turno: string }) => {
        return new Date(b.turno.split(',')[0]).getTime() - new Date(a.turno.split(',')[0]).getTime();
      });
      return grupo;
    });
  }

  async verHistoriaClinica(turno: any) {
    if (turno.datosPrincipales || turno.datosDinamicos) {
      // Obtener los datos principales y asignar etiquetas
      const etiquetasPrincipales = ['Altura', 'Peso', 'Temperatura', 'Presión'];
      const datosPrincipales = turno.datosPrincipales || [];
  
      // Crear HTML para mostrar los datos principales
      let htmlPrincipales = '<div><h3>Datos Principales</h3><ul>';
      datosPrincipales.forEach((dato: string, index: number) => {
        htmlPrincipales += `<li><strong>${etiquetasPrincipales[index]}:</strong> ${dato || 'N/A'}</li>`;
      });
      htmlPrincipales += '</ul></div>';
  
      // Crear HTML para mostrar los datos dinámicos
      const datosDinamicos = turno.datosDinamicos || {};
      let htmlDinamicos = '<div style="margin-top: 20px;"><h3>Datos Adicionales</h3>';
      if (Object.keys(datosDinamicos).length > 0) {
        htmlDinamicos += '<ul>';
        for (const [clave, valor] of Object.entries(datosDinamicos)) {
          htmlDinamicos += `<li><strong>${clave}:</strong> ${valor}</li>`;
        }
        htmlDinamicos += '</ul>';
      } else {
        htmlDinamicos += '<p>No hay datos adicionales.</p>';
      }
      htmlDinamicos += '</div>';
  
      // Mostrar SweetAlert con los datos
      Swal.fire({
        title: 'Historia Clínica',
        html: htmlPrincipales + htmlDinamicos,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: '600px'
      });
    } else {
      // Mostrar alerta si no hay historia clínica
      Swal.fire({
        title: 'Sin Historia Clínica',
        text: 'Este turno no tiene historia clínica registrada.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
