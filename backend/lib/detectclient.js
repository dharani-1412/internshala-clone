const useragent = require('useragent');

function detectDevice(req) {
  const agent = useragent.parse(req.headers['user-agent']);

  const browser = agent.family;
  const os = agent.os.family;
  const deviceType = /mobile/i.test(agent.device.family) ? 'mobile' : 'desktop';

  return { browser, os, deviceType };
}

module.exports = { detectDevice };
