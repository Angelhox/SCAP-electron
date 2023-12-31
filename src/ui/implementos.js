const { ipcRenderer } = require("electron");
const implementoNombre = document.getElementById("implemento");
const implementoMarca = document.getElementById("marca");
const implementoDescripcion = document.getElementById("descripcion");
const implementoStock = document.getElementById("stock");
const implementoPrecio = document.getElementById("precio");
const implementoIva = document.getElementById("iva");

const implementosList = document.getElementById("implementos");
let implementos = [];
let editingStatus = false;
let editImplementoId = "";
implementoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newImplemento = {
    nombre: implementoNombre.value,
    marca: implementoMarca.value,
    descripcion: implementoDescripcion.value,
    stock: implementoStock.value,
    precio: implementoPrecio.value,
    iva: implementoIva.value,
    inventarioId: 1,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createImplemento", newImplemento);
    console.log(result);
  } else {
    console.log("Editing implemento with electron");
    const result = await ipcRenderer.invoke(
      "updateImplemento",
      editImplementoId,
      newImplemento
    );
    editingStatus = false;
    editImplementoId = "";
    console.log(result);
  }
  getImplementos();
  implementoForm.reset();
  implementoNombre.focus();
});
function renderImplementos(implementos) {
  implementosList.innerHTML = "";
  implementos.forEach((implemento) => {
    implementosList.innerHTML += `
       <tr>
       <td>${implemento.id}</td>
      <td>${implemento.nombre}</td>
      <td>${implemento.marca}</td>
      <td>${implemento.descripcion}</td>
      <td>${implemento.stock}</td>
      <td>${implemento.precio}</td>
      <td>${implemento.iva}</td>
 
      <td>
      <button onclick="deleteImplemento('${implemento.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editImplemento('${implemento.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editImplemento = async (id) => {
  const implemento = await ipcRenderer.invoke("getImplementoById", id);
 implementoNombre.value=implemento.nombre;
 implementoMarca.value=implemento.marca;
 implementoDescripcion.value=implemento.descripcion;
 implementoStock.value=implemento.stock;
 implementoPrecio.value=implemento.precio;
 implementoIva.value=implemento.iva;
 
  editingStatus = true;
  editImplementoId = implemento.id;
  console.log(implemento);
};
const deleteImplemento = async (id) => {
  const response = confirm("Estas seguro de eliminar este implemento?");
  if (response) {
    console.log("id from implementos.js");
    const result = await ipcRenderer.invoke("deleteImplemento", id);
    console.log("Resultado implementos.js", result);
    getImplementos();
  }
};
const getImplementos = async () => {
  implementos = await ipcRenderer.invoke("getImplementos");
  console.log(implementos);
  renderImplementos(implementos);
};
async function init() {
  await getImplementos();
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
const abrirContratos = async () => {
  const url = "src/ui/medidores.html";
  await ipcRenderer.send("abrirInterface", url);
};

init();
