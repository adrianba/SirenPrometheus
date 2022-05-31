import timestamp from "time-stamp";

export function log(msg: string) {
  console.log(timestamp("YYYYMMDD HH:mm:ss - ") + msg);
}
