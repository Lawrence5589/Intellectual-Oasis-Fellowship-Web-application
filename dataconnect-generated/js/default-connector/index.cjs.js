const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'iof-web-app',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

