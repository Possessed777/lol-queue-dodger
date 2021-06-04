const https = require('https')
const fs = require('fs')
const path = require('path')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const data = {
	queueId: 1110
}

const deletelobby = { hostname: '127.0.0.1', path: '/lol-lobby/v2/lobby', method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
const dodge = { hostname: '127.0.0.1', path: '/lol-lobby/v2/matchmaking/quick-search', method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }

const logFile = path.join(__dirname, Math.random().toString(36).substring(2, 15) + '.txt')
const logClear = () => fs.writeFileSync(logFile, '')
const logAdd = (...stuff) => fs.appendFileSync(logFile, '\n' + stuff.join(' ') + '\n')

function readLock() {
  const lockPath = process.argv[2]
  if (!lockPath) throw new Error('missing lockfile path, use me like : \n\n node lol-queue-dodger.js "C:\\Games\\Riot Games\\League of Legends\\lockfile"')
  logAdd('Summoner lockfile located at : ' + lockPath)
  if (!/lockfile/.test(lockPath)) throw new Error('lockfile path invalid, should looks like "C:\\Games\\Riot Games\\League of Legends\\lockfile"')
  const content = fs.readFileSync(lockPath, 'utf-8').split(':') || []
  if (!content[2] || !content[3]) throw new Error('lockfile does not contains expected data or is not formatted as usual')
  dodge.port = content[2]
  dodge.headers.Authorization = `Basic ${Buffer.from(`riot:${content[3]}`).toString('base64')}`
  deletelobby.port = content[2]
  deletelobby.headers.Authorization = `Basic ${Buffer.from(`riot:${content[3]}`).toString('base64')}`
}

function doRequest() {
  if (!dodge.port) throw new Error('cannot make the request without port')
  if (!deletelobby.port) throw new Error('cannot make the request without port')
    
  const requestdel = https.request(deletelobby, responsedel => {
    logAdd(`DeleteLobby: Game api response status code : ${responsedel.statusCode}`)
    responsedel.on('end', () => logAdd(`Game lobby has been successfully deleted.`))
  })
  requestdel.on('error', error => {
    logAdd(error)
    throw error
  })
  requestdel.write('')
  requestdel.end()
  
  const request = https.request(dodge, response => {
    logAdd(`Dodge: Game api response status code : ${response.statusCode}`)
    let data = ''
    response.on('data', chunk => (data += chunk)) // eslint-disable-line no-return-assign
    response.on('end', () => logAdd(`Game has been successfully dodged.`))
  })
  request.on('error', error => {
    logAdd(error)
    throw error
  })
  request.write(JSON.stringify(data))
  request.end()
}

async function init() {
  logClear()
  logAdd('LoL Queue Dodger started @', new Date())
  readLock()
  doRequest()
}

init().catch(error => console.error(`\n${error.message}`))
