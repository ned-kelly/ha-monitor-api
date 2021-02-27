// A lightweight API that exposes the system's current performance (such as disk, network, cpu/temperature etc)

const osu = require('node-os-utils')
const app = require("express")();
const https = require("https");
const auth = require("http-auth");
const authConnect = require("http-auth-connect")
const fs = require("fs");
let Sequence = exports.Sequence || require('sequence').Sequence, sequence = Sequence.create(), err;

const LISTEN_PORT = process.env.LISTEN_PORT || 9999;
const TLS_CRT = process.env.TLS_CRT || "";
const TLS_KEY = process.env.TLS_KEY || "";
const AUTH_REALM = process.env.AUTH_REALM || "";
const AUTH_DIGESTFILE = process.env.AUTH_DIGESTFILE || "";

// disable "powered-by" HTTP header to hide that this is an Express server
app.disable("x-powered-by");

// provide healthcheck endpoint for Docker Health Checks
app.get("/healthcheck", (req, res, next) => {
    res.json(true);
});

// spawn server via HTTPS is TLS certificate and key were provided
if (TLS_CRT !== "" && TLS_KEY !== "") {
    https.createServer({
        key: fs.readFileSync(TLS_KEY),
        cert: fs.readFileSync(TLS_CRT)
    }, app)
    .listen(LISTEN_PORT, () => {
        console.log("Server running on port " + LISTEN_PORT + " (https)");
        console.log(" > TLS certificate: '" + TLS_CRT + "'");
        console.log(" > TLS key file: '" + TLS_KEY + "'");
        if (MSG_DIGEST) {
            console.log(MSG_DIGEST);
        }
    });
}

// otherwise just listen on HTTP
else {
    app.listen(LISTEN_PORT, () => {
        console.log("Server running on port " + LISTEN_PORT);
        if (MSG_DIGEST) {
            console.log(MSG_DIGEST);
        }
    });
}

// use HTTP digest authentication if realm and digest file were provided
//  -> running 'htdigest -c auth.digest myrealm myuser' will create a digest file 'auth.digest' and add 'myuser' to it
//  -> running 'htdigest auth.digest myrealm myotheruser' will add 'myotheruser' to the digest file
if (AUTH_REALM !== "" && AUTH_DIGESTFILE !== "") {
    const digest = auth.digest({
        realm: AUTH_REALM,
        file: AUTH_DIGESTFILE
    });

    digest.on("success", (result, req) => {
        console.log(" > user authenticated: " + result.user);
    });

    digest.on("fail", (result, req) => {
	if (result.user) {
            console.log(" > user authentication failed: " + result.user);
        }
    });

    digest.on("error", (error, req) => {
        console.log(" > authentication error: " + error.code + " - " + error.message);
    });

    app.use(authConnect(digest));
    MSG_DIGEST = " > HTTP digest authentication enabled";
    MSG_DIGEST = MSG_DIGEST + "\n > HTTP digest realm: " + AUTH_REALM;
    MSG_DIGEST = MSG_DIGEST + "\n > HTTP digest file: " + AUTH_DIGESTFILE;
}

// default endpoint
app.get("/", (req, res, next) => {
    buildResources(function(responseObject) {
        res.json(responseObject);
    });
});



function buildResources(callback) {

    const cpu = osu.cpu;
    const drive = osu.drive;
    const mem = osu.mem;
    const netstat = osu.netstat;

    let resObject = {};

    sequence
        .then(function (next) {
            try {
                require('fs').readFile("/sys/class/thermal/thermal_zone0/temp", "utf8", function(err, data){
                    if(data !== undefined) {
                        let temperature = parseInt(data.replace(/\D/g,''));
                        temperature = Math.round((temperature * 0.001) * 100) / 100;
                        resObject.cpu_temperature = temperature;
                    }
                    next();
                });
            } catch (err) {
                resObject.cpu_temperature = 0;
                next();
            }
        })
        .then(function (next) {
            cpu.usage()
                .then(status => {
                    resObject.cpu_current = status;
                    next();
                })
        })
        .then(function (next) {
            cpu.free()
                .then(status => {
                    resObject.cpu_free = status;
                    next();
                })
        })
        .then(function (next) {
            let info = cpu.average()
            resObject.cpu_average = info;
            next();
        })
        .then(function (next) {
            drive.info()
                .then(status => {
                    resObject.drive = status;
                    next();
                })
        })
        .then(function (next) {
            mem.info()
                .then(status => {
                    resObject.memory = status;
                    next();
                })
        })
        .then(function (next) {
            netstat.stats()
                .then(status => {

                    let networkKeys = {}, itemsProcessed = 0;

                    Object.keys(status).forEach(function(key) {
                        let val = status[key];
                        networkKeys[val.interface] = val;

                        itemsProcessed++;
                        if(itemsProcessed === status.length) {
                            resObject.network = networkKeys;
                            next();
                        }
                    });
                })
        })
        // Get the wireless network strength if we can and also push it into the network array...
        .then(function (next) {
            try {
                // /proc/net/wireless | /sys/class/wireless
                require('fs').readFile("/proc/net/wireless", "utf8", function(err, data) {
                    if(data !== undefined) {
                        let wirelessSignal = data.split("\n");

                        Object.keys(resObject.network).forEach(function(key) {
                            let val = resObject.network[key].interface;

                            for(i in wirelessSignal) {
                                let wirelessItems = wirelessSignal[i].split(/\s+/).filter(function(e){ return e === 0 || e });

                                let firstLine = wirelessItems[0];
                                if(firstLine !== undefined) {
                                    firstLine = firstLine.replace(/:/g, '');

                                    if(firstLine == val) {
                                        resObject.network[key].wireless = {
                                            qualityLink: wirelessItems[2].replace(/\./g, ""),
                                            qualityLevel: wirelessItems[3].replace(/\./g, ""),
                                            qualityNoise: wirelessItems[4],
                                            packetsNwid: wirelessItems[5],
                                            packetsCrypt: wirelessItems[6],
                                            packetsFrag: wirelessItems[7],
                                            packetsRetry: wirelessItems[8],
                                            packetsMisc: wirelessItems[9],
                                            missedBeacons: wirelessItems[10]
                                        }
                                    }
                                }
                            }
                        });
                        resObject.wifiStats = true;
                    } else {
                        resObject.wifiStats = false;
                    }
                    next();
                });
            } catch (err) {
                resObject.wifiStats = false;
                next();
            }
        })
        .then(function (next) {
            callback(resObject);
            next();
        })
}
