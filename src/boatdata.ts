const UPDATE_INTERVAL_SECONDS = 5 * 60;

import { Gauge, register } from "prom-client";
import got from "got";
import { log } from "./log.js";

const boatStatusUrl = "https://home-remix.adrianba.net/api/boatstatus";

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
  help: "Engine Temperature",
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
}, UPDATE_INTERVAL_SECONDS * 1000);

function round(v: number) {
  return Math.round(v * 100.0) / 100.0;
}

async function setData() {
  log("Loading Siren Marine data.");
  const boat: any = await got(boatStatusUrl).json();

  temperature_galley.set(round(boat.temperature));
  temperature_fridge.set(round(boat.fridgeTemp));
  temperature_engine.set(round(boat.engineTemp));
  battery_voltage1.set(round(boat.battery1));
  battery_voltage2.set(round(boat.battery2));
  is_shorepower_connected.set(boat.shorePowerConnected ? 1 : 0);
  is_bilgepump_running.set(boat.bilgePumpRunning ? 1 : 0);

  log("Updated data.");
}

setData().then(() => {
  log("Set initial data.");
});

export async function boatMetrics(res: any) {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    log("Return metrics");
  } catch (ex) {
    res.status(500).end(ex);
  }
}
