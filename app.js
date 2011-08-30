/**
 * 
 */

var
horoscopePageBuilder = require('./horoscope-page-builder');
express = require('express');

var PORT = process.env.PORT || process.env.VCAP_APP_PORT || 80;

var SIGNS = [['capricorn'], ['aquarius'], ['pisces'], ['aries'], ['taurus'], ['gemini'], ['cancer'], ['leo'], ['virgo'], ['libra'], ['scorpio'], ['sagitarrius', 'sagittarius']];
var IMAGE_SOURCES = ['http://www.scorpio-site.co.uk', 'http://www.uselessgraphics.com'];
var IMAGE_PREFIXES = ['AG_', 'zod'];
var CENSORED = []; // [[1, 8]];

var app = express.createServer();
app.get('/', home);
for (var i = 0; i < SIGNS.length; i++) {
    app.get('/' + getSign(i, 1), horoscope);
}
app.listen(PORT);

function home(req, res) {
    var template = '\
<html>\n\
<head>\n\
<title>${TITLE}</title>\n\
</head>\n\
<body bgcolor="white" text="grey">\n\
<h3 align="center"><i>${TITLE}</i></h3>\n\
<ul align="center">\n${LINKS}</ul>\n\
<h4 align="center"><a href="/">zAp</a></h1>\n\
</body>\n\
</html>';
    template = template.replace(/\${TITLE}/g, "CLOUDscope");
    
    var links = '';
    for (var i = 0; i < SIGNS.length; i++) {
        links += '<a href="';
        links += getSign(i, 1);
        links += '"><img src="'
        links += getRandomImage(i);
        links += '" width="90" height="90" border="0" alt="';
        links += getSign(i, 1);
        links += '"/></a>\n';
    }
    template = template.replace('${LINKS}', links);

    res.send(template);
}

function horoscope(req, res) {
    var sign = req.url.replace('/', '');
    horoscopePageBuilder.buildHoroscopePage(sign, function(page) {
        res.send(page);
    });
}

function getSign(signIndex, sourceIndex) {
    var sign = SIGNS[signIndex]; 
    return sign[Math.min(sign.length-1, sourceIndex)];
}

function getRandomImage(signIndex) {
    var sourceIndex;
    do {
        sourceIndex = Math.floor(Math.random() * IMAGE_SOURCES.length);
        var censored = false;
        for (var i = 0; i < CENSORED.length; i++) {
            if (sourceIndex == CENSORED[i][0] &&
                signIndex   == CENSORED[i][1]) {
                censored = true;
                break;
            }
        }
    } while (censored);
    var imageUrl = IMAGE_SOURCES[sourceIndex] + '/' + IMAGE_PREFIXES[sourceIndex] + getSign(signIndex, sourceIndex) + '.gif';
    return imageUrl;
}
