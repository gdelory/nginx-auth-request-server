const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { promisify } = require('util')
const path = require('path')
const config = require('./config')
const bcrypt = require('bcrypt')

const { secretKey, users, sessionDuration = 60, port = 8079 } = config
if (!secretKey) throw new Error('secretKey not set in config, exiting')
if (!users || !Array.isArray(users) || users.length < 1) throw new Error('no user set in config, exiting')

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const ensureAuthenticated = async req => {
  const token = req.cookies['x-access-token']
  if (token) {
    try {
      await promisify(jwt.verify)(token, secretKey)
      return true
    } catch (err) {
      return false
    }
  } else {
    return false
  }
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'))
})

app.post('/login', (req, res) => {
  const { login, password } = req.body
  const u = users.find(e => e.login === login)
  if (u && bcrypt.compareSync(password, u.password)) {
    const token = jwt.sign({
      username: login
    }, secretKey, {
      expiresIn: 60 * sessionDuration
    })
    res.cookie('x-access-token', token, { path: '/' })
    res.redirect(req.query.origin)
  } else {
    res.redirect(`/login?retry=true&origin=${req.query.origin}`)
  }
})

app.get('*', async (req, res) => {
  if (await ensureAuthenticated(req, res)) {
    res.status(200).json({})
  } else {
    res.status(401).json({})
  }
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
