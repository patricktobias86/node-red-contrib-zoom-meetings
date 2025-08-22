module.exports = function(RED) {
  const axios = require('axios');

  function ZoomConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.baseUrl = n.baseUrl || 'https://api.zoom.us/v2';
    this.apiToken = this.credentials && this.credentials.apiToken;
  }
  RED.nodes.registerType('zoom-config', ZoomConfigNode, {
    credentials: { apiToken: { type: 'password' } }
  });

  function fillPath(template, params) {
    return template.replace(/:([a-zA-Z0-9_]+)/g, (_, k) => {
      if (params && params[k] != null) return encodeURIComponent(String(params[k]));
      throw new Error(`Missing required path param: ${k}`);
    });
  }

  const OPERATIONS = new Map([
    ['post /meetings/:meetingId/open_apps', { method: 'post', path: '/meetings/:meetingId/open_apps' }],
    ['post /meetings/:meetingId/registrants', { method: 'post', path: '/meetings/:meetingId/registrants' }],
    ['post /users/:userId/meetings', { method: 'post', path: '/users/:userId/meetings' }],
    ['post /meetings/:meetingId/polls', { method: 'post', path: '/meetings/:meetingId/polls' }],
    ['post /users/:userId/meeting_templates', { method: 'post', path: '/users/:userId/meeting_templates' }],
    ['post /meetings/:meetingId/invite_links', { method: 'post', path: '/meetings/:meetingId/invite_links' }],

    ['delete /live_meetings/:meetingId/chat/messages/:messageId', { method: 'delete', path: '/live_meetings/:meetingId/chat/messages/:messageId' }],
    ['delete /meetings/:meetingId', { method: 'delete', path: '/meetings/:meetingId' }],
    ['delete /meetings/:meetingId/open_apps', { method: 'delete', path: '/meetings/:meetingId/open_apps' }],
    ['delete /meetings/:meetingId/meeting_summary', { method: 'delete', path: '/meetings/:meetingId/meeting_summary' }],
    ['delete /meetings/:meetingId/polls/:pollId', { method: 'delete', path: '/meetings/:meetingId/polls/:pollId' }],
    ['delete /meetings/:meetingId/registrants/:registrantId', { method: 'delete', path: '/meetings/:meetingId/registrants/:registrantId' }],
    ['delete /meetings/:meetingId/survey', { method: 'delete', path: '/meetings/:meetingId/survey' }],

    ['get /meetings/:meetingId', { method: 'get', path: '/meetings/:meetingId' }],
    ['get /meetings/:meetingId/meeting_summary', { method: 'get', path: '/meetings/:meetingId/meeting_summary' }],
    ['get /meetings/:meetingId/polls/:pollId', { method: 'get', path: '/meetings/:meetingId/polls/:pollId' }],
    ['get /meetings/:meetingId/registrants/:registrantId', { method: 'get', path: '/meetings/:meetingId/registrants/:registrantId' }],
    ['post /meetings/:meetingId/sip_dialing', { method: 'post', path: '/meetings/:meetingId/sip_dialing' }],
    ['get /meetings/:meetingId/survey', { method: 'get', path: '/meetings/:meetingId/survey' }],
    ['get /meetings/:meetingId/jointoken/local_archiving', { method: 'get', path: '/meetings/:meetingId/jointoken/local_archiving' }],
    ['get /meetings/:meetingId/jointoken/live_streaming', { method: 'get', path: '/meetings/:meetingId/jointoken/live_streaming' }],
    ['get /meetings/:meetingId/jointoken/local_recording', { method: 'get', path: '/meetings/:meetingId/jointoken/local_recording' }],
    ['get /meetings/:meetingId/livestream', { method: 'get', path: '/meetings/:meetingId/livestream' }],
    ['get /meetings/:meetingId/invitation', { method: 'get', path: '/meetings/:meetingId/invitation' }],
    ['get /meetings/:meetingId/token', { method: 'get', path: '/meetings/:meetingId/token' }],
    ['get /past_meetings/:meetingId', { method: 'get', path: '/past_meetings/:meetingId' }],
    ['get /past_meetings/:meetingId/participants', { method: 'get', path: '/past_meetings/:meetingId/participants' }],
    ['get /meetings/meeting_summaries', { method: 'get', path: '/meetings/meeting_summaries' }],
    ['get /meetings/:meetingId/polls', { method: 'get', path: '/meetings/:meetingId/polls' }],
    ['get /meetings/:meetingId/registrants', { method: 'get', path: '/meetings/:meetingId/registrants' }],
    ['get /users/:userId/meeting_templates', { method: 'get', path: '/users/:userId/meeting_templates' }],
    ['get /users/:userId/meetings', { method: 'get', path: '/users/:userId/meetings' }],
    ['get /past_meetings/:meetingId/instances', { method: 'get', path: '/past_meetings/:meetingId/instances' }],
    ['get /past_meetings/:meetingId/polls', { method: 'get', path: '/past_meetings/:meetingId/polls' }],
    ['get /past_meetings/:meetingId/qa', { method: 'get', path: '/past_meetings/:meetingId/qa' }],
    ['get /meetings/:meetingId/registrants/questions', { method: 'get', path: '/meetings/:meetingId/registrants/questions' }],
    ['get /users/:userId/upcoming_meetings', { method: 'get', path: '/users/:userId/upcoming_meetings' }],
    ['post /meetings/:meetingId/batch_polls', { method: 'post', path: '/meetings/:meetingId/batch_polls' }],
    ['post /meetings/:meetingId/batch_registrants', { method: 'post', path: '/meetings/:meetingId/batch_registrants' }],
    ['patch /live_meetings/:meetingId/chat/messages/:messageId', { method: 'patch', path: '/live_meetings/:meetingId/chat/messages/:messageId' }],
    ['patch /meetings/:meetingId/livestream', { method: 'patch', path: '/meetings/:meetingId/livestream' }],
    ['patch /meetings/:meetingId', { method: 'patch', path: '/meetings/:meetingId' }],
    ['put /meetings/:meetingId/polls/:pollId', { method: 'put', path: '/meetings/:meetingId/polls/:pollId' }],
    ['patch /meetings/:meetingId/survey', { method: 'patch', path: '/meetings/:meetingId/survey' }],
    ['patch /meetings/:meetingId/livestream/status', { method: 'patch', path: '/meetings/:meetingId/livestream/status' }],
    ['put /meetings/:meetingId/status', { method: 'put', path: '/meetings/:meetingId/status' }],
    ['patch /live_meetings/:meetingId/rtms_app/status', { method: 'patch', path: '/live_meetings/:meetingId/rtms_app/status' }],
    ['put /meetings/:meetingId/registrants/status', { method: 'put', path: '/meetings/:meetingId/registrants/status' }],
    ['patch /meetings/:meetingId/registrants/questions', { method: 'patch', path: '/meetings/:meetingId/registrants/questions' }],
    ['patch /live_meetings/:meetingId/events', { method: 'patch', path: '/live_meetings/:meetingId/events' }]
  ]);

  function ZoomMeetingsNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.name = config.name;
    node.operation = config.operation || 'get /meetings/:meetingId';
    node.meetingId = config.meetingId;
    node.userId = config.userId;
    node.pollId = config.pollId;
    node.registrantId = config.registrantId;
    node.messageId = config.messageId;
    node.sendRawBody = !!config.sendRawBody;

    node.zoom = RED.nodes.getNode(config.zoom);
    if (!node.zoom) {
      node.status({ fill: 'red', shape: 'ring', text: 'missing config' });
      node.error('Zoom config is required');
      return;
    }

    const http = axios.create({
      baseURL: node.zoom.baseUrl || 'https://api.zoom.us/v2',
      timeout: 30000
    });

    node.on('input', async (msg, send, done) => {
      const opKey = (msg.operation || node.operation || '').toLowerCase();
      const op = OPERATIONS.get(opKey);
      if (!op) {
        const err = new Error(`Unsupported operation: ${msg.operation || node.operation}`);
        node.status({ fill: 'red', shape: 'ring', text: 'unsupported op' });
        if (done) return done(err);
        node.error(err, msg);
        return;
      }

      const params = Object.assign({}, msg.params || {});
      if (params.meetingId == null && node.meetingId) params.meetingId = node.meetingId;
      if (params.userId == null && node.userId) params.userId = node.userId;
      if (params.pollId == null && node.pollId) params.pollId = node.pollId;
      if (params.registrantId == null && node.registrantId) params.registrantId = node.registrantId;
      if (params.messageId == null && node.messageId) params.messageId = node.messageId;

      let urlPath;
      try {
        urlPath = fillPath(op.path, params);
      } catch (e) {
        node.status({ fill: 'red', shape: 'ring', text: e.message });
        if (done) return done(e);
        node.error(e, msg);
        return;
      }

      const query = Object.assign({}, msg.query || {});

      const headers = Object.assign({}, msg.headers || {}, {
        'Authorization': `Bearer ${node.zoom.apiToken || ''}`,
        'Accept': 'application/json'
      });
      if (['post', 'patch', 'put'].includes(op.method)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }

      const request = {
        method: op.method,
        url: urlPath,
        headers,
        params: query,
        validateStatus: () => true
      };

      if (['post', 'patch', 'put'].includes(op.method)) {
        request.data = msg.body || {};
      }

      node.status({ fill: 'blue', shape: 'dot', text: `${op.method.toUpperCase()} ${urlPath}` });

      let res;
      try {
        res = await http(request);
      } catch (networkErr) {
        node.status({ fill: 'red', shape: 'dot', text: 'network error' });
        msg.error = networkErr.message;
        if (done) done(networkErr);
        else node.error(networkErr, msg);
        return;
      }

      const out = {
        _msgid: msg._msgid,
        request: { method: op.method.toUpperCase(), url: `${http.defaults.baseURL}${urlPath}` },
        statusCode: res.status,
        headers: res.headers,
        payload: res.data
      };

      if (res.status >= 200 && res.status < 300) {
        node.status({ fill: 'green', shape: 'dot', text: `${res.status}` });
        send(out);
        if (done) done();
      } else {
        node.status({ fill: 'yellow', shape: 'ring', text: `HTTP ${res.status}` });
        out.error = res.data && res.data.message ? res.data.message : `HTTP ${res.status}`;
        send(out);
        if (done) done();
      }
    });
  }

  RED.nodes.registerType('zoom-meetings', ZoomMeetingsNode);
};
