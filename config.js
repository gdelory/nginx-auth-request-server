module.exports = {
  // port of the application
  port: 8079,
  // A random secret key which will be used to sign the JSON web token
  // you can choose anything here, but make sure it's long
  // every time you change that, this will invalidate all tokens and all users will
  // have to re-login at next request
  secretKey: 'vdcx49za8qads9k9ew8gl987ds9x9zxsp9f98mvbe498k98a498sgyuy4as46d',
  sessionDuration: 60 * 24, // session in minutes
  users: [{
    login: 'jane',
    // this is obtained with the command: node ./pw-hash.js your_password
    password: '$2b$05$1INF6EH2PbBUY.jtXPjVhOf5odbB9bDHIECU0qMYYQo40VSwDLnJK'
  }]
}
