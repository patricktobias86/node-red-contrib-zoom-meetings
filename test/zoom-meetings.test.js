const assert = require('assert');
const helper = require('node-red-node-test-helper');

const zoomNode = require('../meetings/zoom-meetings.js');

helper.init(require.resolve('node-red'));

delete process.env.http_proxy;
delete process.env.HTTP_PROXY;
delete process.env.https_proxy;
delete process.env.HTTPS_PROXY;
delete process.env.npm_config_http_proxy;
delete process.env.npm_config_https_proxy;
delete process.env.YARN_HTTP_PROXY;
delete process.env.YARN_HTTPS_PROXY;

describe('zoom meetings nodes', function() {
  this.timeout(10000);
  before(function(done) {
    helper.startServer(done);
  });

  after(function(done) {
    helper.stopServer(done);
  });

  afterEach(function() {
    helper.unload();
  });

  it('loads config node with default base URL', function(done) {
    const flow = [{ id: 'c1', type: 'zoom-config', name: '' }];
    helper.load(zoomNode, flow, { c1: { apiToken: '' } }, function() {
      const config = helper.getNode('c1');
      try {
        assert.strictEqual(config.baseUrl, 'https://api.zoom.us/v2');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('loads zoom-meetings node', function(done) {
    const flow = [
      { id: 'c1', type: 'zoom-config', name: '' },
      { id: 'n1', type: 'zoom-meetings', zoom: 'c1', wires: [] }
    ];

    helper.load(zoomNode, flow, { c1: { apiToken: '' } }, function() {
      const n1 = helper.getNode('n1');
      try {
        assert.ok(n1);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

