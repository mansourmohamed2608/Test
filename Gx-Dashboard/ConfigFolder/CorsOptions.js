const allowedOrigins = require('./AllowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true)

        // if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        //     callback(null, true)
        // } else {
        //     callback(new Error(`${origin} Not Allowed With Cors ${allowedOrigins.indexOf(origin)}`))
        // }
    },
    optionsSuccessStatus: 200,
    credentials: true, // <= Accept credentials (cookies) sent by the client
}

module.exports = corsOptions