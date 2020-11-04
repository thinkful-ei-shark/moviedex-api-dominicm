require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const movieData = require('./movies-data.json')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.send(401).json({ error: 'Unauthorized' })
    }
    next()
  })

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next){
    let response
    if (NODE_ENV === 'production'){
        response = { error:{message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

app.get('/movie', (req, res) => {
    let data = movieData
    
    if (req.query.genre){
        data = data.filter(result => {
            return result.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        })
    }
    console.log(req.query, data)
    if (req.query.country) {
        data = data.filter(result => (
            result.country.toLowerCase().includes(req.query.country.toLowerCase())
        ))
    }
    
    if (req.query.avg_vote) {
        data = data.filter(result => {
            return Number(result.avg_vote) >= Number(req.query.avg_vote)
        })
    }
    res.json(data)
})

module.exports = app