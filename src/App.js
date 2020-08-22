import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "./assets/icons";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import DetailsIcon from '@material-ui/icons/Details';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import QueueIcon from '@material-ui/icons/Queue';

export default function App() {
  const [state, setState] = React.useState({
    columns: [
      { title: "Name", field: "name" },
      { title: "Serial Number", field: "serial_number" },
    ],

    columnsDevices: [
      { title: "UID", field: "uid", type: "date" },
      { title: "Vendor", field: "vendor" },
      { title: "Created", field: "created", type: "date" },
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
              <MaterialTable
                icons={tableIcons}
                columns={state.columns}
                data={gateways}
                title="Gateways"
                actions={state.actions}
                options={{
                  actionsColumnIndex: -1,
                  search: false,
                }}
                editable={{
                  onRowAdd: (newData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        setState((prevState) => {
                          const data = [...prevState.data];
                          data.push(newData);
                          return { ...prevState, data };
                        });
                      }, 600);
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
      </div>
    </div>
  );
}
