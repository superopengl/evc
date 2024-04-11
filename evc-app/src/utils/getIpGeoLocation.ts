import * as requestIp from 'request-ip';

export function getRequestGeoInfo(req) {
  const ip = requestIp.getClientIp(req);
  const country = req.headers['cloudfront-viewer-country'];
  const region = req.headers['cloudfront-viewer-country-region'];
  const latitude = req.headers['cloudfront-viewer-latitude'];
  const longitude = req.headers['cloudfront-viewer-longitude'];

  // console.log(`Cloudfront country: ${country} region: ${region} latitude: ${latitude} longitude: ${longitude}. ${JSON.stringify(req.headers)}`);

  return {
    ip,
    country,
    region,
    latitude,
    longitude,
  }
}

/**
 * res.headers is like 
{
    "x-forwarded-for": "159.196.113.221, 64.252.174.152",
    "x-forwarded-proto": "http",
    "x-forwarded-port": "80",
    "host": "evc-alb-362261756.us-east-1.elb.amazonaws.com",
    "x-amzn-trace-id": "Root=1-6164edb0-10e9c5b4108c18542287d75c",
    "content-length": "57",
    "user-agent": "Amazon CloudFront",
    "x-amz-cf-id": "VibmNJs8GTCW6pzuCNA6ommL8nJKZpXiWdArPmazUPMhzA9AkZ6AXg==",
    "via": "2.0 5ffea377a15bf1a86dfde6a87b4a0a36.cloudfront.net (CloudFront)",
    "accept-encoding": "gzip, deflate, br",
    "content-type": "application/json; charset=UTF-8",
    "origin": "https://easyvaluecheck.com",
    "cloudfront-viewer-country": "AU",
    "cloudfront-viewer-country-region": "NSW",
    "cloudfront-viewer-latitude": "-33.75480",
    "cloudfront-viewer-longitude": "-33.75480"
}
 */