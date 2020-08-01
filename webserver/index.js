const server = require('express')();
const cors = require('cors');
const port = 3000;

server.use(cors());

server.get("/", (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

server.get("/json", (req, res) => {
   res.json({ message: "Hello world" });
});

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});