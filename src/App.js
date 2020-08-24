import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "./assets/icons";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import DetailsIcon from "@material-ui/icons/Details";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import QueueIcon from "@material-ui/icons/Queue";
import Alert from "@material-ui/lab/Alert";
import TextField from "@material-ui/core/TextField";
import Collapse from "@material-ui/core/Collapse";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import axios from "axios";

import FormDialog from "./components/dialog";

export default function App() {
  const [state, setState] = useState({
    columns: [
      { title: "Name", field: "name" },
      { title: "Serial Number", field: "serial_number", type: "string" },
      { title: "IP", field: "ipv4", type: "string" },
    ],

    columnsDevices: [
      { title: "UID", field: "uid", type: "date" },
      { title: "Vendor", field: "vendor" },
      { title: "Created", field: "created", type: "date" },
      { title: "Status", field: "status", type: "boolean" },
    ],

    actions: [
      {
        icon: () => <QueueIcon />,
        tooltip: "Add Device",
        onClick: (event, rowData) => {
          setOpenAddDevice(true);
          setGateway(rowData);
        },
      },
    ],

    actionsDevices: [
      {
        icon: () => <DeleteForeverIcon />,
        tooltip: "Delete Device",
        onClick: (event, rowData) => {
          setOpenDeleteDevice(true);
          setDevice(rowData);
        },
      },
    ],
  });
  const [gateways, setGateways] = useState([]);
  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [error, setError] = useState([]);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [gateway, setGateway] = useState(null);
  const [device, setDevice] = useState(null);
  const [openDeleteDevice, setOpenDeleteDevice] = useState(false);
  const [dataDevice, setDataDevice] = useState({
    vendor: null,
    status: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddDevice = () => {
    setOpenAddDevice(false);
  };

  const handleCloseDeleteDevice = () => {
    setOpenDeleteDevice(false);
  };

  const onChangeVendor = (e) => {
    setDataDevice({
      ...dataDevice,
      vendor: e.target.value,
    });
  };

  const onChangeStatus = (e) => {
    setDataDevice({
      ...dataDevice,
      status: e.target.checked,
    });
  };

  const handleAddDevice = () => {
    axios
      .post("http://localhost:8080/gateways/" + gateway._id, {
        vendor: dataDevice.vendor,
        status: dataDevice.status,
      })
      .then((response) => {
        const { message, device } = response.data;
        setOpenAddDevice(false);
        setOpenSuccess(true);
        setSuccessMessage(message);

        fetchData();
      })
      .catch((e) => {
        const { status, data } = e.response;
        setOpenAddDevice(false);

        if (status === 422 && data.message !== undefined) {
          setOpenError(true);
          setError([{ msg: data.message }]);

          return;
        }

        if (status === 422 && data.errors !== undefined && data.errors.length) {
          if (data.errors) {
            setOpenError(true);
            setError(data.errors);

            return;
          }

          setOpenError(true);
          setError([{ msg: "an unexpected error, please try again" }]);
        }
      });
  };

  const fetchData = async () => {
    const { data } = await axios.get("http://localhost:8080/gateways");

    setGateways(data.gateways);
  };

  const handleDeleteDevice = () => {
    axios
      .delete("http://localhost:8080/devices/" + device._id)
      .then((response) => {
        const { message } = response.data;
        setOpenDeleteDevice(false);
        setOpenSuccess(true);
        setSuccessMessage(message);

        fetchData();
      })
      .catch((e) => {
        const { status, data } = e.response;

        if (status === 422 && data.errors.length) {
          if (data.errors) {
            setOpenError(true);
            setError(data.errors);

            return;
          }

          setOpenError(true);
          setError([{ msg: "an unexpected error, please try again" }]);
        }
      });
  };

  return (
    <div className="App">
      <div style={{ maxWidth: "100%", marginTop: 20 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Collapse in={openError}>
                <Alert severity="error" onClose={() => setOpenError(false)}>
                  <ul>
                    {openError &&
                      error.map((e) => <li key={e.msg}>{e.msg}</li>)}
                  </ul>
                </Alert>
              </Collapse>

              <Collapse in={openSuccess}>
                <Alert severity="success" onClose={() => setOpenSuccess(false)}>
                  <ul>{successMessage}</ul>
                </Alert>
              </Collapse>
            </Grid>

            <Grid item xs={12}>
              <MaterialTable
                icons={tableIcons}
                columns={state.columns}
                data={gateways}
                title="Gateways"
                actions={state.actions}
                options={{
                  actionsColumnIndex: -1,
                  search: false,
                  addRowPosition: "first",
                }}
                editable={{
                  onRowAdd: (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        setOpenError(false);
                        setError([]);

                        axios
                          .post("http://localhost:8080/gateways", {
                            name: newData.name,
                            serial_number: newData.serial_number,
                            ip: newData.ipv4,
                          })
                          .then((data) => {
                            if (data && data.message !== undefined) {
                              setGateways([...gateways, newData]);
                              setOpenSuccess(true);
                              setSuccessMessage(data.message);
                              resolve();
                            }
                          })
                          .catch((e) => {
                            const { status, data } = e.response;

                            if (status === 422 && data.errors.length) {
                              if (data.errors) {
                                setOpenError(true);
                                setError(data.errors);
                              }
                              reject();
                              return;
                            }

                            if (
                              status === 500 &&
                              data.err &&
                              data.err.errors &&
                              data.err.errors.serial_number
                            ) {
                              setOpenError(true);
                              setError([
                                { msg: data.err.errors.serial_number.message },
                              ]);
                              reject();
                              return;
                            }

                            setOpenError(true);
                            setError([
                              { msg: "an unexpected error, please try again" },
                            ]);

                            reject();
                          });
                      });
                    }),
                }}
                detailPanel={[
                  {
                    tooltip: "Show Devices",
                    render: (rowData) => {
                      return (
                        <MaterialTable
                          icons={tableIcons}
                          columns={state.columnsDevices}
                          data={rowData.devices}
                          title="Devices"
                          actions={state.actionsDevices}
                          options={{
                            actionsColumnIndex: -1,
                            search: false,
                          }}
                        />
                      );
                    },
                  },
                  {
                    icon: () => <DetailsIcon />,
                    tooltip: "Show Detail",
                    render: (rowData) => {
                      return (
                        <div
                          style={{
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        >
                          <strong>Name:</strong> {rowData.name} <br />{" "}
                          <strong>Serial Number:</strong>
                          {rowData.serial_number} <br /> <strong>Ip:</strong>{" "}
                          {rowData.ipv4} <br />
                          <strong>Amount of Device:</strong>{" "}
                          {rowData.devices.length}
                        </div>
                      );
                    },
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Container>

        <FormDialog
          open={openAddDevice}
          title="Add Device"
          object={gateway}
          handleClose={handleOpenAddDevice}
          handleAdd={handleAddDevice}
          textPrimary="Add"
        >
          <Grid container>
            <Grid item xs={12}>
              <TextField
                id="vendor"
                label="Vendor"
                fullWidth="sm"
                onChange={onChangeVendor}
              />

              <FormControlLabel
                control={<Checkbox name="status" />}
                label="Status"
                onChange={onChangeStatus}
              />
            </Grid>
          </Grid>
        </FormDialog>

        <FormDialog
          open={openDeleteDevice}
          contentText={
            device &&
            `Are you sure you want to delete device with UID: ${device.uid}`
          }
          handleClose={handleCloseDeleteDevice}
          handleAdd={handleDeleteDevice}
          textPrimary="Delete"
        ></FormDialog>
      </div>
    </div>
  );
}
