const { ipcRenderer } = require("electron");
const usuarioNombre = document.getElementById("nombre");
const usuarioApellido = document.getElementById("apellido");
const usuarioNacimiento = document.getElementById("nacimiento");
const usuarioCedula = document.getElementById("cedula");
const usuarioCargo = document.getElementById("cargo");
const usuarioUsuario = document.getElementById("usuario");
const usuarioClave = document.getElementById("clave");
const usuarioTelefono = document.getElementById("telefono");
const usuarioCorreo = document.getElementById("correo");

const usuariosList = document.getElementById("usuarios");
let usuarios = [];
let editingStatus = false;
let editUsuarioId = "";
usuarioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newUsuario = {
    nombre: usuarioNombre.value,
    apellido: usuarioApellido.value,
    cedula: usuarioCedula.value,
    telefono: usuarioTelefono.value,
    correo: usuarioCorreo.value,
    usuario: usuarioUsuario.value,
    clave: usuarioClave.value,
    cargo: usuarioCargo.value,
    fechaNacimiento: usuarioNacimiento.value,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createUsuario", newUsuario);
    console.log(result);
  } else {
    console.log("Editing usuario with electron");
    const result = await ipcRenderer.invoke(
      "updateUsuario",
      editUsuarioId,
      newUsuario
    );
    editingStatus = false;
    editUsuarioId = "";
    console.log(result);
  }
  getUsuarios();
  usuarioForm.reset();
  usuarioNombre.focus();
});
function renderUsuarios(usuarios) {
  usuariosList.innerHTML = "";
  usuarios.forEach((usuario) => {
    usuariosList.innerHTML += `
       <tr>
       <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.apellido}</td>
      <td>${usuario.cedula}</td>
      <td>${usuario.telefono}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.usuario}</td>
   
 
      <td>
      <button onclick="deleteUsuario('${usuario.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editUsuario('${usuario.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editUsuario = async (id) => {
  const usuario = await ipcRenderer.invoke("getUsuarioById", id);
  usuarioNombre.value = usuario.nombre;
  usuarioApellido.value = usuario.apellido;
  usuarioCedula.value = usuario.cedula;
  usuarioTelefono.value = usuario.telefono;
  usuarioCorreo.value = usuario.correo;
  usuarioUsuario.value = usuario.usuario;
  usuarioClave.value = usuario.clave;
  usuarioCargo.value = usuario.cargo;
  usuarioNacimiento.value = formatearFecha(usuario.fechaNacimiento);

  editingStatus = true;
  editUsuarioId = usuario.id;
  console.log(usuario);
};
const deleteUsuario = async (id) => {
  const response = confirm("Estas seguro de eliminar este usuario?");
  if (response) {
    console.log("id from usuarios.js");
    const result = await ipcRenderer.invoke("deleteUsuario", id);
    console.log("Resultado usuarios.js", result);
    getUsuarios();
  }
};
const getUsuarios = async () => {
  usuarios = await ipcRenderer.invoke("getUsuarios");
  console.log(usuarios);
  renderUsuarios(usuarios);
};
async function init() {
  await getUsuarios();
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
function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}
const abrirContratos = async () => {
  const url = "src/ui/medidores.html";
  await ipcRenderer.send("abrirInterface", url);
};
init();
