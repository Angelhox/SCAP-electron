const { BrowserWindow, Notification } = require("electron");
const { ipcMain } = require("electron");
const { getConnection } = require("./database");

ipcMain.on("hello", () => {
  console.log("Hello from renderer process");
});
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
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadFile("src/ui/principal.html");
}
ipcMain.on("abrirInterface", (event, interfaceName) => {
  console.log("interface name desde main", interfaceName);
  window.loadFile(interfaceName);
});
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
  console.log('llegamos al main');
  let numeroContratos = [];
  try {
    const conn = await getConnection();
    // console.log("Recibido: ", contrato);
    //   product.price = parseFloat(product.price);
    // Cuento cuantas planillas debo generar
    numeroContratos = await conn.query("select * from contratos;");
    // Recorro un ciclo de acuerdo al numero de contratos
    console.log('numeroContratos: ',numeroContratos);
    numeroContratos.forEach(async function (contrato){
      const planillaDefecto = {
        fecha:formatearFecha(new Date()) ,
        valor: 2.0,
        estado: "Por Cobrar",
        lecturaAnterior: 0.0,
        lecturaActual: 0.0,
        observacion: "NA",
        contratosId: contrato.id,
      };
      const result = await conn.query(
        "Insert into planillas set ?",
        planillaDefecto
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
