require('dotenv').config();

const constants = require("./constants");

const jwt = require('jsonwebtoken');
const express = require('express');

//Using http
let http = null;
if (process.env.HTTPS == "false") {
  http = require("http");
}

//Using https
let https = null;
let fs = null;
let options = null;

if (process.env.HTTPS == "true") {
  https = require('https');
  fs = require('fs');
  options = {
    key: fs.readFileSync('.cert/certificate.key'),
    cert: fs.readFileSync('.cert/certificate.crt')
  };
}

const socketIo = require("socket.io");
const cors = require('cors');
const axios = require('axios')

const app = express();
const port = process.env.PORT || 4000;

// enable CORS
app.use(cors());

// parse application/json
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// pathing to parkings images
app.use(express.static('data/img'));

// database conection
const db = require("./models");
const { fdatasync } = require('fs');

// For explotation. Database is not dropped.
db.sequelize.sync();

// Development only. Drops and re-sync db everytime the server starts.
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.

var userId = 0;  /* userId -- Necessary */
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  // .env should contain a line like JWT_SECRET=V3RY#1MP0RT@NT$3CR3T#
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      userId = req.user.id; /* Getting the userId -- Necessary*/
      req.token = token; //AQUÍ
      next();
    }
  });
});

app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", process.env.BLUECITY_CLIENT);
  res.header("Access-Control-Allow-Origin", '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  return next();
});

app.get("/api/hello", (req, res) => {
  return res.send({ response: "I am alive" }).status(200);
});

if (process.env.USING_WEBSOCKETS == "false") {
  /* Renting        -- RENTING, PULLING OUT -- */
  app.post("/open_renting_box_confirmed/:parking_id/:box_id", (req, res) => {
    console.log("open_renting_box_confirmed in backend")

    const data = { boxId: parseInt(req.params.box_id) };

    Box.update({ state: constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        io.sockets.emit('refresh-box-state', data);
      } else {
        //
      }
    }).catch(err => {
      //
    });
    return res.send({ response: "open-box sent" }).status(200);
  });

  app.post("/renting_charger_unplugged/:parking_id/:box_id/:charger_state", (req, res) => {
    const data = { boxId: parseInt(req.params.box_id) };

    Box.update({ state: constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED, occupied: false }, {
      where: { id: data.boxId }                                                                         //false, se saca el patinete
    }).then(num => {
      if (num == 1) {
        console.log('charger unplugged received from box backend')
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
  });

  app.post("/renting_box_closed/:parking_id/:box_id/:charger_state", (req, res) => {
    const data = { boxId: parseInt(req.params.box_id) };
    const dateOfReservation = new Date();
    Box.update({ state: constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED, lastReservationDate: dateOfReservation, userId: null }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        console.log("box_closed received from box backend");
        io.sockets.emit('refresh-box-state', data);
      } else {
        //
      }
    }).catch(err => {
      //
    });

    // userId = global variable.
    Scooter.update({ userId: userId }, {
      where: { boxId: data.boxId }
    }).then(num => {
      if (num == 1) {
        console.log("Scooter actualizado");
      } else {
        console.log("Something wrong");
      }
    }).catch(err => {
      console.log("Something went wrong " + err.message)
    });

    return res.send({ response: "renting-out-box-closed received" }).status(200);
  });

  /* Renting         -- RENTING, PULLING IN -- */
  app.post("/open_box_confirmed/:parking_id/:box_id", (req, res) => {
    console.log("open_box_confirmed in backend")

    const data = { boxId: parseInt(req.params.box_id) };

    Box.update({ state: constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        io.sockets.emit('refresh-box-state', data);
      } else {
        //
      }
    }).catch(err => {
      //
    });

    return res.send({ response: "open-box sent" }).status(200);
  });

  app.post("/charger_connected/:parking_id/:box_id", (req, res) => {

    const data = { boxId: parseInt(req.params.box_id) };

    Box.update({ state: constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED, occupied: true }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        console.log("charger_connected received from box backend");
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      console.log("Something is broken guys ...")
    });

    return res.send({ response: "charger-connected received" }).status(200);
  });

  app.post("/box_closed/:parking_id/:box_id/:charger_state", (req, res) => {
    const data = { boxId: parseInt(req.params.box_id) };

    Box.update({ state: constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED, userId: null, occupied: true }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        console.log("box_closed received from box backend");
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });

    /* El usuario habrá escogido otro box para aparcar, no necesariamente el mismo */
    Scooter.update({ userId: null, boxId: data.boxId }, {
      where: { userId: userId }
    }).then(num => {
      if (num == 1) {
        console.log("Scooter actualizado");
      } else {
        console.log("Scooter no actualizado")
      }
    }).catch(err => {
      console.log("Something went wrong " + err.message)
    });

    return res.send({ response: "box-closed received" }).status(200);
  });

  /* Parking         -- PARKING, PULLING IN -- */
  app.post("/open_box_parking_in_confirmed/:parking_id/:box_id", (req, res) => {
    console.log("box opened for parking-in process")
    const dateOfReservation = new Date();
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED, lastReservationDate: dateOfReservation }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        // refresh information in mobile phones
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
    return res.send({ response: "open-box-parking-in sent" }).status(200);
  });

  app.post("/charger_connected_parking_in/:parking_id/:box_id/:charger_state", (req, res) => {
    console.log("charger_connected_parking_in in backend")
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED, occupied: true, userId: userId }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        // refresh information in mobile phones
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
    return res.send({ response: "charger_plugged_in sent" }).status(200);
  });

  app.post("/box_closed_parking_in/:parking_id/:box_id/:charger_state", (req, res) => {
    console.log("box_closed_parking_in in backend")
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED, userId: userId }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        // refresh information in mobile phones
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
    return res.send({ response: "charger_plugged_in sent" }).status(200);
  });

  /* Parking         -- PARKING, PULLING OUT -- */
  app.post("/open_box_parking_out_confirmed/:parking_id/:box_id", (req, res) => {
    console.log("box opened for parking-out process")
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        io.sockets.emit('refresh-box-state', data);
      } else {
        //
      }
    }).catch(err => {
      console.log("Error: " + err.message)
    });
    return res.send({ response: "open-box-parking-in sent" }).status(200);
  });

  app.post("/charger_unplugged_parking_out/:parking_id/:box_id/:charger_state", (req, res) => {
    console.log("charger_unplugged_parking_out in backend")
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        // refresh information in mobile phones
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
    return res.send({ response: "charger_unplugged sent" }).status(200);
  });

  app.post("/box_closed_parking_out/:parking_id/:box_id/:charger_state", (req, res) => {
    console.log("box_closed_parking_out in backend")
    const data = { boxId: parseInt(req.params.box_id) };
    Box.update({ state: constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED, occupied: false, userId: null }, {
      where: { id: data.boxId }
    }).then(num => {
      if (num == 1) {
        // refresh information in mobile phones
        io.sockets.emit('refresh-box-state', data);
      } else {
        // Cannot update Box with id. Maybe Box was not found
      }
    }).catch(err => {
      // Error updating Box. It should be controlled in the future.
    });
    return res.send({ response: "box closed parking out sent" }).status(200);
  });
}

require("./routes/user.routes")(app);
require("./routes/parking.routes")(app);
require("./routes/box.routes")(app);
require("./routes/scooter.routes")(app);

//Using http
let server = null;
if (process.env.HTTPS == "false") {
  server = http.createServer(app);
}

//Using https
if (process.env.HTTPS == "true") {
  server = https.createServer(options, app);
}

const Box = db.box;
const Scooter = db.scooter;

const io = socketIo(server, {
  cors: {
    // origin: process.env.BLUECITY_CLIENT,
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
});


io.on("connect", (socket) => {

  if (process.env.USING_WEBSOCKETS == "true") {
  console.log("New client connected - USING_WEBSOCKET= TRUE");

  socket.emit("welcome", { connection_confirmed: true });

  
    socket.on("open-box-parking-in", (data) => {
      // to box device
      io.sockets.emit('open-box', { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: true });

      //setting TIMEOUT for INTRODUCING the Scooter, If not complete ==> Set BOX FREE
      setTimeout(function () {
        Box.findByPk(data.id)
          .then((data) => {
            if (data.dataValues.state === constants.PARKING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ||
              data.dataValues.state === constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state === constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED
            ) {
              Box.update({
                state: constants.NEITHER_PARKING_NOT_RENTING,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                userId: null
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-free-box'\n");
                  io.sockets.emit("force-free-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false, forceState: true });

                  // refresh information in mobile phones
                  //              io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });
            }
          })
          .catch((err) => {
            // Error
          });

      }, constants.TIMEOUT_FORCE_BOX_FREE);
    });






    socket.on("open-box-parking-out", (data) => {
      // to box device
      io.sockets.emit('open-box', { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false });

      //setting TIMEOUT for EXTRACT the Scooter, If not complete ==> Set BOX FREE or OCCUPIED
      setTimeout(function () {
        Box.findByPk(data.id)
          .then((data) => {
            if (data.dataValues.state === constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state === constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED
            ) {
              Box.update({
                state: constants.NEITHER_PARKING_NOT_RENTING,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                userId: null,
                occupied: 0
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-free-box'\n");
                  io.sockets.emit("force-free-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false, forceState: true });

                  // refresh information in mobile phones
                  io.sockets.emit('refresh-box-state', { boxId: data.id, resetFromServer: true });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });

            } else if (data.dataValues.state === constants.PARKING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT
            ) {
              Box.update({
                state: constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED,
        //        lastReservationDate: constants.BEGIN_OF_TIMES,
                //       userId: null,
                occupied: 1
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-occupied-box'\n");
                  io.sockets.emit("force-occupied-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: true, forceState: true });

                  // refresh information in mobile phones
                  io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });
            }
          })
          .catch((err) => {
            // Error
          });

      }, constants.TIMEOUT_FORCE_BOX_OCCUPIED);
    });






    socket.on("open-box-renting-in", (data) => {
      // to box device
      io.sockets.emit('open-box', { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: true });
      //setting TIMEOUT for INTRODUCING the Scooter, If not complete ==> Set BOX FREE
      setTimeout(function () {
        Box.findByPk(data.id)
          .then((data) => {
            if (data.dataValues.state === constants.RENTING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ||
              data.dataValues.state === constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state === constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED
            ) {
              Box.update({
                state: constants.NEITHER_PARKING_NOT_RENTING,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                userId: null
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-free-box'\n");
                  io.sockets.emit("force-free-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false, forceState: true });

                  // refresh information in mobile phones
                  //              io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });
            }
          })
          .catch((err) => {
            // Error
          });

      }, constants.TIMEOUT_FORCE_BOX_FREE);
    });



    socket.on("open-box-renting-out", (data) => {
      // to box device
      io.sockets.emit('open-box', { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false });

      //setting TIMEOUT for EXTRACT the Scooter, If not complete ==> Set BOX FREE or OCCUPIED
      setTimeout(function () {
        Box.findByPk(data.id)
          .then((data) => {
            if (data.dataValues.state === constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state === constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED
            ) {
              Box.update({
                state: constants.NEITHER_PARKING_NOT_RENTING,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                userId: null,
                occupied: 0
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-free-box'\n");
                  io.sockets.emit("force-free-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: false, forceState: true });

                  // refresh information in mobile phones
                  io.sockets.emit('refresh-box-state', { boxId: data.id, resetFromServer: true });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });

            } else if (data.dataValues.state === constants.RENTING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT
            ) {
              Box.update({
                state: constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                //       userId: null,
                occupied: 1
              }, {
                where: { id: data.dataValues.id }
              }).then(num => {
                if (num == 1) {
                  // Send force-free-box to Raspberry
                  console.log("\nTIMEOUT occurred ==> SEND to Raspberry 'force-occupied-box'\n");
                  io.sockets.emit("force-occupied-box", { boxId: data.id, parkingId: data.parkingId, scooterPullingIn: true, forceState: true });

                  // refresh information in mobile phones
                  io.sockets.emit('refresh-box-state', { boxId: data.id });
                } else {
                  // Cannot update Box with id. Maybe Box was not found
                }
              }).catch(err => {
                // Error updating Box. It should be controlled in the future.
              });
            }
          })
          .catch((err) => {
            // Error
          });

      }, constants.TIMEOUT_FORCE_BOX_OCCUPIED);
    });

    // socket.on("reserve-box", (data) => {
    //   // to box device
    //   io.sockets.emit('reserve-box', { boxId: data.id, parkingId: data.parkingId });
    // });

    // socket.on("unreserve-box", (data) => {
    //   // to box device
    //   io.sockets.emit('unreserve-box', { boxId: data.id, parkingId: data.parkingId });
    // });

  }

  if (process.env.USING_WEBSOCKETS == "false") {
    console.log("New client connected - USING_WEBSOCKET= FALSE");
    /* Renting pulling scooter in     -- RENTING, PULLING IN -- */
    socket.on("open-box-renting-in", (data) => {
      console.log("open-box-renting-in")

      let parking_url = "http://localhost:9000";

      axios.post(`${parking_url}/open_box_renting_in/${data.id}`)
        .then(res => {
          console.log("open-box sent from backend to box backend");
          socket.emit("box-opened", { connection_confirmed: true });
        })
        .catch(error => {
          console.error(error)
        });
    });

    /* Renting pulling scooter out     -- RENTING, PULLING OUT -- */
    socket.on("open-box-renting-out", (data) => {
      console.log("open-renting-box-ahorita-wey")

      let parking_url = "http://localhost:9000";

      axios.post(`${parking_url}/open_box_renting_out/${data.id}`)
        .then(res => {
          console.log("open-renting-box sent from backend to box backend");
        })
        .catch(error => {
          console.error(error)
        });
    });

    /* Parking pulling scooter in     -- PARKING, PULLING IN -- */
    socket.on("open-box-parking-in", (data) => {
      console.log("open--box-parking-in")

      let parking_url = "http://localhost:9000";

      axios.post(`${parking_url}/open_box_parking_in/${data.id}`)
        .then(res => {
          console.log("open-box-parking-in sent from backend to box backend");
        })
        .catch(error => {
          console.error(error)
        });
    });

    /* Parking pulling scooter out     -- PARKING, PULLING OUT -- */
    socket.on("open-box-parking-out", (data) => {
      console.log("open-box-parking-out")

      let parking_url = "http://localhost:9000";

      axios.post(`${parking_url}/open_box_parking_out/${data.id}`)
        .then(res => {
          console.log("open-box-parking-out sent from backend to box backend");
        })
        .catch(error => {
          console.error(error)
        });
    });

  }

  if (process.env.USING_WEBSOCKETS == "true") {

    socket.on("open-box-confirmed", (data) => {
      // from Box
      Box.findByPk(data.boxId)
        .then((data) => {
          if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ||
            data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ||
            data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ||
            data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT) {
            Box.update({ state: data.dataValues.state + 1 }, {
              where: { id: data.dataValues.id }
            }).then(num => {
              if (num == 1) {
                // refresh information in mobile phones
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id });
              } else {
                // Cannot update Box with id. Maybe Box was not found
              }
            }).catch(err => {
              // Error updating Box. It should be controlled in the future.
            });
          }
        })
        .catch((err) => {
          // Error
        });
    });

    socket.on("charger-plugged-in", (data) => {
      // From Box
      console.log("charger-plugged-in");
      Box.findByPk(data.boxId)
        .then((data) => {
          console.log("charger-plugged-in inside");
          // console.log(data);
          if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED) {
            let newState = null;
            if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
              newState = data.dataValues.state + 1;
            }
            if (data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ||
              data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED) {
              newState = data.dataValues.state - 1;
            }
            Box.update({ state: newState }, {
              where: { id: data.dataValues.id }
            }).then(num => {
              if (num == 1) {
                console.log("charger-plugged-in updated")
                // refresh information in mobile phones
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id });
              } else {
                // Cannot update Box with id. Maybe Box was not found
              }
            }).catch(err => {
              // Error updating Box. It should be controlled in the future.
            });
          }
        })
        .catch((err) => {
          // Error
        });
    });

    socket.on("charger-unplugged", (data) => {
      // From Box

      console.log("charger-unplugged");
      Box.findByPk(data.boxId)
        .then((data) => {
          if (data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED) {
            let newState = null;
            if (data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ||
              data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
              newState = data.dataValues.state + 1;
            }
            if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED ||
              data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED) {
              newState = data.dataValues.state - 1;
            }
            Box.update({ state: newState }, {
              where: { id: data.dataValues.id }
            }).then(num => {
              if (num == 1) {
                // refresh information in mobile phones
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id });
              } else {
                // Cannot update Box with id. Maybe Box was not found
              }
            }).catch(err => {
              // Error updating Box. It should be controlled in the future.
            });
          }
        })
        .catch((err) => {
          // Error
        });
    });

    socket.on("box-closed", (data) => {
      // From Box
      console.log("box-closed")
      Box.findByPk(data.boxId)
        .then((data) => {
          console.log("box-closed inside")
          console.log(data);

          if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
            //The door was closed before introducing the scooter
            io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, doorClosedBeforeDetectorFires: true });

            //reset parking after 5 seconds
            setTimeout(function () {
              Box.update({
                state: constants.NEITHER_PARKING_NOT_RENTING,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                occupied: false,
                userId: null
              }, {
                where: { id: data.dataValues.id }
              }).then((res) => {
                //reset done
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
              }).catch((error) => console.log(error));
            }, 5000);

            return;
          }

          if (data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
            //The door was closed before pulling out the scooter
            io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, doorClosedBeforeDetectorFires: true });

            //reset parking after 5 seconds
            setTimeout(function () {
              Box.update({
                state: constants.PARKING_MODE_INTRODUCING_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED
              }, {
                where: { id: data.dataValues.id }
              }).then((res) => {
                //reset done
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
              }).catch((error) => console.log(error));
            }, 5000);

            return;
          }

          if (data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
            //The door was closed before pulling out the scooter
            io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, doorClosedBeforeDetectorFires: true });

            //reset parking after 5 seconds
            setTimeout(function () {
              Box.update({
                userId: null,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                state: constants.NEITHER_PARKING_NOT_RENTING,
                occupied: true
              }, {
                where: { id: data.dataValues.id }
              }).then(boxData => {
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
              }).catch(error => {
                console.log("error");
              })
            }, 5000);

            return;
          }

          if (data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED) {
            //The door was closed before introducing the scooter
            io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, doorClosedBeforeDetectorFires: true });

            //reset parking after 5 seconds
            setTimeout(function () {
              Box.update({
                userId: null,
                lastReservationDate: constants.BEGIN_OF_TIMES,
                state: constants.NEITHER_PARKING_NOT_RENTING,
                occupied: false
              }, {
                where: { id: data.dataValues.id }
              }).then(boxData => {
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
              }).catch(error => {
                console.log("error");
              })
            }, 5000);

            return;
          }

          if (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ||
            data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED) {
            //If it enters here it is the normal case
            Box.update({
              state: data.dataValues.state + 1, occupied: true,
              lastReservationDate:
                (data.dataValues.state == constants.PARKING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED ||
                  data.dataValues.state == constants.RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED) ?
                  new Date() : constants.BEGIN_OF_TIMES
            }, {
              where: { id: data.dataValues.id }
            }).then(num => {
              if (num == 1) {
                // refresh information in mobile phones
                io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id });

                //Just in case User doesn't click on continue button in mobile phone we do it here too
                if (data.dataValues.state == constants.PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED) {
                  //reset parking after 5 seconds
                  setTimeout(function () {
                    Box.update({
                      state: 0,
                      lastReservationDate: constants.BEGIN_OF_TIMES,
                      occupied: false,
                      userId: null
                    }, {
                      where: { id: data.dataValues.id }
                    }).then((res) => {
                      //reset done
                      io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
                    }).catch((error) => console.log(error));
                  }, 5000);
                  return;
                }

                if (data.dataValues.state == constants.RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED) {
                  //reset parking and Scooter after 5 seconds
                  setTimeout(function () {
                    Scooter.update({
                      userId: null,
                      lastReservationDate: constants.BEGIN_OF_TIMES,
                      boxId: data.dataValues.id
                    }, {
                      where: { userId: data.dataValues.userId }
                    }).then(scooterData => {
                      Box.update({
                        userId: null,
                        lastReservationDate: constants.BEGIN_OF_TIMES,
                        state: constants.NEITHER_PARKING_NOT_RENTING,
                        occupied: true
                      }, {
                        where: { id: data.dataValues.id }
                      }).then(boxData => {
                        io.sockets.emit('refresh-box-state', { boxId: data.dataValues.id, resetFromServer: true });
                      }).catch(error => {
                        console.log("error");
                      })
                    }).catch(error => {
                      console.log("error");
                    })
                  }, 5000);
                  return;
                }
              } else {
                // Cannot update Box with id. Maybe Box was not found
              }
            }).catch(err => {
              // Error updating Box. It should be controlled in the future.
            });
          }
        })
        .catch((err) => {
          // Error
        });
    });
  }
  socket.on("something-changed", (data) => {
    console.log("something changed: " + data.toString());

    if (data.reservation != null && data.reservation == true) {
      console.log("reserve-box sent")
      io.sockets.emit('reserve-box', { boxId: data.box_id, parkingId: data.parking_changed });
    }

    if (data.reservation != null && data.reservation == false) {
      console.log("unreserve-box sent")
      io.sockets.emit('unreserve-box', { boxId: data.box_id, parkingId: data.parking_changed, scooterPullingIn: false });
    }

    io.sockets.emit('refresh', data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

});

server.listen(port, () => {
  console.log('Server started on: ' + port);
});
