const functions = require("firebase-functions");
const request = require("request-promise");

const AQI_API_KEY = "e1752721-0dc7-4b96-9995-c66812709fec";

const LineNotify_TOKEN = "9rg1xGmbjlvZc54j6FFwiSC8abGr0oU8NP6NfqBkXvJ";

exports.Notify = functions
  .region("asia-east2")
  .pubsub.schedule("every 30 mins from 6:00 to 23:30")
  .timeZone("Asia/Bangkok")
  .onRun(context => {
    return request({
      method: "GET",
      uri: `https://api.airvisual.com/v2/city?city=Thung-Khru&state=Bangkok&country=Thailand&key=${AQI_API_KEY}`,
      json: true
    })
      .then(response => {
        var city = response.data.city;
        var temp = response.data.current.weather.tp;
        var AQI = response.data.current.pollution.aqius;
        var level = "";
        if (AQI < 50) {
          level = "Good";
        } else if (AQI < 100) {
          level = "Moderate";
        } else if (AQI < 150) {
          level = "Unhealthy for Sensitive Groups";
        } else if (AQI < 200) {
          level = "Unhealthy";
        } else if (AQI < 300) {
          level = "Very Unhealthy";
        } else {
          level = "Hazardous";
        }

        const msg = `แจ้งเตือนคุณภาพอากาศ\nบริเวณ: ${city}\nอุณหภมิ: ${temp} °C\nAQI index : ${AQI}\nlevel: ${level}\nข้อมูลจาก AirVisual`;
        if (AQI >= 150) {
          return request({
            method: "POST",
            uri: "https://notify-api.line.me/api/notify",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
              bearer: LineNotify_TOKEN //token
            },
            form: {
              message: msg //ข้อความที่จะส่ง
            }
          }).then(res => {
            console.info(`Push Notification Success`);
          });
        } else {
          return console.log(msg);
        }
      })
      .then(() => {
        return console.info(`Done`);
      })
      .catch(err => {
        return Promise.reject(err);
      });
  });
