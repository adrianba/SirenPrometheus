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
