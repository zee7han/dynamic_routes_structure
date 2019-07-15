'use strict'


const express = require('express')
const url = require('url')
const requireTree = require('require-tree')
const _ = require('lodash')


const app = express()

const port = process.env.PORT || 4488
const env = process.env.ENV || "development"

const routes = {
  GET: {},
  POST: {}
}
const restRoutes = {
  GET: {},
  POST: {}
}
requireTree('./routes', {
  each: initapis.bind({
    'include': {}
  })
})

function handler(req, res) {
  res.req = req

  let path = url.parse(req.url, true, true)
    .pathname
  req.query = url.parse(req.url, true, true)
    .query

  const method = req.method

  console.log("routes   ", routes);
  
  if (!routes[method][path]) {
    const p1 = path.split('/')
    const o = Object.keys(restRoutes[method])
    
    let matched = false
    for (let r = 0; r < o.length && matched === false; r++) {
      const rdata = restRoutes[method][o[r]]
      if (rdata.rest) {
        if (path.indexOf(o[r] + '/') === 0) {
          matched = true
          path = o[r]
          for (let i = 0; i < rdata.split.length; i++) {
            if (!req.params) {
              req.params = {}
            }
            if (rdata.split[i] !== '') {
              req.params[rdata.split[i]] = p1[rdata.skip + i]
            }
          }
        }
      }
    }
    
    
    if (!matched) {
      return res.send({
        code: 404,
        message: 'Not Found'
      }, 404)
    }
  }

  const timeout = 20000
  res.setTimeout(parseInt(timeout), ()=>{})

  handleRequest(req, res, path)
}

function handleRequest(req, res, path) {
  
  req.query = url.parse(req.url, true, true)
    .query
  req.headers.version = path.split('/')[2]

  try {
    if (req.method === 'POST') {
      let body = ''
      req.on('data', function(data) {
        body += data
      })
      req.on('end', function() {  
        let ct = req.headers['content-type'] || 'application/json'

        try {
          if (ct.indexOf('application/json') === 0) {
            req.body = JSON.parse(body)
          } else if (ct === 'application/xml') {
            parseString(body, function(err, result) {
              if (err) {
                // TODO: SEND ERROR
              } else {
                req.body = result
              }
            })
          } else {
            req.body = querystring.parse(body)
          }
          routes[req.method][path](req, res)

        } catch (e) {
          // TODO: SEND ERROR
        }
      })
    } else {
      routes[req.method][path](req, res)
    }
  } catch (e) {
    console.log('error', e.toString(), e.stack)
    return res.send({
      code: 500,
      message: 'Internal Server error',
      details: e.toString()
    }, 500)
  }
}

function initapis(functions, filename, path) {

  const apiPath = path.substring(__dirname.length, path.length - 3)
  const fun = _.without(_.keys(functions), 'init')
  if (!functions.init) {
    throw new Error(JSON.stringify({
      'filename': filename,
      'error': 'init Missing'
    }))
  }
  functions.init({})

  for (let i in fun) {
    let p = apiPath + '/' + fun[i]

    let rest = false
    let split = []
    let skip = 0

    if (functions[fun[i]].conf.addToPath) {
      if (functions[fun[i]].conf.addToPath.indexOf(':') !== -1) {
        skip = p.split('/')
          .length
        const temp = functions[fun[i]].conf.addToPath.split('/')
        for (let j = 0; j < temp.length; j++) {
          split.push(temp[j].substr(1))
        }
        rest = true
      } else {
        p += '/' + functions[fun[i]].conf.addToPath
      }
    }
    p = p.toLowerCase()

    restRoutes[functions[fun[i]].method][p] = {
      rest: rest,
      split: split,
      skip: skip
    }
    const pSplit = p.split('/')
    routes[functions[fun[i]].method][p] = functions[fun[i]].conf.handler
  }

}

app.use(handler)

app.listen(port,()=> {
    console.log(`Server started on port ${port}`);
    
})