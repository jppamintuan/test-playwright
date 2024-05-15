import { request, expect } from '@playwright/test';

type TestConfig = {
  apiEndpoint: string;
  tokenEndpoint: string;
  tokenClientId: string;
  tokenClientSecret: string;
};

function getBearerToken(clientId: string, secret: string) {
  const btoa = (str: string) => Buffer.from(str).toString('base64');
  const credentialsBase64 = btoa(`${clientId}:${secret}`);
  return credentialsBase64;
}

export async function getAuthToken(testConfig: TestConfig) {
  const authContext = await request.newContext({
    baseURL: testConfig.tokenEndpoint,
    extraHTTPHeaders: {
      Authorization: `Basic ${getBearerToken(testConfig.tokenClientId, testConfig.tokenClientSecret)}`,
    },
  });

  const signinResponse = await authContext.post(process.env.BM_OBR_TOKEN_URL, {
    form: {
      grant_type: 'client_credentials',
      scope: 'urn:opc:idm:__myscopes__'
    },
  });

  expect(signinResponse.ok()).toBeTruthy();
  const authInfo = await signinResponse.json();
  process.env.BM_OBR_TOKEN = authInfo.access_token;

  return process.env.BM_OBR_TOKEN;
}

export async function requestContext() {

  const apiContext = await request.newContext({
    baseURL: process.env.HOST,
    extraHTTPHeaders: {
      Authorization: `Bearer ${process.env.BM_OBR_TOKEN}`,
    },
  });
  return apiContext;

}

