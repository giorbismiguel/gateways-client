import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "./assets/icons";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import DetailsIcon from "@material-ui/icons/Details";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import QueueIcon from "@material-ui/icons/Queue";
import Alert from "@material-ui/lab/Alert";
import Collapse from "@material-ui/core/Collapse";
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
        onClick: (event, rowData) => alert("You saved " + rowData.name),
      },
    ],

    actionsDevices: [
      {
        icon: () => <DeleteForeverIcon />,
        tooltip: "Delete Device",
        onClick: (event, rowData) => alert("You saved " + rowData.name),
      },
    ],
  });
  const [gateways, setGateways] = useState([]);
  const [openGateway, setOpenGateway] = useState(false);
  const [error, setError] = useState([]);
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get("http://localhost:8080/gateways");

      setGateways(data.gateways);
    }
    fetchData();
  }, []);

  return (
    <div className="App">
      <div style={{ maxWidth: "100%" }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Collapse in={openError}>
                <Alert severity="error" onClose={() => {}}>
                  <ul>
                    {openError && error.map((e) => <li key={e.id}>{e.msg}</li>)}
                  </ul>
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
                        axios
                          .post("http://localhost:8080/gateways", {
                            name: newData.name,
                            serial_number: newData.serial_number,
                            ip: newData.ipv4,
                          })
                          .then((data) => {
                            if (data && data.message !== undefined) {
                              setGateways([...gateways, newData]);

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
                            }

                            reject();
                          });
                      }, 1000);
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
                            fontSize: 20,
                            textAlign: "center",
                          }}
                        >
                          Ip: {rowData.ipv4}
                        </div>
                      );
                    },
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Container>

        <FormDialog open={openGateway}></FormDialog>
      </div>
    </div>
  );
}
