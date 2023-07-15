const { BrowserWindow, Notification } = require("electron");
const Notifications = require("electron-notification-shim");
const { app, ipcMain } = require("electron");
const { getConnection, cerrarConnection } = require("./database");
const path = require("path");
const url = require("url");
const { error } = require("console");

ipcMain.on("hello", () => {
  console.log("Hello from renderer process");
});

// ----------------------------------------------------------------
ipcMain.handle("getDocumentsPath", async (event, documentsPath) => {
  //const documentsPath = app.getPath('documentos');
  console.log("ruta:", documentsPath);
  await event.sender.send("documentsPath", documentsPath);
});

// ----------------------------------------------------------------
ipcMain.on("printPDF", (event, filePath) => {
  const printWindow = new BrowserWindow({ show: true });
  printWindow.loadURL(`file://${filePath}`);
  printWindow.webContents.on("did-finish-load", () => {
    printWindow.webContents.print({ silent: true });
    //printWindow.close();

    // Enviar confirmación al proceso de renderizado
    event.sender.send(
      "printPDFComplete",
      "El PDF se ha impreso correctamente."
    );
  });
});
//Funciones de inicio de sesion
ipcMain.on("validarUsuarios", async (event, { usuario, clave }) => {
  try {
    const conn = await getConnection();
    const usuarioPeticion = await conn.query(
      "SELECT usuario FROM usuarios WHERE usuario = ?",
      usuario,
      (error, results) => {
        if (error) {
          event.reply("loginResponse", {
            success: false,
            message: "Error en la consulta a la base de datos",
          });
        } else if (results.length > 0) {
          console.log("usuario en peticion ");
          conn.query(
            "SELECT * from usuarios where usuario=? and clave=?",
            [usuario, clave],
            (error, results) => {
              if (error) {
                event.sender.send("loginResponse", {
                  success: false,
                  message: "Error en la consulta a la base de datos",
                });
                const notification = new Notification({
                  title: "No se ha podido iniciar session!",
                  body: "Ocurrio un error al consultar en la base de datos, si el problema persiste solicite soporte tecnico",
                  icon: "/path/to/icon.png",
                });

                notification.show();
              } else if (results.length > 0) {
                event.sender.send("loginResponse", {
                  success: true,
                  message: "Credenciales correctas",
                });
                const notification = new Notification({
                  title: "Credenciales correctas!",
                  body: "Bienvenido usuario: " + usuario,
                  icon: "/path/to/icon.png",
                });

                notification.show();
              } else {
                event.sender.send("loginResponse", {
                  success: false,
                  message: "Credenciales incorrectas",
                });
                // event.sender.send(
                //   "showAlert",
                //   "¡Este es un mensaje de alerta!"
                // );
                const notification = new Notification({
                  title: "Error de credenciales!",
                  body: "La contraseña es incorrecta",
                  icon: "/path/to/icon.png",
                });

                notification.show();
              }
            }
          );
        } else {
          event.sender.send("loginResponse", {
            success: false,
            message: "No existe este usuario",
          });
          const notification = new Notification({
            title: "Error de credenciales!",
            body: "No hay un usuario registrado para " + usuario,
            icon: "/path/to/icon.png",
          });

          notification.show();
        }
      }
    );
  } catch (error) {
    console.log("Error al iniciar session: ", error);
  }
  return usuarioPeticion;
});
// ----------------------------------------------------------------
// Funciones para el cierre de sesion
// ----------------------------------------------------------------
ipcMain.on("cerrarSesion", async (event) => {
  // await cerrarConnection();
  event.sender.send("sesionCerrada");
});
// ----------------------------------------------------------------
// Funcion para el cierre de la aplicacion
// ----------------------------------------------------------------
ipcMain.on("salir", async (event) => {
  app.quit();
});

// ipcMain.on("loginResponse", (event, response) => {
//   console.log("en uso login response");
//   // Envía la respuesta de inicio de sesión al proceso de renderizado
//   event.sender.send("loginResponse", response);
// });
// ----------------------------------------------------------------No funciono :(
// ipcMain.on("printPDF", (event, filePath) => {
//   console.log("llamando a la accion printPDF");
//   const printWindow = new BrowserWindow({ show: false });
//   printWindow.loadURL(`file://${filePath}`).catch(error=>console.log(error));
//   console.log(`file://${filePath}`);
//   try {
//   printWindow.webContents.on("did-finish-load", () => {
//     printWindow.webContents.print({ silent: true }, (success, errorType) => {
//       if (success) {
//         console.log("Success");
//         // Enviar confirmación al proceso de renderizado
//         event.sender.send(
//           "printPDFComplete",
//           "El PDF se ha enviado a la cola de impresión."
//         );
//       } else {
//         // Enviar error al proceso de renderizado
//         event.sender.send(
//           "printPDFComplete",
//           "Error al imprimir el PDF: " + errorType
//           );
//           console.log("Error: ", errorType);
//       }
//       console.log("Exit");
//       printWindow.close();
//     });
//   });
// } catch (error) {
//     console.log('Error: ',error);
// }
// });
// ----------------------------------------------------------------

// Al utilizar ipcMain.handle
// en lugar de ipcMain.on, estás creando una
// función que devuelve un valor y que puede
// ser invocada desde el proceso de representación
// mediante ipcRenderer.invoke.
ipcMain.handle("createProduct", async (event, product) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", product);
    product.price = parseFloat(product.price);
    const result = await conn.query("Insert into producto set ?", product);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New product saved succesfully",
    }).show();
    product.id = result.insertId;
    return product;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getProducts", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from producto order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("getProductById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from producto where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateProduct", async (event, id, product) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE producto set ? where id = ?", [
    product,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteProduct", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("Delete from producto where id = ?", id);
  console.log(result);
  return result;
});
// function hello(){
//     console.log('Hello world')
// }
let window;
function createWindow() {
  app.commandLine.appendSwitch("allow-file-access-from-files");

  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadFile("src/ui/login.html");
}
ipcMain.on("abrirInterface", (event, interfaceName) => {
  try {
    console.log("interface name desde main", interfaceName);
    window.loadFile(interfaceName);
  } catch (err) {
    console.log("Error de window" + err);
  }
});
// ----------------------------------------------------------------
// ipcMain.handle("print", () => {
//   console.log("Llego la orden de imprimir");
//   // Generar el documento para imprimir
//   // window.webContents.on("dom-ready", () => {
//   window.webContents.printToPDF({}, (error, data) => {
//     console.log("Entro la orden de imprimir");
//     if (error) throw error;

//     const filePath = path.join(app.getPath("documents"), "documento.pdf");
//     fs.writeFile(filePath, data, (err) => {
//       if (err) throw err;
//       console.log("Documento generado y guardado en: " + filePath);
//     });
//     // });
//   });
// });
// ----------------------------------------------------------------
// ipcMain.on('abrirUsuarios', () => {
//     const newWindow = new BrowserWindow({
//       width: 800,
//       height: 600,
//       webPreferences: {
//         nodeIntegration: true,
//         contextIsolation: false,
//       }
//     });

//     newWindow.loadFile('src/ui/index.html');
//   });
// Funciones de los usuarios
ipcMain.handle("getUsuarios", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from usuarios order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("createUsuario", async (event, usuario) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", usuario);
    //   product.price = parseFloat(product.price);
    const result = await conn.query("Insert into usuarios set ?", usuario);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New user saved succesfully",
    }).show();
    usuario.id = result.insertId;
    return usuario;
  } catch (error) {
    console.log(error);
  }
});

ipcMain.handle("getUsuarioById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from usuarios where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateUsuario", async (event, id, usuario) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE usuarios set ? where id = ?", [
    usuario,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteUsuario", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("DELETE from usuarios where id = ?", id);
  console.log(result);
  return result;
});

// Funciones de los socios
ipcMain.handle("getSocios", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from socios order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("createSocio", async (event, socio) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", socio);
    //   product.price = parseFloat(product.price);
    const result = await conn.query("Insert into socios set ?", socio);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New socio saved succesfully",
    }).show();
    socio.id = result.insertId;
    return socio;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getSocioById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from socios where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("getContratanteByCedula", async (event, cedula) => {
  const conn = await getConnection();
  const result = await conn.query(
    "Select * from socios where socios.cedula = ?",
    cedula
  );
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateSocio", async (event, id, socio) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE socios set ? where id = ?", [
    socio,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteSocio", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("DELETE from socios where id = ?", id);
  console.log(result);
  return result;
});
//   funciones de los Implementos

ipcMain.handle("getImplementos", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from implementos order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("createImplemento", async (event, implemento) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", implemento);
    //   product.price = parseFloat(product.price);
    const result = await conn.query(
      "Insert into implementos set ?",
      implemento
    );
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New implemento saved succesfully",
    }).show();
    implemento.id = result.insertId;
    return implemento;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getImplementoById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from implementos where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateImplemento", async (event, id, implemento) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE implementos set ? where id = ?", [
    implemento,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteImplemento", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("DELETE from implementos where id = ?", id);
  console.log(result);
  return result;
});

//   funciones de los Medidores

ipcMain.handle("getMedidores", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from medidores order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("getMedidoresDisponibles", async () => {
  const conn = await getConnection();
  const results = conn.query(
    "Select * from implementos where implementos.nombre='Medidor' and implementos.stock>0 order by id desc;"
  );
  console.log(results);
  return results;
});
ipcMain.handle("getMedidorDisponibleById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from implementos where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("createMedidor", async (event, medidor) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", medidor);
    //   product.price = parseFloat(product.price);
    const result = await conn.query("Insert into medidores set ?", medidor);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New medidor saved succesfully",
    }).show();
    medidor.id = result.insertId;
    return medidor;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getMedidorById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from medidores where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateMedidor", async (event, id, medidor) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE medidores set ? where id = ?", [
    medidor,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteMedidor", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("DELETE from medidores where id = ?", id);
  console.log(result);
  return result;
});
// Funciones de los contratos

ipcMain.handle("getDatosContratos", async () => {
  const conn = await getConnection();
  const results = conn.query(
    "select contratos.id,contratos.fecha,contratos.pagoEscrituras,contratos.pagoRecoleccionDesechos," +
      "contratos.pagoAlcanterillado,contratos.pagoAguaPotable,socios.nombre,socios.apellido,socios.cedula from contratos " +
      "join socios on  socios.id=contratos.sociosId order by contratos.id desc;"
  );
  console.log(results);
  return results;
});
ipcMain.handle("createContrato", async (event, contrato) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", contrato);
    //   product.price = parseFloat(product.price);
    const result = await conn.query("Insert into contratos set ?", contrato);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New contrato saved succesfully",
    }).show();
    contrato.id = result.insertId;
    return contrato;
  } catch (error) {
    console.log(error);
  }
});
// Funciones de las planillas
ipcMain.handle("createPlanillas", async (event) => {
  let numeroContratos = [];
  try {
    const conn = await getConnection();
    // console.log("Recibido: ", contrato);
    //   product.price = parseFloat(product.price);
    // Cuento cuantas planillas debo generar
    numeroContratos = await conn.query("select * from contratos;");
    // Recorro un ciclo de acuerdo al numero de contratos
    console.log("numeroContratos: ", numeroContratos);
    numeroContratos.forEach(async function (contrato) {
      const planillaDefecto = {
        fecha: formatearFecha(new Date()),
        valor: 2.0,
        estado: "Por Cobrar",
        lecturaAnterior: 0.0,
        lecturaActual: 0.0,
        observacion: "NA",
        estadoEdicion: "Sin editar",
        contratosId: contrato.id,
      };
      const result = await conn.query(
        "Insert into planillas set ?",
        planillaDefecto
      );
      planillaDefecto.id = result.insertId;
      const parametrosDesechos = await conn.query(
        "select * from parametros where nombreParametro='Tarifa recolección de desechos';"
      );
      const parametrosAlcantarillado = await conn.query(
        "select * from parametros where nombreParametro='Tarifa alcantarillado';"
      );
      const servicioDesechos = {
        servicio: parametrosDesechos[0].nombreParametro,
        descripcion: parametrosDesechos[0].descripcion,
        fecha: formatearFecha(new Date()),
        valor: parametrosDesechos[0].valor,
        planillaId: planillaDefecto.id,
      };
      const resultServicios1 = await conn.query(
        "Insert into servicios set ? ",
        servicioDesechos
      );
      const servicioAlcantarillado = {
        servicio: parametrosAlcantarillado[0].nombreParametro,
        descripcion: parametrosAlcantarillado[0].descripcion,
        fecha: formatearFecha(new Date()),
        valor: parametrosAlcantarillado[0].valor,
        planillaId: planillaDefecto.id,
      };
      const resultServicios2 = await conn.query(
        "Insert into servicios set ? ",
        servicioAlcantarillado
      );
      console.log(result);
    });
    new Notification({
      title: "Electrom Mysql",
      body: "New planilla genereted succesfully",
    }).show();
    contrato.id = result.insertId;
    return contrato;
  } catch (error) {
    console.log(error);
  }
});
// No estamos usando esta funcion
ipcMain.handle("getDatosPlanillas", async () => {
  const conn = await getConnection();
  const results = conn.query(
    "select planillas.id,planillas.codigo as codigoPlanilla," +
      "planillas.fecha,planillas.valor,planillas.estado,planillas.lecturaActual," +
      "planillas.lecturaAnterior,planillas.observacion," +
      "contratos.id,contratos.pagoEscrituras,contratos.pagoRecoleccionDesechos," +
      "contratos.pagoAlcanterillado,contratos.pagoAguaPotable,socios.nombre," +
      "socios.apellido,socios.cedula,medidores.codigo as codigoMedidor from " +
      "planillas join contratos on contratos.id= planillas.contratosId join " +
      "socios on socios.id= contratos.sociosId join medidores " +
      "on contratos.id=medidores.contratosId;"
  );
  console.log(results);
  return results;
});
// Funcion que carga los datos de la planilla para editarlos
ipcMain.handle("getDatosPlanillaById", async (event, planillaId) => {
  const conn = await getConnection();
  const results = conn.query(
    "select planillas.id,planillas.fecha,planillas.valor,planillas.estado," +
      "planillas.estadoEdicion,planillas.lecturaActual,planillas.lecturaAnterior," +
      "planillas.observacion,planillas.codigo as codigoPlanillas," +
      "medidores.codigo as codigoMedidores, socios.nombre, socios.apellido,socios.cedula," +
      "concat(medidores.barrio,', ',medidores.callePrincipal,' y ',medidores.calleSecundaria," +
      "', casa: ',medidores.numeroCasa,' ',medidores.referencia) as ubicacion " +
      "from planillas " +
      "join contratos on contratos.id=planillas.contratosId join medidores on " +
      "contratos.id=medidores.contratosId join socios on socios.id=contratos.sociosId " +
      "where planillas.id=" +
      planillaId +
      ";"
  );
  console.log(results);
  return results;
});
// Funcion que relaiza un filtro entre las planillas de acuerdo al codigo del medidor
ipcMain.handle(
  "getDatosPlanillasByCodigo",
  async (
    event,
    codigoMedidor,
    fechaPlanilla,
    estadoPlanilla,
    estadoEdicion
  ) => {
    try {
      const conn = await getConnection();
      conn.query("SET lc_time_names = 'es_ES';");
      const results = conn.query(
        "select planillas.id,planillas.fecha,planillas.valor,planillas.estado,planillas.estadoEdicion," +
          "planillas.lecturaActual,planillas.lecturaAnterior,planillas.observacion," +
          "planillas.codigo as codigoPlanillas," +
          "medidores.codigo as codigoMedidores,socios.cedula, socios.nombre, socios.apellido," +
          "concat(medidores.barrio,', ',medidores.callePrincipal,' y ',medidores.calleSecundaria,', casa: '," +
          "medidores.numeroCasa,' ',medidores.referencia,'-') as ubicacion " +
          "from planillas " +
          "join contratos on contratos.id=planillas.contratosId join medidores on " +
          "contratos.id=medidores.contratosId join socios on socios.id=contratos.sociosId " +
          "where medidores.codigo ='" +
          codigoMedidor +
          "' and monthname(planillas.fecha)like '%" +
          fechaPlanilla +
          "%' " +
          "and planillas.estado like'%" +
          estadoPlanilla +
          "%' and planillas.estadoEdicion like'%" +
          estadoEdicion +
          "%';"
      );
      const parametrosDesechos = await conn.query(
        "select * from parametros where nombreParametro='Tarifa recolección de desechos';"
      );
      console.log(
        "Consulta de los parametrso de desechos: ",
        parametrosDesechos
      );
      const notification = new Notification({
        title: "Exito",
        body: "Se muestran los datos del medidor",
        // icon: "/path/to/icon.png",
        // onClick: () => {
        //   // Acción a realizar al hacer clic en la notificación
        // },
      });
      notification.show();

      console.log(results);
      return results;
    } catch (error) {
      const notification = new Notification({
        title: "Error",
        body: "Es posible que el medidor proporcionado no exista",
        // icon: "/path/to/icon.png",
        // onClick: () => {
        //   // Acción a realizar al hacer clic en la notificación
        // },
      });
      notification.show();
    }
  }
);
// ----------------------------------------------------------------
// Funcion que relaiza un filtro entre las cuotas de acuerdo al codigo del medidor
ipcMain.handle("getDatosCuotasByCodigo", async (event, codigoMedidor) => {
  try {
    const conn = await getConnection();
    conn.query("SET lc_time_names = 'es_ES';");
    const results = conn.query(
      "select servicios.id,servicios.fecha,servicios.servicio,servicios.descripcion,servicios.valor," +
        "servicios.estado from servicios join extrasplanilla on servicios.Id=extrasplanilla.serviciosId " +
        "join planillas on planillas.id=extrasplanilla.planillasId join " +
        "contratos on contratos.id=planillas.contratosId join medidores " +
        "on contratos.id=medidores.contratosId where servicios.tipo='cuota'and medidores.codigo='" +
        codigoMedidor +
        "'; "
    );
    const notification = new Notification({
      title: "Exito",
      body: "Se muestran los datos del medidor",
    });
    notification.show();

    console.log(results);
    return results;
  } catch (error) {
    const notification = new Notification({
      title: "Error",
      body: "Es posible que el medidor proporcionado no exista",
    });
    notification.show();
  }
});
// ----------------------------------------------------------------
// Funcion que carga los servicios de acuerdo al id de la planilla
ipcMain.handle("getServiciosByPlanillaId", async (event, planillaId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "select planillas.codigo,servicios.id," +
      "servicios.servicio,servicios.descripcion,servicios.fecha,servicios.valor " +
      "from servicios join extrasplanilla on servicios.id=extrasplanilla.serviciosId " +
      "join planillas on planillas.id=extrasplanilla.planillasId " +
      "where servicios.tipo='servicio' and planillas.id=?;",
    planillaId
  );
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Funcion que carga las cuotas de acuerdo al id de la planilla
ipcMain.handle("getCuotasByPlanillaId", async (event, planillaId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "select planillas.codigo,servicios.id," +
      "servicios.servicio,servicios.descripcion,servicios.fecha,servicios.valor,servicios.estado " +
      "from servicios join extrasplanilla on servicios.id=extrasplanilla.serviciosId " +
      "join planillas on planillas.id=extrasplanilla.planillasId " +
      "where servicios.tipo='cuota' and planillas.id=?;",
    planillaId
  );
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Funcion que crea servicios asignandolos a una planilla
ipcMain.handle("createServicio", async (event, servicio, planillaId) => {
  try {
    const conn = await getConnection();
    console.log("Servicio Recibido: ", servicio);

    const result = await conn.query("Insert into servicios set ?", servicio);
    var idNuevoServicio = result.insertId;
    console.log(result.insertId);
    const newExtrasPlanilla = {
      serviciosId: idNuevoServicio,
      planillasId: planillaId,
      descuentosId: 3,
    };
    const result1 = await conn.query(
      "Insert into extrasplanilla set ?",
      newExtrasPlanilla
    );
    console.log(result1);
    new Notification({
      title: "Electrom Mysql",
      body: "New servicio saved succesfully",
    }).show();
    servicio.id = result.insertId;
    return servicio;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("createCuota", async (event, cuota, planillaId) => {
  try {
    const conn = await getConnection();
    console.log("Cuota recibida: ", cuota);

    const result = await conn.query("Insert into servicios set ?", cuota);
    var idNuevoServicio = result.insertId;
    console.log(result.insertId);
    const newExtrasPlanilla = {
      serviciosId: idNuevoServicio,
      planillasId: planillaId,
      descuentosId: 3,
    };
    const result1 = await conn.query(
      "Insert into extrasplanilla set ?",
      newExtrasPlanilla
    );
    console.log(result1);
    new Notification({
      title: "Electrom Mysql",
      body: "New servicio saved succesfully",
    }).show();
    servicio.id = result.insertId;
    return servicio;
  } catch (error) {
    console.log(error);
  }
});
// Funcion que carga multas y descuentos de acuerdo al id de la planilla
ipcMain.handle("getMultasDescByPlanillaId", async (event, planillaId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "select planillas.codigo,multasdescuentos.id,multasdescuentos.tipo," +
      "multasdescuentos.motivo,multasdescuentos.fecha,multasdescuentos.valor from " +
      "multasdescuentos join planillas on planillas.id=multasdescuentos.planillaId " +
      "where planillas.id=?;",
    planillaId
  );
  console.log(result);
  return result;
});
// Funcion que edita los valores permitidos de la planilla
ipcMain.handle("updatePlanilla", async (event, id, planilla) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE planillas set ? where id = ?", [
    planilla,
    id,
  ]);
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Funciones de los parametros
ipcMain.handle("createParametro", async (event, parametro) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", parametro);
    parametro.valor = parseFloat(parametro.valor);
    const result = await conn.query("Insert into parametros set ?", parametro);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New parametro saved succesfully",
    }).show();
    parametro.id = result.insertId;
    return parametro;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getParametros", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from parametros order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("getParametroById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from parametros where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateParametro", async (event, id, parametro) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE parametros set ? where id = ?", [
    parametro,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteParametro", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("Delete from parametros where id = ?", id);
  console.log(result);
  return result;
});
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
module.exports = {
  createWindow,
};
