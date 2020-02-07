const functions = require("firebase-functions");
const request = require("request-promise");

const AQI_API_KEY = "{YOUR_API_KEY}";

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: "Bearer {YOUR_Bearer}"
};

exports.LineBotPush = functions
  .region("asia-east2")
  .pubsub.schedule("0 8 * * *")
  .timeZone("Asia/Bangkok")
  .onRun(context => {
    return request({
      method: `GET`,
      uri: `https://api.airvisual.com/v2/city?city=Mueang Nonthaburi&state=Nonthaburi&country=Thailand&key=${AQI_API_KEY}`,
      json: true
    })
      .then(response => {
        const city = response.data.city;
        const temp = response.data.current.weather.tp;
        const AQI = response.data.current.pollution.aqius;

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

        const message = `City: ${city}\nTemperature: ${temp}\nAQI: ${AQI}\nLevel: ${level}`;

        return request({
          method: `POST`,
          uri: `${LINE_MESSAGING_API}/broadcast`,
          headers: LINE_HEADER,
          body: JSON.stringify({
            messages: [
              {
                type: `text`,
                text: message
              }
            ]
          })
        });
      })
      .then(() => {
        return console.info(`Done`);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  });
