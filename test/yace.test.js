const autocannon = require('autocannon')

autocannon({
    url: 'http://localhost:3000',
    connections: 100, //default
    pipelining: 10, // default
    duration: 100 // default
}, console.log)