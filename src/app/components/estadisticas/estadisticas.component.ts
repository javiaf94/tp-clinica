import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from '../spinner/spinner.component';
import { trigger, transition, style, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { query, where } from 'firebase/firestore';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss',
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
export class EstadisticasComponent {

  activeTab: string = 'logs';
  usuarios: any[] = []; // Variable para almacenar los usuarios
  usuariosFiltrados: any[] = [];     // Lista de usuarios filtrados según el tipo seleccionado
  selectedUserType: string = 'especialista'; // Tipo de usuario seleccionado en el filtro

  logs: { email: string; date: string; time: string }[] = [];
  turnosPorEspecialidad: { [especialidad: string]: number } = {};
  turnosPorDia: { [dia: string]: number } = {};
  chart: any;
  chartDia: any;

  logsPorDia: { [dia: string]: number } = {};
  logsForExcel: { email: string; fecha: string; hora: string }[] = [];

  startDate: string = '';
  endDate: string = '';
  turnosPorEspecialista: { [especialista: string]: number } = {};
  turnosForExcel: { especialista: string; fecha: string }[] = [];
  isChartGenerated: boolean = false;

  isFinalizedChartGenerated: boolean = false;
  finalizedTurnosForExcel: any[] = [];
  finalizedTurnosByEspecialista: { [especialista: string]: number } = {};

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    if (this.activeTab === 'logs') {
      await this.loadLogs();
    }
  }

  async loadLogs() {
    const logsCol = collection(this.firestore, 'logs');
    const querySnapshot = await getDocs(logsCol);
    const logs = querySnapshot.docs.map(doc => doc.data() as { email: string, timestamp: string });
  
    // Agrupar logs por fecha y preparar datos para Excel
    this.logsPorDia = logs.reduce((acc, log) => {
      const fechaCompleta = new Date(log.timestamp); // Convertir ISO 8601 a Date
      const fecha = fechaCompleta.toLocaleDateString(); // Extraer fecha (dd/mm/yyyy)
      const hora = fechaCompleta.toLocaleTimeString(); // Extraer hora (hh:mm:ss)
  
      // Agrupar por fecha para el gráfico
      acc[fecha] = (acc[fecha] || 0) + 1;
  
      // Preparar datos para Excel
      this.logsForExcel.push({
        email: log.email,
        fecha,
        hora
      });
  
      return acc;
    }, {} as { [dia: string]: number });
  
    // Ordenar las fechas en logsPorDia
    const orderedLogs = Object.entries(this.logsPorDia).sort(([a], [b]) => {
      const dateA = new Date(a.split('/').reverse().join('/'));
      const dateB = new Date(b.split('/').reverse().join('/'));
      return dateA.getTime() - dateB.getTime();
    });
    this.logsPorDia = Object.fromEntries(orderedLogs);

    this.renderLogsChart();
  }
  
  renderLogsChart() {
    const ctx = document.getElementById('logsChart') as HTMLCanvasElement;
  
    // Extraer etiquetas y datos para el gráfico
    const labels = Object.keys(this.logsPorDia);
    const data = Object.values(this.logsPorDia);
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Cantidad de ingresos por día',
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  downloadPDFLogs() {
    const canvas = document.getElementById('logsChart') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
  
    // Ruta o datos base64 de la imagen principal
    const img = 'icon_circle.png'; // Reemplaza con tu imagen real
  
    // Agregar la imagen principal
    pdf.addImage(img, 'PNG', 80, 10, 50, 50);
  
    // Título centrado debajo de la imagen
    pdf.setFontSize(16);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = 'Cantidad de ingresos por día';
    const textWidth = pdf.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(title, textX, 70);
  
    // Fecha actual centrada y más pequeña
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    const dateWidth = pdf.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    pdf.text(today, dateX, 80);
  
    // Asegurarse de que el gráfico sea cuadrado y no se deforme
    const chartSize = 150;
    pdf.addImage(imageData, 'PNG', 30, 90, chartSize, chartSize);
  
    pdf.save('grafico-logs.pdf');
  }
  
  downloadLogsExcel() {
    const worksheetData = this.logsForExcel.map(log => ({
      Email: log.email,
      Fecha: log.fecha,
      Hora: log.hora
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
  
    XLSX.writeFile(workbook, 'logs.xlsx');
  }

  async loadTurnosPorEspecialidad() {
    const turnosCol = collection(this.firestore, 'turnos'); // Colección "turnos"
    const querySnapshot = await getDocs(turnosCol);
    const turnos = querySnapshot.docs.map(doc => doc.data() as { especialidad: string });
  
    // Contar turnos por especialidad
    this.turnosPorEspecialidad = turnos.reduce((acc, turno) => {
      acc[turno.especialidad] = (acc[turno.especialidad] || 0) + 1;
      return acc;
    }, {} as { [especialidad: string]: number });
  
    this.renderChart();
  }
  
  renderChart() {
    const ctx = document.getElementById('turnosEspecialidadChart') as HTMLCanvasElement;
  
    // Extraer especialidades y cantidades para el gráfico
    const labels = Object.keys(this.turnosPorEspecialidad);
    const data = Object.values(this.turnosPorEspecialidad);
  
    new Chart(ctx, {
      type: 'pie', // Cambiado a gráfico de torta
      data: {
        labels,
        datasets: [
          {
            label: 'Cantidad de turnos por especialidad',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top' // Posición de la leyenda
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = data[tooltipItem.dataIndex];
                const total = data.reduce((sum, current) => sum + current, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value} turnos (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  downloadPDF() {
    const canvas = document.getElementById('turnosEspecialidadChart') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
  
    const img = 'icon_circle.png'; // Reemplaza con tu imagen real
    pdf.addImage(img, 'PNG', 80, 10, 50, 50); // Agregar imagen centrada en la parte superior
  
    // Título centrado debajo de la imagen
    pdf.setFontSize(16);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = 'Cantidad de turnos por especialidad';
    const textWidth = pdf.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(title, textX, 70); // Título centrado
  
    // Fecha actual centrada y más pequeña
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    const dateWidth = pdf.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    pdf.text(today, dateX, 80); // Fecha debajo del título
  
    // Asegurarse de que el gráfico sea cuadrado y no se deforme
    const chartSize = 150;
    pdf.addImage(imageData, 'PNG', 30, 90, chartSize, chartSize); // Ajustar tamaño del gráfico
  
    // Agregar detalles de turnos por especialidad
    pdf.setFontSize(12);
    const turnosDetailsStartY = 250; // Posición inicial para los detalles de turnos
    const totalTurnos = Object.values(this.turnosPorEspecialidad).reduce((sum, current) => sum + current, 0);
    let currentY = turnosDetailsStartY;
  
    // Generar la lista con los turnos por especialidad
    Object.keys(this.turnosPorEspecialidad).forEach((especialidad) => {
      const turnos = this.turnosPorEspecialidad[especialidad];
      const percentage = ((turnos / totalTurnos) * 100).toFixed(1);
      const detailText = `${especialidad}: ${turnos} turnos (${percentage}%)`;
  
      pdf.text(detailText, 20, currentY); // Dibuja la información en el PDF
      currentY += 10; // Espaciado entre las líneas
    });
  
    // Descargar el PDF
    pdf.save('grafico-turnos-especialidad.pdf');
  }
  

  downloadExcel() {
    const worksheetData = Object.keys(this.turnosPorEspecialidad).map(especialidad => ({
      Especialidad: especialidad,
      Turnos: this.turnosPorEspecialidad[especialidad]
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TurnosPorEspecialidad');

    XLSX.writeFile(workbook, 'informe-turnos-especialidad.xlsx');
  }


  async loadTurnosPorDia() {
    const turnosCol = collection(this.firestore, 'turnos');
    const querySnapshot = await getDocs(turnosCol);
    const turnos = querySnapshot.docs.map(doc => doc.data() as { turno: string });
  
    // Procesar días a partir del atributo "turno"
    const turnosPorDia = turnos.reduce((acc, turno) => {
      const dia = turno.turno.split(',')[0].trim(); // Extraer día antes de la coma
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {} as { [dia: string]: number });
  
    // Ordenar días ascendentemente (manejando las fechas como cadenas "dd/mm/yyyy")
    const sortedDias = Object.entries(turnosPorDia).sort((a, b) => {
      return this.compareDates(a[0], b[0]);  // Compara las fechas como cadenas
    });
  
    // Reestructurar datos ordenados
    this.turnosPorDia = sortedDias.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as { [dia: string]: number });
  
    this.renderChartDia();
  }
  
  // Función para comparar las fechas en formato "dd/mm/yyyy"
  compareDates(dateA: string, dateB: string): number {
    const [dayA, monthA, yearA] = dateA.split('/').map(Number);
    const [dayB, monthB, yearB] = dateB.split('/').map(Number);
  
    // Primero comparamos los años, luego los meses, y finalmente los días
    if (yearA !== yearB) {
      return yearA - yearB;
    } else if (monthA !== monthB) {
      return monthA - monthB;
    } else {
      return dayA - dayB;
    }
  }
  
  renderChartDia() {
    const ctx = document.getElementById('turnosDiaChart') as HTMLCanvasElement;
  
    // Extraer días y cantidades ordenados
    const labels = Object.keys(this.turnosPorDia);
    const data = Object.values(this.turnosPorDia);
  
    this.chartDia = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Cantidad de turnos por día',
            data,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  

  downloadPDFDia() {
    const canvas = document.getElementById('turnosDiaChart') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
  
    // Ruta o datos base64 de la imagen (ajusta según sea necesario)
    const img = 'icon_circle.png'; // Reemplaza con tu imagen real
  
    // Agregar la imagen principal (centrada en la parte superior)
    pdf.addImage(img, 'PNG', 80, 10, 50, 50); // Ajusta las coordenadas y tamaño de la imagen principal
  
    // Título centrado debajo de la imagen
    pdf.setFontSize(16);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = 'Cantidad de turnos por día';
    const textWidth = pdf.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(title, textX, 70); // Título centrado justo debajo de la imagen
  
    // Fecha actual centrada y más pequeña
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    const dateWidth = pdf.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    pdf.text(today, dateX, 80); // Fecha debajo del título
  
    // Agregar el gráfico más abajo para evitar la superposición
    pdf.addImage(imageData, 'PNG', 10, 90, 190, 100); // Ajusta la posición y el tamaño del gráfico
  
    // Descargar el PDF
    pdf.save('grafico-turnos-dia.pdf');
  }

  downloadExcelDia() {
    const worksheetData = Object.keys(this.turnosPorDia).map(dia => ({
      Día: dia,
      Turnos: this.turnosPorDia[dia]
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TurnosPorDia');

    XLSX.writeFile(workbook, 'informe-turnos-dia.xlsx');
  }

  async loadTurnosPorEspecialista() {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        title: 'Error',
        text: 'Asegúrese de cargar ambas fechas para generar el gráfico.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
  
    const turnosCol = collection(this.firestore, 'turnos');
    const querySnapshot = await getDocs(turnosCol);
    const turnos = querySnapshot.docs.map(doc => doc.data() as { especialista: string; turno: string });
  
    console.log('Datos cargados:', turnos); // Depuración
  
    // Reiniciar estructuras
    this.turnosForExcel = [];
    this.turnosPorEspecialista = {};
  
    // Procesar turnos y filtrar por rango de fechas
    turnos.forEach(turno => {
      const dia = turno.turno.split(',')[0].trim(); // Extraer día
      const turnoFecha = this.parseDateString(dia).getTime(); // Convertir a timestamp
  
      if (turnoFecha >= start && turnoFecha <= end) {
        // Contar turnos por especialista
        this.turnosPorEspecialista[turno.especialista] = (this.turnosPorEspecialista[turno.especialista] || 0) + 1;
  
        // Preparar datos para Excel
        this.turnosForExcel.push({
          especialista: turno.especialista,
          fecha: new Date(turnoFecha).toLocaleDateString()
        });
      }
    });
  
    console.log('Datos filtrados:', this.turnosForExcel); // Depuración
  
    if(this.turnosForExcel.length > 0)
    {
      this.renderChartEspecialista();
      this.isChartGenerated = true;
    }
    else
    {
      Swal.fire({
        title: 'Error',
        text: 'No se encontraron turnos para ese rango de fechas.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }

  }
  
  // Función para convertir fechas en formato "dd/mm/yyyy" a objetos Date
  parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // Meses en Date son base 0
  }
  
  renderChartEspecialista() {
    const ctx = document.getElementById('turnosEspecialistaChart') as HTMLCanvasElement;
  
    const labels = Object.keys(this.turnosPorEspecialista);
    const data = Object.values(this.turnosPorEspecialista);
  
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label: 'Cantidad de turnos por especialista',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = data[tooltipItem.dataIndex];
                const total = data.reduce((sum, current) => sum + current, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value} turnos (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  downloadExcelespecialista() {
    const worksheetData = Object.keys(this.turnosPorEspecialista).map(especialista => ({
      Especialista: especialista,
      Turnos: this.turnosPorEspecialista[especialista]
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TurnosPorEspecialista');
  
    XLSX.writeFile(workbook, 'turnos-especialista.xlsx');
  }
  
  downloadPDFespecialista() {
    const canvas = document.getElementById('turnosEspecialistaChart') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
  
    const img = 'icon_circle.png'; // Reemplaza con tu imagen real
    pdf.addImage(img, 'PNG', 80, 10, 50, 50);
  
    pdf.setFontSize(16);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = `Turnos por Especialista (${this.startDate} - ${this.endDate})`;
    const textWidth = pdf.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(title, textX, 70);
  
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    const dateWidth = pdf.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    pdf.text(today, dateX, 80);
  
    const chartSize = 150;
    pdf.addImage(imageData, 'PNG', 30, 90, chartSize, chartSize);
  
    // Agregar detalles de turnos por especialista
    pdf.setFontSize(12);
    const turnosDetailsStartY = 250; // Ajusta la posición vertical según sea necesario
  
    // Calcula el total de turnos y el porcentaje para cada especialista
    const totalTurnos = Object.values(this.turnosPorEspecialista).reduce((sum, current) => sum + current, 0);
    let currentY = turnosDetailsStartY;
  
    Object.keys(this.turnosPorEspecialista).forEach((especialista, index) => {
      const turnos = this.turnosPorEspecialista[especialista];
      const percentage = ((turnos / totalTurnos) * 100).toFixed(1);
      const detailText = `${especialista}: ${turnos} turnos (${percentage}%)`;
  
      pdf.text(detailText, 20, currentY); // Dibuja la información en el PDF
      currentY += 10; // Espaciado entre las líneas
    });
  
    pdf.save('turnos-especialista.pdf');
  }
  

  async loadFinalizedTurnos() {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        title: 'Error',
        text: 'Asegúrese de cargar ambas fechas para generar el gráfico.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
  
    const turnosCol = collection(this.firestore, 'turnos');
    const querySnapshot = await getDocs(turnosCol);
    const turnos = querySnapshot.docs.map(doc => doc.data() as { especialista: string; turno: string; estado: string });
  
    console.log('Datos cargados:', turnos); // Depuración
  
    // Reiniciar estructuras
    this.finalizedTurnosForExcel = [];
    this.finalizedTurnosByEspecialista = {};
  
    // Procesar turnos, filtrar por estado y rango de fechas
    turnos.forEach(turno => {
      const dia = turno.turno.split(',')[0].trim(); // Extraer día
      const turnoFecha = this.parseDateString(dia).getTime(); // Convertir a timestamp
  
      if (turno.estado === 'finalizado' && turnoFecha >= start && turnoFecha <= end) {
        // Contar turnos por especialista
        this.finalizedTurnosByEspecialista[turno.especialista] = 
          (this.finalizedTurnosByEspecialista[turno.especialista] || 0) + 1;
  
        // Preparar datos para Excel
        this.finalizedTurnosForExcel.push({
          especialista: turno.especialista,
          fecha: new Date(turnoFecha).toLocaleDateString()
        });
      }
    });
  
    console.log('Datos filtrados:', this.finalizedTurnosForExcel); // Depuración
  
    if (this.finalizedTurnosForExcel.length > 0) {
      this.renderFinalizedChart();
      this.isFinalizedChartGenerated = true;
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se encontraron turnos finalizados para ese rango de fechas.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  
  // Agregar información fuera del gráfico (debajo)
renderFinalizedChart() {
  const ctx = document.getElementById('finalizedTurnosChart') as HTMLCanvasElement;

  const labels = Object.keys(this.finalizedTurnosByEspecialista);
  const data = Object.values(this.finalizedTurnosByEspecialista);
  const totalTurnos = data.reduce((sum, current) => sum + current, 0);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: 'Cantidad de turnos finalizados por especialista',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });

  // Mostrar la información fuera del gráfico
  this.finalizedTurnosSummary = labels.map((label, index) => {
    const value = data[index];
    const percentage = ((value / totalTurnos) * 100).toFixed(1);
    return `${label}: ${value} turnos (${percentage}%)`;
  });
}

finalizedTurnosSummary: any;
  
  downloadExcelFinalized() {
    const worksheetData = Object.keys(this.finalizedTurnosByEspecialista).map(especialista => ({
      Especialista: especialista,
      Turnos: this.finalizedTurnosByEspecialista[especialista]
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TurnosFinalizados');
  
    XLSX.writeFile(workbook, 'turnos-finalizados.xlsx');
  }
  
  downloadPDFFinalized() {
    const canvas = document.getElementById('finalizedTurnosChart') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
  
    const img = 'icon_circle.png'; // Reemplaza con tu imagen real
    pdf.addImage(img, 'PNG', 80, 10, 50, 50);
  
    pdf.setFontSize(16);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = `Turnos Finalizados por Especialista (${this.startDate} - ${this.endDate})`;
    const textWidth = pdf.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(title, textX, 70);
  
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    const dateWidth = pdf.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    pdf.text(today, dateX, 80);
  
    const chartSize = 150;
    pdf.addImage(imageData, 'PNG', 30, 90, chartSize, chartSize);
  
    // Agregar detalles de turnos por especialista
    pdf.setFontSize(12);
    const turnosDetailsStartY = 250; // Ajusta la posición vertical según sea necesario
  
    // Calcula el total de turnos y el porcentaje para cada especialista
    const totalTurnos = Object.values(this.finalizedTurnosByEspecialista).reduce((sum, current) => sum + current, 0);
    let currentY = turnosDetailsStartY;
  
    Object.keys(this.finalizedTurnosByEspecialista).forEach((especialista, index) => {
      const turnos = this.finalizedTurnosByEspecialista[especialista];
      const percentage = ((turnos / totalTurnos) * 100).toFixed(1);
      const detailText = `${especialista}: ${turnos} turnos (${percentage}%)`;
  
      pdf.text(detailText, 20, currentY); // Dibuja la información en el PDF
      currentY += 10; // Espaciado entre las líneas
    });
  
    pdf.save('turnos-finalizados.pdf');
  }
  
  

  async onTabChange(tab: string) {
    this.activeTab = tab;
    this.isChartGenerated = false;
    this.isFinalizedChartGenerated = false;
    if (tab === 'turnos-especialidad') {
      await this.loadTurnosPorEspecialidad();
    }
    if (tab === 'turnos-dia') {
      await this.loadTurnosPorDia();
    }
    if (tab === 'logs') {
      await this.loadLogs();
    }
    // if (tab === 'turnos-especialista') {
    //   await this.generateChart();
    // }
  }
}
