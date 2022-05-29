import { Gauge, register } from "prom-client";
import got from "got";

const SYSTEMID = process.env.BOAT_SYSTEMID;
const DEVICEID = process.env.BOAT_DEVICEID;

const boatStatusUrl = `https://siren-marine-api.leverege.com/v1/interface/${SYSTEMID}/boat/${DEVICEID}`;
const boatWirelessStatusUrl = boatStatusUrl + "/wireless";

const temperature_galley = new Gauge({
  name: "temperature_galley",
  help: "Galley Temperature",
});
const temperature_fridge = new Gauge({
  name: "temperature_fridge",
  help: "Fridge Temperature",
});
const temperature_engine = new Gauge({
  name: "temperature_engine",
  help: "Fridge Temperature",
});

const battery_voltage1 = new Gauge({
  name: "battery_voltage1",
  help: "Battery 1 Voltage",
});
const battery_voltage2 = new Gauge({
  name: "battery_voltage2",
  help: "Battery 2 Voltage",
});

const is_shorepower_connected = new Gauge({
  name: "is_shorepower_connected",
  help: "Shore Power Connected",
});
const is_bilgepump_running = new Gauge({
  name: "is_bilgepump_running",
  help: "Bilge Pump Running",
});

setInterval(() => {
  setData();
}, 60000);

function round(v: number) {
  return Math.round(v * 100.0) / 100.0;
}

async function setData() {
  console.log("Loading Siren Marine data.");
  const boat: any = await got(boatStatusUrl).json();
  const vessel: any = boat.data.vessel;
  const wireless: any = await got(boatWirelessStatusUrl).json();

  temperature_galley.set(round(vessel.tempProbe1.temperature));
  temperature_fridge.set(
    round(wireless.items[0].data.internalTemperature.current)
  );
  temperature_engine.set(
    round(wireless.items[1].data.internalTemperature.current)
  );

  battery_voltage1.set(round(vessel.battery1.voltage.current));
  battery_voltage2.set(round(vessel.battery2.voltage.current));

  is_shorepower_connected.set(vessel.shorePower.isConnected ? 1 : 0);
  is_bilgepump_running.set(vessel.bilge1.state ? 1 : 0);

  console.log("Updated data.");
}

setData().then(() => {
  console.log("Set initial data.");
});

export async function boatMetrics(res: any) {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
}
