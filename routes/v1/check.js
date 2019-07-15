'use strict'

let R

const health = (req, res) => {
  console.log("Inside the get method body ......",req.body);
  console.log("Inside the get method query ......",req.query);
  console.log("Inside the get method headers ......",req.headers);

    res.send({
        code: 200,
        message: "OK"
    })
}


module.exports.health = {
    conf: {
      handler: health
    },
    method: 'GET'
  }

const post_health = (req, res) => {
  console.log("Inside the get method body ......",req.body);
  console.log("Inside the get method query ......",req.query);
  console.log("Inside the get method headers ......",req.headers);

    res.send({
        code: 200,
        message: "OK"
    })
}


module.exports.post_health = {
    conf: {
      handler: post_health
    },
    method: 'POST'
  }

  module.exports.init = function(runtime) {
    R = runtime
  }