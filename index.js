const { Client, LocalAuth, MessageMedia, Poll} = require('whatsapp-web.js');
const { body, validationResult } = require('express-validator');
const qrcode = require('qrcode-terminal');
const http = require('http')
const express = require('express')

const { handleNumber } = require('./lib/index.js')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)


const idClient = 'bot-zdg';
const port = 8000

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use("/", express.static(__dirname + "/"))



// POST PARA ENVIO DE MENSAGEM
app.post('/send-message', [ body('number').notEmpty(), body('message').notEmpty()], async (req, res) => {
    const errors = validationResult(req).formatWith(({msg}) => {
        return msg;
    }
);
  
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }


    const [number, numberDDD, numberUser] = handleNumber(req.body.number)
    const message = req.body.message

  
    if (numberDDD <= 30) {
        const number = "55" + numberDDD + "9" + numberUser + "@c.us";
        client.sendMessage(number, message).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT Mensagem enviada',
                response: response
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT Mensagem não enviada',
                response: err.text
            });
        });    
    }
    else if (numberDDD > 30) {
        const number = "55" + numberDDD + numberUser + "@c.us";
        client.sendMessage(number, message).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT Mensagem enviada',
                response: response
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT Mensagem não enviada',
                response: err.text
            });
        });
    }
  });


// POST PARA ENVIO DE ENQUETES 
app.post('/send-poll', [ body('number').notEmpty(), body('options').notEmpty()], async (req, res) => {
    const errors = validationResult(req).formatWith(({msg}) => {
        return msg;
    });

    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: false,
            message: errors.mapped()
        });
    }


    const [number, numberDDD, numberUser] = handleNumber(req.body.number)
    const options = req.body.options

    const poll = new Poll("Choose an option:", options)

    if (numberDDD <= 30) {
        const number = "55" + numberDDD + "9" + numberUser + "@c.us";
        client.sendMessage(number, poll).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT Enquete enviada',
                response: response
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT Enquete não enviada',
                response: err.text
            });
        });
    }
    else if (numberDDD > 30) {
        const number = "55" + numberDDD + numberUser + "@c.us";
        
        client.sendMessage(number, poll).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT Enquete enviada',
                response: response
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT Enquete não enviada',
                response: err.text
            });
        });
    }
});




const client = new Client({
    authStrategy: new LocalAuth({ clientId: idClient }),
    // webVersion: '2.2409.2',
    // webVersionCache:  { type: "local" },
    puppeteer: { headless: true,
        // CAMINHO DO CHROME PARA WINDOWS (REMOVER O COMENTÁRIO ABAIXO)
        //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        //===================================================================================
        // CAMINHO DO CHROME PARA MAC (REMOVER O COMENTÁRIO ABAIXO)
        //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        //===================================================================================
        // CAMINHO DO CHROME PARA LINUX (REMOVER O COMENTÁRIO ABAIXO)
        //executablePath: '/usr/bin/google-chrome-stable',
        //===================================================================================
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
        ] }
    });

    
client.initialize()


client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true})
});

client.on('ready', () => {
    console.log('©  Dispositivo pronto');
});

client.on('authenticated', () => {
    console.log('©  Autenticado');
});

client.on('auth_failure', function() {
    console.error('©  Falha na autenticação');
});

client.on('change_state', state => {
    console.log('©  Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
    console.log('©  Cliente desconectado', reason);
    client.initialize();
});

client.on('message', msg => {
    console.log("ola")
})

client.on("vote_update", update => {
    console.log("update")
})


server.listen(port, () => {
    console.log("Server running at 8000")
})
