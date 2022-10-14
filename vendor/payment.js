const http = require("https");

async function registerPaymentAccount(name, email, username, password) {
  return new Promise((resolve) => {
    var postData = JSON.stringify({
      name: name,
      email: email,
      username: username,
      password: password,
    });

    var options = {
      hostname: "localhost",
      port: 3001,
      rejectUnauthorized: false,
      path: "/api/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };

    let data = "";
    let returndata = "";
    let req = http.request(options, async (res) => {
      res.setEncoding("utf8");

      res.on("data", async function (chunk) {
        data = data + chunk.toString();
      });
      res.on("end", function () {
        returndata = JSON.parse(data);
        resolve(returndata);
      });
    });
    req.on("error", (e) => {
      console.error(e);
    });

    req.write(postData);
    req.end();
  });
}

async function GetSaldo(username) {
  return new Promise((resolve) => {
    var options = {
      hostname: "localhost",
      port: 3001,
      rejectUnauthorized: false,
      path: `/api/getsaldo/${username}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    let returndata = null;
    let data = "";
    let req = http.get(options, (res) => {
      res.setEncoding("utf8");

      res.on("data", async function (chunk) {
        data = data + chunk.toString();
      });
      res.on("end", function () {
        returndata = JSON.parse(data);
        resolve(returndata);
      });
    });
    req.on("error", (e) => {
      console.error(e);
      resolve(e);
    });

    req.end();
  });
}

async function PaymentToUser(idUserFrom, userTarget, tota_price, createdAt) {
  return new Promise((resolve) => {
    var postData = JSON.stringify({
      userMe: idUserFrom,
      userTarget: userTarget,
      nominal: tota_price,
      date: createdAt,
    });

    var options = {
      hostname: "localhost",
      port: 3001,
      rejectUnauthorized: false,
      path: "/api/payment",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };
    let returndata = null;
    let data = "";
    let req = http.request(options, (res) => {
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        data = data + chunk.toString();
      });
      res.on("end", function () {
        returndata = JSON.parse(data);
        resolve(returndata);
      });
    });
    req.on("error", (e) => {
      console.error(e);
      resolve(e);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = { registerPaymentAccount, GetSaldo, PaymentToUser };
