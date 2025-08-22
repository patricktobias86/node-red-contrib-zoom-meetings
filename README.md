# node-red-contrib-zoom-meetings

Custom Node-RED nodes for Zoom **Meetings API**.

- ✅ Config node to store `API_TOKEN`
- ✅ One “Zoom Meetings” node with dynamic dropdown for all operations
- ✅ Example JSON for POST/PATCH/PUT operations shown directly in the editor

---

## Installation

### Via local folder
```bash
# Unzip this folder, then from inside it:
npm install
# Link into Node-RED
npm link
# In your Node-RED user dir (~/.node-red)
cd ~/.node-red
npm link node-red-contrib-zoom-meetings
node-red
```

### Or copy directly
Copy the unzipped folder into `~/.node-red/node_modules/` and restart Node-RED.

---

## Nodes

### 1. Zoom API (config)
Stores your API Token and base URL.

**Fields:**
- **Name** (optional)
- **Base URL** (default: `https://api.zoom.us/v2`)
- **API Token** (Bearer token from OAuth / Server-to-Server OAuth)

### 2. Zoom Meetings (main)
A single node that supports **all Zoom Meetings API operations**. When you select an operation, required fields (like `meetingId`, `userId`, etc.) will appear. For write operations (POST/PATCH/PUT), an **Example JSON** appears that you can copy & paste into `msg.body`.

**Dynamic Inputs:**
- `msg.params` → path/query overrides
- `msg.query` → query string params
- `msg.body` → request body (for POST/PATCH/PUT)
- `msg.headers` → extra headers

**Outputs:**
- `msg.statusCode`
- `msg.headers`
- `msg.payload`
- `msg.request` (method + url)

---

## Examples (POST/PATCH/PUT)

### Create a meeting
Operation: **POST /users/{userId}/meetings**
```json
{
  "topic": "Weekly Sync",
  "type": 2,
  "start_time": "2025-08-22T10:00:00Z",
  "duration": 30,
  "timezone": "UTC",
  "settings": {
    "host_video": true,
    "participant_video": false,
    "join_before_host": true
  }
}
```

### Add registrant
Operation: **POST /meetings/{meetingId}/registrants**
```json
{
  "email": "guest@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "org": "ExampleCorp",
  "custom_questions": [
    { "title": "How did you hear about us?", "value": "Newsletter" }
  ]
}
```

### Update meeting details
Operation: **PATCH /meetings/{meetingId}**
```json
{
  "topic": "Updated Project Kickoff",
  "agenda": "Discuss roadmap and milestones",
  "settings": { "mute_upon_entry": true, "auto_recording": "cloud" }
}
```

### Update poll
Operation: **PUT /meetings/{meetingId}/polls/{pollId}**
```json
{
  "title": "Feedback Poll",
  "questions": [
    {
      "name": "How satisfied are you with today’s session?",
      "type": "single",
      "answers": ["Very satisfied", "Neutral", "Not satisfied"]
    }
  ]
}
```

### Update registrant status
Operation: **PUT /meetings/{meetingId}/registrants/status}**
```json
{
  "action": "approve",
  "registrants": [ { "id": "abcd1234" }, { "id": "efgh5678" } ]
}
```

---

## Official Documentation
- Meetings API overview: https://developers.zoom.us/docs/api/meetings/
- REST Meeting reference: https://developers.zoom.us/docs/api/rest/meeting/

---

## Auth & Tokens
Use a Zoom OAuth access token (e.g. from Server-to-Server OAuth). The node sends:
```
Authorization: Bearer <API_TOKEN>
```

---

## Notes
- Pagination: use `page_size` and `next_page_token` in `msg.query`
- Non-2xx responses are still returned with `msg.statusCode` and `msg.payload`
- Rate limits apply per app — design your flows accordingly

---

## License
MIT
