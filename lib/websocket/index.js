// Websocket Module
// ----------------
// Handles everything to do with the websocket transport and message responders
'use strict';

var debug = require('debug')('socketstream'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    emitter = new EventEmitter2({
      wildcard: true
    });

module.exports = function(ss) {

  // Return API
  var transport = require('./transport')(ss, emitter);

  return {
    /**
     * @ngdoc service
     * @name http.index:index#listen
     * @methodOf http.index:index
     * @function
     * @description
     * Start the server listening to the port (same as Server.listen)
     */
    listen: function(port,cb) {
      ss.load();
      ss.log.info('Starting SocketStream %s in %s mode...'.green, ss.version, ss.env);
      if (Number(ss.version.split('.')[1]) % 2) {
        ss.log.info('This is an unstable version, some features will not be reliable'.yellow);
      }
      return transport.http.listen(port,function() {
        debug('started streaming server.');
        if (cb) {
          return cb();
        }
      });
    },

    transport: transport,
    unload: function() {},
    load: function(responders, eventTransport) {
      var thisTransport = transport.load();

      // Dispatch incoming events to websocket clients
      require('./event_dispatcher')(eventTransport, thisTransport, emitter);

      // Listen to incoming requests and invoke server.request
      for (var id in responders) {
        var responder = responders[id];
        emitter.on(id, responder.interfaces.websocket);
      }

      // Return active WS transport
      return thisTransport;
    }
  };
};
