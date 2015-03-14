var url = require('url')

var concat = require('concat-stream')
  , request = require('hyperquest')

var gifSearch = /^\!g(if)?\s*(.*?)?$/

giphy.help = '!gif <searchterm> - random gif of <searchterm>\n!gif - random gif'

module.exports = giphy

function giphy(ziggy, settings) {
  var apiKey = (settings || {}).apiKey || 'dc6zaTOxFJmzC'

  ziggy.on('message', parseMessage)

  function parseMessage(user, channel, message) {
    var searchTerms = message.match(gifSearch)
      , apiUrl

    if(!searchTerms) return
    if(!searchTerms[2]) return randomGif()

    apiUrl = url.format({
        host: 'api.giphy.com'
      , protocol: 'http'
      , pathname: '/v1/gifs/search'
      , query: {api_key: apiKey, q: searchTerms[2], limit: 100}
    })

    request.get(apiUrl).pipe(concat(selectGif))

    function randomGif() {
      apiUrl = url.format({
          host: 'api.giphy.com'
        , protocol: 'http'
        , pathname: '/v1/gifs/random'
        , query: {api_key: apiKey, limit: 100}
      })

      request.get(apiUrl).pipe(concat(selectGif))
    }

    function selectGif(data) {
      var gifUrl

      try {
        data = JSON.parse(data) || {}
      } catch(e) {
        return ziggy.say(channel, 'BZZT. Something went wrong')
      }

      if(!data.meta || data.meta.status < 200 || data.meta.status > 299) {
        return ziggy.say(channel, 'WHOOPS')
      }

      gifUrl = Array.isArray(data.data) ?
        data.data[random(data.data.length)].images.original.url :
        data.data.image_url

      ziggy.say(channel, gifUrl)
    }
  }
}

function random(x) {
  return (Math.random() * x) | 0
}
