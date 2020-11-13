let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    reCAPTCHA = require("recaptcha2"),
    {TelegramClient} = require("messaging-api-telegram"),
    client = new TelegramClient({accessToken: process.env.telegram}),
    v3 = require("node-hue-api").v3,
    USERNAME = process.env.hue, LIGHT_ID = 1,
    LightState = v3.lightStates.LightState;


let recaptcha = new reCAPTCHA({
    siteKey: "6Le6O-IZAAAAALpGlqt5B0ciybJTYiljZ9a5lIeb",
    secretKey: process.env.CSecret
});


//Starting App
app.listen(2999);


//Expres : Middle Ware params For App
app.use(express.static(__dirname + "/Web/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//EndPoint for HTTP Request
app.post("/addForm", (req, res) => {
    recaptcha.validate(req.body.captcha)
        .then(() => {

            if(String(req.body.message).length > 500) {return res.send(false)}

            let message = "";
            if (req.body.anonymous) {
                message += "Anonyme\n"
            } else {
                message += "Nom : " + req.body.name + "\n";
            }

            message += "Message : " + req.body.message

            client.sendMessage("1343769851", message, {
                disableWebPagePreview: true,
                disableNotification: true,
            });
            res.send(true)


            v3.discovery.nupnpSearch()
                .then((searchResults) => {
                    const host = searchResults[0].ipaddress;
                    return v3.api.createLocal(host).connect(USERNAME);
                })
                .then((api) => {
                    const stateON = new LightState().on().hue(0).sat(254).brightness(100);
                    api.lights.getLight(LIGHT_ID)
                        .then(light => {
                            if (light.state.on) {
                                let brightness = light.state.bri;
                                let hue = light.state.hue;
                                let sat = light.state.sat;
                                api.lights.setLightState(LIGHT_ID, stateON).then(() => {
                                    setTimeout(() => {
                                        api.lights.setLightState(LIGHT_ID, new LightState().on().hue(hue).sat(sat).bri(brightness));
                                    }, 1000);
                                });
                            } else {
                                api.lights.setLightState(LIGHT_ID, stateON).then(() => {
                                    setTimeout(() => {
                                        api.lights.setLightState(LIGHT_ID, new LightState().off());
                                    }, 1000);
                                });
                            }
                        });
                })

        }).catch(() => {
        res.send(false)
    })
});

