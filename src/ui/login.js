const { ipcRenderer } = require("electron");
// const abrirInterface = async()=> {
//    const result=  ipcRenderer.send('abrirInterface',"src/ui/index.html");
//   }
const usuarioUsuario = document.getElementById("usuario");
const usuarioClave = document.getElementById("clave");
// Funcion de inicio de session
// ----------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = usuarioUsuario.value;
  const clave = usuarioClave.value;
  await ipcRenderer.send("validarUsuarios", {
    usuario,
    clave,
  });
  usuarioUsuario.focus();
});
// ----------------------------------------------------------------
// Funcion de recepcion de respuesta al intentar logearse
// ----------------------------------------------------------------
// En el archivo de renderizado
ipcRenderer.on("loginResponse", async (event, response) => {
  if (response.success) {
    console.log("Incio de session correcto");
    const url = "src/ui/principal.html";
    await ipcRenderer.send("abrirInterface", url);
  } else {
    if (response.message === "No existe este usuario") {
      console.log("Usuario incorrecto");
      usuarioUsuario.focus();
    } else if (response.message === "Credenciales incorrectas") {
      console.log("Contraseña incorrecta");
      usuarioClave.value = "";
    } else {
      console.log("mensaje", response.message);
      console.log("No se ha podido iniciar session");
    }
  }
});

// ipcRenderer.on("showAlert", (event, message) => {
//   alert(message);
// });
// ----------------------------------------------------------------
// Funcion para mostrar el formulario de Login
// ----------------------------------------------------------------
function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}
// ----------------------------------------------------------------
// Funcion para ocultar el formulario de Login
// ----------------------------------------------------------------
function cancelar() {
  const dialog = document.getElementById("loginDialog");
  dialog.close();
}
// ----------------------------------------------------------------
// Funcion para salir de la aplicacion
// ----------------------------------------------------------------
function salir() {
ipcRenderer.send('salir');
}
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const url = "src/ui/usuarios.html";
//   const result = ipcRenderer.send("abrirInterface", url);
// });
