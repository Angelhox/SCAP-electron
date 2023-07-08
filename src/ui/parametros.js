const { ipcRenderer } = require("electron");
const socioNombre = document.getElementById("nombre");
const socioApellido = document.getElementById("apellido");
const socioCedula = document.getElementById("cedula");
const socioNacimiento = document.getElementById("nacimiento");
const socioFijo = document.getElementById("fijo");
const socioMovil = document.getElementById("movil");
const socioCorreo = document.getElementById("correo");
const socioDireccion = document.getElementById("direccion");
const sociosList = document.getElementById("socios");
let socios = [];
let editingStatus = false;
let editSocioId = "";
socioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newSocio = {
    nombre: socioNombre.value,
    apellido: socioApellido.value,
    cedula: socioCedula.value,
    fechaNacimiento: socioNacimiento.value,
    telefonoFijo: socioFijo.value,
    telefonoMovil: socioMovil.value,
    correo: socioCorreo.value,
    direccion: socioDireccion.value,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createSocio", newSocio);
    console.log(result);
  } else {
    console.log("Editing socio with electron");
    const result = await ipcRenderer.invoke(
      "updateSocio",
      editSocioId,
      newSocio
    );
    editingStatus = false;
    editSocioId = "";
    console.log(result);
  }
  getSocios();
  socioForm.reset();
  socioNombre.focus();
});
function renderSocios(socios) {
  sociosList.innerHTML = "";
  socios.forEach((socio) => {
    sociosList.innerHTML += `
       <tr>
       <td>${socio.id}</td>
      <td>${socio.nombre}</td>
      <td>${socio.apellido}</td>
      <td>${socio.cedula}</td>
      <td>${socio.telefonoMovil}</td>
      <td>${socio.correo}</td>
      <td>${socio.direccion}</td>
      <td>
      <button onclick="deleteSocio('${socio.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editSocio('${socio.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editSocio = async (id) => {
  const socio = await ipcRenderer.invoke("getSocioById", id);
  socioNombre.value = socio.nombre;
  socioApellido.value = socio.apellido;
  socioCedula.value = socio.cedula;
  socioNacimiento.value = formatearFecha(socio.fechaNacimiento);
  socioFijo.value = socio.telefonoFijo;
  socioMovil.value = socio.telefonoMovil;
  socioCorreo.value = socio.correo;
  socioDireccion.value = socio.direccion;

  editingStatus = true;
  editSocioId = socio.id;
  console.log(socio);
};
const deleteSocio = async (id) => {
  const response = confirm("Estas seguro de eliminar este socio?");
  if (response) {
    console.log("id from socios.js");
    const result = await ipcRenderer.invoke("deleteSocio", id);
    console.log("Resultado socios.js", result);
    getSocios();
  }
};
const getSocios = async () => {
  socios = await ipcRenderer.invoke("getSocios");
  console.log(socios);
  renderSocios(socios);
};
async function init() {
  await getSocios();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}

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
  const url = "src/ui/pagos.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirPlanillas = async () => {
  const url = "src/ui/planillas.html";
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
const abrirContratos = async () => {
  const url = "src/ui/medidores.html";
  await ipcRenderer.send("abrirInterface", url);
};
init();
