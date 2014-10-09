var skynet = require('skynet');

module.exports = function(config) {
  var skynetConnection = skynet.createConnection({ uuid: config.uuid, token: config.token });
  var deviceManager = require('./device-manager')({
    uuid: config.uuid,
    token: config.token,
    devicePath: config.devicePath,
    tmpPath: config.tmpPath,
    nodePath: config.nodePath
  });

  skynetConnection.on('notReady', function(data) {
    console.log('notReady', data);
    if (!config.uuid) {
      skynetConnection.register({type: 'gateway'}, function(data){
        skynetConnection.identify({uuid: data.uuid, token: data.token});
      });
    }
  });

  skynetConnection.on('ready', function(data){
    skynetConnection.whoami(data, function(data){
      deviceManager.refreshDevices(data.devices);
    });
  });

  skynetConnection.on('message', function(message){
   if( deviceManager[message.topic] ) {
     deviceManager[message.topic](message.payload);
   }
 });
};
