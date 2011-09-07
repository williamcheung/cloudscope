/**
 *
 */

var
httpAgent = require('http-agent');

var NUM_DAYS_TO_FETCH = 8;
var SERVICE_URL_PREFIX = 'http://widgets.fabulously40.com/horoscope.json?sign=';
var NO_HOROSCOPE_MSG = 'Sorry, your astrologer is having a bad day. Just a phase...';
var ASTROLOGER_BUSY_MSG = 'Sorry, your astrologer is still divining...';
var TODAYS_SCOPE = '${TODAYS_SCOPE}';

exports.buildHoroscopePage = function(sign, callback) {
    var template = '\
<html>\n\
<head>\n\
<title>${TITLE}</title>\n\
</head>\n\
<body bgcolor="white">\n\
<h3 align="center"><i>${TITLE}</i></h3>\n\
${HOROSCOPES}\n\
<h4 align="center"><a href="/">zAp</a></h1>\n\
</body>\n\
</html>';
    template = template.replace(/\${TITLE}/g, sign + "'s horoscope");

    var options = [];
    var uri = SERVICE_URL_PREFIX + sign;

    for (var i = 0; i < NUM_DAYS_TO_FETCH; i++) {
        var date = '';
        if (i > 0) {
            var pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - i);
            var pastMonth = (pastDate.getMonth() + 1).toString();
            var pastDay = pastDate.getDate().toString();
            if (pastMonth.length == 1)
                pastMonth = '0' + pastMonth;
            if (pastDay.length == 1)
                pastDay = '0' + pastDay;
            date = '&date=' + pastDate.getFullYear() + '-' + pastMonth + '-' + pastDay;
        }
        options.push({method: 'GET', uri: uri + date});
    }
    var agent = httpAgent.create('http://widgets.fabulously40.com', options);

    var horoscopes = '';
    var daysAgo = 0;
    var todaysScope, yesterdaysScope;

    agent.addListener('next', function (err, agent) {
        var response = agent.body.charAt(0) == '{' ? JSON.parse(agent.body) : null;
        var horoscope = response && response.horoscope ?
                response.horoscope.horoscope : NO_HOROSCOPE_MSG;

        var date;
        if (daysAgo == 0) {
            date = 'today';
            todaysScope = horoscope;
            horoscope = TODAYS_SCOPE;
        } else if (daysAgo == 1) {
            date = 'yesterday';
            yesterdaysScope = horoscope;
        } else
            date = daysAgo + ' days ago';

        horoscopes += '<h4 align="center">' + date + '</h4>';
        horoscopes += '<p align="center">' + horoscope + '</p>';

        daysAgo++;
        agent.next();
    });

    agent.addListener('stop', function (err, agent) {
        if (todaysScope == yesterdaysScope) {
            todaysScope = ASTROLOGER_BUSY_MSG;
        }
        horoscopes = horoscopes.replace(TODAYS_SCOPE, todaysScope);
        template = template.replace('${HOROSCOPES}', horoscopes);
        callback(template);
    });

    agent.start();
}