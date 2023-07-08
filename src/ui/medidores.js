const { ipcRenderer } = require("electron");
const medidorCodigo = document.getElementById("codigo");
const medidorInstalacion = document.getElementById("fechaInstalacion");
const medidorMarca = document.getElementById("marca");
const medidorBarrio = document.getElementById("barrio");
const medidorPrincipal = document.getElementById("principal");
const medidorSecundaria = document.getElementById("secundaria");
const medidorNumeroCasa = document.getElementById("numerocasa");
const medidorReferencia = document.getElementById("referencia");
const medidorObservacion = document.getElementById("observacion");

const medidoresList = document.getElementById("medidores");
let medidores = [];
let editingStatus = false;
let editMedidorId = "";
medidorForm.addEventListener("submit", async (e) => {
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
  getMedidores();
  medidorForm.reset();
  medidorCodigo.focus();
});
function renderMedidores(medidores) {
  medidoresList.innerHTML = "";
  medidores.forEach((medidor) => {
    medidoresList.innerHTML += `
       <tr>
       <td>${medidor.codigo}</td>
      <td>${"socio"}</td>
      <td>${"socioCedula"}</td>
      <td>${medidor.fechaInstalacion}</td>
      <td>${medidor.Barrio}</td>
      <td>${medidor.callePrincipal + " y " + medidor.calleSecundaria}</td>
 
      <td>
      <button onclick="deleteMedidor('${medidor.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editMedidor('${medidor.id}')" class="btn ">
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
    getMedidores();
  }
};
const getMedidores = async () => {
  medidores = await ipcRenderer.invoke("getMedidores");
  console.log(medidores);
  renderMedidores(medidores);
};
async function init() {
  $(".select2").select2({
    closeOnSelect: false,
  });
  await getMedidores();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
const abrirSocios = async () => {
  const url = "src/ui/socios.html";
  await ipcRenderer.send("abrirInterface", url);
};

function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}

$(document).ready(function () {
  $("#mySelect").select2();
});

$(document).ready(function () {
  $("#mySelect").selectpicker();

  $("#mySelect").on(
    "changed.bs.select",
    function (e, clickedIndex, isSelected, previousValue) {
      var searchText = $(this).val();
      $("#mySelect option").each(function () {
        var optionText = $(this).text();
        if (optionText.toLowerCase().includes(searchText.toLowerCase())) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
      $("#mySelect").selectpicker("refresh");
    }
  );
});
// In your Javascript (external .js resource or <script> tag)
$(document).ready(function () {
  $("#mi-select").select2();
});
init();
