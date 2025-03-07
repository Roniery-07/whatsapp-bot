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

let currentPoll;
const votes = [];


app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use("/", express.static(__dirname + "/"))

const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  
  // webVersion: '2.2409.2',
  // webVersionCache:  { type: "local" },
  puppeteer: { 
    headless: true,
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
  ]}
});
  
  
client.initialize()



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


  const [numberDDD, numberUser] = handleNumber(req.body.number)
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


  const [numberDDD, numberUser] = handleNumber(req.body.number)
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
        console.log("©  Enquete enviada")
    })
    .catch(err => {
        res.status(500).json({
            status: false,
            message: 'BOT Enquete não enviada',
            response: err.text
        });
    });

    console.log("©  Abrindo interface")

  }
  else if (numberDDD > 30) {
      const number = "55" + numberDDD + numberUser + "@c.us";
      
      client.sendMessage(number, poll).then(response => {
          res.status(200).json({
              status: true,
              message: 'BOT Enquete enviada',
              response: response
          });
          console.log("©  Enquete enviada")

      })
      .catch(err => {
          res.status(500).json({
              status: false,
              message: 'BOT Enquete não enviada',
              response: err.text
          });
      });

      console.log("©  Abrindo interface")
      await client.interface.openChatWindow(number)
    }
});

    


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
  if(msg.from == "553190771963@c.us"){
   
  }

})

client.on("message_create", async (msg) => {
  if(msg.fromMe && msg.pollName){
    currentPoll = await client.getMessageById(msg.id._serialized)
  }
})

client.on("vote_update", async (vote) => {
  console.log(vote.selectedOptions[0]?.name)
  await client.sendMessage(vote.parentMessage.to, "Você selecionou: " + vote.selectedOptions[0].name)
  
  if(votes.some(obj => obj["msgId"] != vote.parentMessage.id._serialized)){
    votes.push({
      "msgId": vote.parentMessage.id._serialized,
      "optionSelected": vote.selectedOptions[0].name
    })
  }

  
})


server.listen(port, () => {
    console.log("Server running at 8000")
})
