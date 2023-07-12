const { ipcRenderer } = require("electron");

const socioCedula = document.getElementById("cedula");
const socioApellido = document.getElementById("apellido");
const socioNombre = document.getElementById("nombre");
const medidorCodigo = document.getElementById("codigomedidor");
const medidorUbicacion = document.getElementById("ubicacionmedidor");
const planillaEdicion = document.getElementById("edicionPlanilla");
const planillaFecha = document.getElementById("fechaPlanilla");
const planillaEstado = document.getElementById("estadoPlanilla");
const planillaFechaUp = document.getElementById("fechaEmisionPlanilla");
const socioCedulaUp = document.getElementById("cedulaUp");
const socioNombresUp = document.getElementById("nombrecompletoUp");
const planillaEstadoUp = document.getElementById("estadocuentaUp");
const planillaEdicionUp = document.getElementById("estadoedicionUp");
const medidorCodigoUp = document.getElementById("codigomedidorUp");
const medidorUbicacionUp = document.getElementById("ubicacionmedidorUp");
const planillasList = document.getElementById("planillas");
const serviciosList = document.getElementById("servicios");
const inFormServiciosList = document.getElementById("inFormServicios");
const multasdescList = document.getElementById("multasdesc");
// constantes para el mantenimiento de los servicios de la planilla
const servicioServicio = document.getElementById("servicio");
const servicioFecha = document.getElementById("fechaservicio");
const servicioDescripcion = document.getElementById("descripcionservicio");
const servicioValor = document.getElementById("valorservicio");
// ----------------------------------------------------------------
let planillas = [];
let servicios = [];
let multasdesc = [];
let implementos = [];
let editingStatus = false;
let editingServiciosStatus = false;
let editingImplementoStatus = false;
let editPlanillaId = "";
// Al momento contemplamos que las planillas se generen de manera automatica mensualmente
// planillaForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const newMedidor = {
//     codigo: medidorCodigo.value,
//     fechaInstalacion: medidorInstalacion.value,
//     marca: medidorMarca.value,
//     barrio: medidorBarrio.value,
//     callePrincipal: medidorPrincipal.value,
//     calleSecundaria: medidorSecundaria.value,
//     numeroCasa: medidorNumeroCasa.value,
//     referencia: medidorReferencia.value,
//     observacion: medidorObservacion.value,
//     // Obtenemos el id del socio
//     inventarioId: 1,
//   };
//   if (!editingStatus) {
//     const result = await ipcRenderer.invoke("createMedidor", newMedidor);
//     console.log(result);
//   } else {
//     console.log("Editing implemento with electron");
//     const result = await ipcRenderer.invoke(
//       "updateMedidor",
//       editMedidorId,
//       newMedidor
//     );
//     editingStatus = false;
//     editMedidorId = "";
//     console.log(result);
//   }
//   getPlanillas();
//   planillaForm.reset();
//   medidorCodigo.focus();
// });

// Renderizamos las planillas en la tabla
function renderPlanillas(datosPlanillas) {
  planillasList.innerHTML = "";
  datosPlanillas.forEach((datosPlanilla) => {
    planillasList.innerHTML += `
       <tr>
       <td>${datosPlanilla.codigoPlanillas}</td>
       <td>${datosPlanilla.codigoMedidores}</td>
       <td>${formatearFecha(datosPlanilla.fecha)}</td>
       <td>${datosPlanilla.valor}</td>
       <td>${datosPlanilla.estadoEdicion}</td>
       <td>${datosPlanilla.estado}</td>
       <td>${datosPlanilla.lecturaAnterior}</td>
       <td>${datosPlanilla.lecturaActual}</td>     
      <td>
      <button onclick="editPlanilla('${datosPlanilla.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editPlanilla = async (planillaId) => {
  const datosPlanilla = await ipcRenderer.invoke(
    "getDatosPlanillaById",
    planillaId
  );
  console.log("resuesta: ", datosPlanilla);
  planillaFechaUp.value = formatearFecha(datosPlanilla[0].fecha);
  socioCedulaUp.value = datosPlanilla[0].cedula;
  socioNombresUp.value =
    datosPlanilla[0].nombre + " " + datosPlanilla[0].apellido;
  planillaEstadoUp.value = datosPlanilla[0].estado;
  planillaEdicionUp.value = datosPlanilla[0].estadoEdicion;
  medidorCodigoUp.value = datosPlanilla[0].codigoMedidores;
  medidorUbicacionUp.value = datosPlanilla[0].ubicacion;
  console.log("btn1");
  seccion1.classList.remove("active");
  seccion2.classList.add("active");
  editingStatus = true;
  editPlanillaId = datosPlanilla[0].id;
  console.log(datosPlanilla[0].id);
  getServiciosByPlanillaId(editPlanillaId);
  getMultasDescByPlanillaId(editPlanillaId);
};
// Funcion que carga los servicios de acuerdo al id de la planilla
const getServiciosByPlanillaId = async (planillaId) => {
  servicios = await ipcRenderer.invoke("getServiciosByPlanillaId", planillaId);
  console.log("Respuesta a servicios: ", servicios);
  renderServicios(servicios);
};
function renderServicios(servicios) {
  serviciosList.innerHTML = "";
  servicios.forEach((servicio) => {
    serviciosList.innerHTML += `
       <tr>
       <td>${formatearFecha(servicio.fecha)}</td>
       <td>${servicio.servicio}</td>
       <td>${servicio.descripcion}</td>
       <td>${servicio.valor}</td>   
      <td>
      <button onclick="editPlanilla('${servicio.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
      <td>
      <button onclick="deletePlanilla('${servicio.id}')" class="btn ">
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
// Funcion que carga multas y descuentos de acuerdo al id de la planilla
const getMultasDescByPlanillaId = async (planillaId) => {
  multasdesc = await ipcRenderer.invoke(
    "getMultasDescByPlanillaId",
    planillaId
  );
  console.log("Respuesta a multas y descuentos: ", multasdesc);
  renderMultasDesc(multasdesc);
};
function renderMultasDesc(servicios) {
  multasdescList.innerHTML = "";
  multasdesc.forEach((multadesc) => {
    multasdescList.innerHTML += `
       <tr>
       <td>${formatearFecha(multadesc.fecha)}</td>
       <td>${multadesc.tipo}</td>
       <td>${multadesc.motivo}</td>
       <td>${multadesc.valor}</td>   
      <td>
      <button onclick="editPlanilla('${multadesc.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
      <td>
      <button onclick="deletePlanilla('${multadesc.id}')" class="btn ">
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
// Funcion que abre el formulario para el mantenimiento de los servicios
function mostrarFormServicios() {
  if (editingStatus == true) {
    console.log("MostrarFormServicios");
    const dialog = document.getElementById("formServicios");
    dialog.showModal();
    inFormGetServiciosByPlanillaId(editPlanillaId);
  }
}
// Funcion que carga los servicios de acuerdo al id de la planilla
const inFormGetServiciosByPlanillaId = async (planillaId) => {
  servicios = await ipcRenderer.invoke("getServiciosByPlanillaId", planillaId);
  console.log("Respuesta a servicios: ", servicios);
  inFormRenderServicios(servicios);
};
function inFormRenderServicios(servicios) {
  inFormServiciosList.innerHTML = "";
  servicios.forEach((servicio) => {
    inFormServiciosList.innerHTML += `
       <tr>
       <td>${formatearFecha(servicio.fecha)}</td>
       <td>${servicio.servicio}</td>
       <td>${servicio.descripcion}</td>
       <td>${servicio.valor}</td>   
      <td>
      <button onclick="editPlanilla('${servicio.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
      <td>
      <button onclick="deletePlanilla('${servicio.id}')" class="btn ">
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
// Funcion que crea un nuevo servicio asignandolo a una planilla mediante su id
servicioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editPlanillaId == "") {
    const newServicio = {
      servicio: servicioServicio.value,
      fecha: servicioFecha.value,
      descripcion: servicioDescripcion.value,
      valor: servicioValor.value,
      planillaId: editPlanillaId,
    };
    if (!editingServiciosStatus) {
      const result = await ipcRenderer.invoke("createServicio", newServicio);
      console.log("Muestro resultado de insertar servicio: ", result);
    } else {
      console.log("Editing servicio with electron");
      const result = await ipcRenderer.invoke(
        "updateServicio",
        editServicioId,
        newServicio
      );
      editingServiciosStatus = false;
      editServicioId = "";
      console.log(result);
    }
    getServiciosByPlanillaId(editPlanillaId);
    inFormGetServiciosByPlanillaId(editPlanillaId);
    servicioForm.reset();
    servicioServicio.focus();
  }
});
// Funcion que registra implementos asignandolo a un servicio mediante su id
implementoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editPlanillaId == "") {
    const newImplemento = {
      servicio: servicioServicio.value,
      fecha: servicioFecha.value,
      descripcion: servicioDescripcion.value,
      valor: servicioValor.value,
      planillaId: editPlanillaId,
    };
    if (!editingServiciosStatus) {
      const result = await ipcRenderer.invoke("createServicio", newServicio);
      console.log("Muestro resultado de insertar servicio: ", result);
    } else {
      console.log("Editing servicio with electron");
      const result = await ipcRenderer.invoke(
        "updateServicio",
        editServicioId,
        newServicio
      );
      editingServiciosStatus = false;
      editServicioId = "";
      console.log(result);
    }
    getServiciosByPlanillaId(editPlanillaId);
    inFormGetServiciosByPlanillaId(editPlanillaId);
    servicioForm.reset();
    servicioServicio.focus();
  }
});
//const deleteMedidor = async (id) => {
// const response = confirm("Estas seguro de eliminar este medidor?");
// if (response) {
//   console.log("id from medidores.js");
//   const result = await ipcRenderer.invoke("deleteMedidor", id);
//   console.log("Resultado medidores.js", result);
//   getPlanillas();
// }
//};
const getPlanillas = async () => {
  planillas = await ipcRenderer.invoke("getDatosPlanillas");
  console.log(planillas);
  renderPlanillas(planillas);
};
const getPlanillasByCodigo = async () => {
  // var select = document.getElementById("provincia");
  // select.addEventListener("change", function () {
  // var edicionPlanillaselected = this.options[planillaEdicion.selectedIndex].value;
  // console.log(
  //   edicionPlanillaselected
  // );
  // });
  var estadoEdicion = planillaEdicion.value;
  var fechaPlanilla = planillaFecha.value;
  var estadoPlanilla = planillaEstado.value;
  var codigoMedidor = medidorCodigo.value;
  planillas = await ipcRenderer.invoke(
    "getDatosPlanillasByCodigo",
    codigoMedidor,
    fechaPlanilla,
    estadoPlanilla,
    estadoEdicion
  );

  try {
    console.log(planillas);
    renderPlanillas(planillas);
    socioNombre.value = planillas[0].nombre;
    socioApellido.value = planillas[0].apellido;
    medidorUbicacion.value = planillas[0].ubicacion;
    socioCedula.value = planillas[0].cedula;
  } catch (error) {}
};
async function init() {
  await getPlanillas();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
// Generar Planillas
async function generarPlanillas() {
  const result = await ipcRenderer.invoke("createPlanillas");
  console.log(result);
  getPlanillas();
}
// Transicion entre las secciones de la vista
var btnSeccion1 = document.getElementById("btnSeccion1");
var btnSeccion2 = document.getElementById("btnSeccion2");
var seccion1 = document.getElementById("seccion1");
var seccion2 = document.getElementById("seccion2");

btnSeccion1.addEventListener("click", function () {
  console.log("btn1");
  seccion1.classList.remove("active");
  seccion2.classList.add("active");
});

btnSeccion2.addEventListener("click", function () {
  console.log("btn2");
  seccion2.classList.remove("active");
  seccion1.classList.add("active");
});
// funciones del navbar
const abrirInicio = async () => {
  const url = "src/ui/principal.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirSocios = async () => {
  const url = "src/ui/socios.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirUsuarios = async () => {
  const url = "src/ui/usuarios.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirPagos = async () => {
  const url = "src/ui/planillas.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirPlanillas = async () => {
  const url = "src/ui/planillas-cuotas.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirParametros = async () => {
  const url = "src/ui/parametros.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirImplementos = async () => {
  const url = "src/ui/implementos.html";
  await ipcRenderer.send("abrirInterface", url);
};
function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}
const abrirContratos = async () => {
  const url = "src/ui/medidores.html";
  await ipcRenderer.send("abrirInterface", url);
};
// Se futuriza que se precargen todas las planillas lbremente de los criterios de busqueda
//init();
