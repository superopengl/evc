const { exec } = require("child_process");

const symbols = `
SPY
QQQ
DIA
IWM
VOO
XLB
XLY
XLP
XLE
XLF
XLV
XLI
IYR
XLK
IYZ
XLU
IBB
XBI
VNQ
ICF
JEST
PAVE
IFRA
SOXX
SMH
GLD
SLV
USO
PRNT
`.split('\n').filter(x => !!x);

async function run(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err) => {
      if(err) return rej(err);
      res();
    })
  })
}

async function main() {
  for(const s of symbols) {

    console.log('Adding', s);

    await run(`curl 'https://easyvaluecheck.com/api/v1/stock' \
    -X 'PUT' \
    -H 'authority: easyvaluecheck.com' \
    -H 'sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"' \
    -H 'accept: application/json, text/plain, */*' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36' \
    -H 'content-type: application/json; charset=UTF-8' \
    -H 'origin: https://easyvaluecheck.com' \
    -H 'sec-fetch-site: same-origin' \
    -H 'sec-fetch-mode: cors' \
    -H 'sec-fetch-dest: empty' \
    -H 'referer: https://easyvaluecheck.com/stock' \
    -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
    -H 'cookie: G_ENABLED_IDPS=google; __stripe_mid=6744f20f-4a00-4f7c-b181-15523797a3a72d6405; CookieConsent=true; __stripe_sid=45ffb3bd-f0d3-44dd-8476-d0911846029c3029ed; jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgzZmI1ZWYzLTc1Y2UtNDUwNy04ZjUzLWNmYTM0NDMzYWVmYiIsInJvbGUiOiJhZG1pbiIsImxhc3RMb2dnZWRJbkF0IjoiMjAyMS0wNS0xNFQwMDo0NDozMi43MDNaIiwibG9naW5UeXBlIjoibG9jYWwiLCJwcm9maWxlIjp7ImlkIjoiYzU3NmNiYjctNzkzYy00MTEzLThlNzQtZTQ0ZjBlYjdkMjYxIiwiZW1haWwiOiJhZG1pbkBlYXN5dmFsdWVjaGVjay5jb20iLCJnaXZlbk5hbWUiOiJTeXN0ZW0iLCJzdXJuYW1lIjoiQWRtaW4iLCJwaG9uZSI6bnVsbCwiYWRkcmVzcyI6bnVsbCwiY291bnRyeSI6Ik5aIiwibG9jYWxlIjoiZW4tVVMiLCJnZW8iOnsiaXAiOiI1OC4xMTEuMTUyLjg3IiwiY291bnRyeSI6IkFVIiwicmVnaW9uIjoiTlNXIiwibGF0aXR1ZGUiOi0zMy43NTA5NjEzMDM3MTA5NCwibG9uZ2l0dWRlIjoxNTEuMjI2MDQzNzAxMTcxODh9fSwiZXhwaXJlcyI6IjIwMjEtMDUtMTRUMDE6MzQ6MzguMjgwWiIsImlhdCI6MTYyMDk1NDI3OH0._yaUxMkRGRsJMCC59SNLrwxyAz2Y_nHPPNOdxoECfIQ' \
    --data-raw '{"symbol":"${s}","tags":["52db3005-92f9-47d6-8e30-38b8bc8a8d6d"]}'`);
  }
}

main().then(() => {
  console.log('done')
}).catch(err => {
  console.error(err);
})