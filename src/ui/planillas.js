const { ipcRenderer } = require("electron");
const planillaEmision = document.getElementById("fechaEmisionPlanilla");
const planillaEstado = document.getElementById("estado");
const socioNombre = document.getElementById("nombrecompleto");
const socioCedula = document.getElementById("cedula");
const medidorCodigo = document.getElementById("codigo");
const medidorMarca = document.getElementById("marca");
const medidorBarrio = document.getElementById("barrio");
const medidorPrincipal = document.getElementById("principal");
const medidorSecundaria = document.getElementById("secundaria");
const medidorNumeroCasa = document.getElementById("numerocasa");
const medidorReferencia = document.getElementById("referencia");
const medidorObservacion = document.getElementById("observacion");

const planillasList = document.getElementById("planillas");
let planillas = [];
let editingStatus = false;
let editMedidorId = "";
planillaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newMedidor = {
    codigo: medidorCodigo.value,
    fechaInstalacion: medidorInstalacion.value,
    marca: medidorMarca.value,
    barrio: medidorBarrio.value,
    callePrincipal: medidorPrincipal.value,
    calleSecundaria: medidorSecundaria.value,
    numeroCasa: medidorNumeroCasa.value,
    referencia: medidorReferencia.value,
    observacion: medidorObservacion.value,
    // Obtenemos el id del socio
    inventarioId: 1,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createMedidor", newMedidor);
    console.log(result);
  } else {
    console.log("Editing implemento with electron");
    const result = await ipcRenderer.invoke(
      "updateMedidor",
      editMedidorId,
      newMedidor
    );
    editingStatus = false;
    editMedidorId = "";
    console.log(result);
  }
  getPlanillas();
  planillaForm.reset();
  medidorCodigo.focus();
});
function renderPlanillas(datosPlanillas) {
  planillasList.innerHTML = "";
  datosPlanillas.forEach((datosPlanilla) => {
    planillasList.innerHTML += `
       <tr>
       <td>${datosPlanilla.codigoPlanilla}</td>
       <td>${datosPlanilla.codigoMedidor}</td>
       <td>${datosPlanilla.nombre + " " + datosPlanilla.apellido}</td>
       <td>${datosPlanilla.cedula}</td>
       <td>${formatearFecha(datosPlanilla.fecha)}</td>
       <td>${datosPlanilla.valor}</td>
       <td>${datosPlanilla.estado}</td>
       <td>${datosPlanilla.lecturaAnterior}</td>
       <td>${datosPlanilla.lecturaActual}</td> 
      <td>
      <button onclick="deleteMedidor('${datosPlanilla.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editPlanilla('${datosPlanilla.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editMedidor = async (id) => {
  const medidor = await ipcRenderer.invoke("getMedidorById", id);
  medidorCodigo.value = medidor.codigo;
  medidorInstalacion.value = fechaFormateada(medidor.fechaInstalacion);
  medidorMarca.value = medidor.marca;
  medidorBarrio.value = medidor.barrio;
  medidorPrincipal.value = medidor.callePrincipal;
  medidorSecundaria.value = medidor.calleSecundaria;
  medidorNumeroCasa.value = medidor.numeroCasa;
  medidorReferencia.value = medidor.referencia;
  medidorObservacion.value = medidor.observacion;

  editingStatus = true;
  editMedidorId = medidor.id;
  console.log(medidor);
};
const deleteMedidor = async (id) => {
  const response = confirm("Estas seguro de eliminar este medidor?");
  if (response) {
    console.log("id from medidores.js");
    const result = await ipcRenderer.invoke("deleteMedidor", id);
    console.log("Resultado medidores.js", result);
    getPlanillas();
  }
};
const getPlanillas = async () => {
  planillas = await ipcRenderer.invoke("getDatosPlanillas");
  console.log(planillas);
  renderPlanillas(planillas);
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
init();
