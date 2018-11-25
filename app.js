const port = 3000;

var express = require('express'),
    helmet = require('helmet'),
    formidable = require('formidable'),
    fs = require('fs'),
    extractor = require('unfluff'),
    PythonShell = require('python-shell'),
    request = require('request'),
    bodyParser = require('body-parser');

var app = express(), form, link;
var firstRun = true;

const resumePdfPath = __dirname + "/data/resumePDF.pdf",
      resumeTxtPath = __dirname + "/data/resume.txt",
      descrPath = __dirname + "/data/jobDescr.txt";
var filePath, resumeJson, resumeText, resumeAuthor, descrText, jobReqs, matchJson, txt;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());
app.set("view engine", "ejs");

////////////////////////////
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/uncnn', (req, res) => {
    form = new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', (name, file) => {
        file.path = resumePdfPath;
    });
    form.on('file', (name, file) => {
        (new PythonShell('src/myResume.py')).on('message', (message) => {
            resumeJson = JSON.parse(message);
            resumeText = resumeJson['text'];
            resumeAuthor = resumeText.split('\n')[1] || resumeText.split('\n')[0] || 'YOU';
            fs.writeFile(resumeTxtPath, resumeText, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        });
    });
    form.on('end', (name, file) => res.render('main'));
});

app.post('/home', (req, res) => {
    firstRun = true;
    res.render('main');
});

////////////////////////////
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});