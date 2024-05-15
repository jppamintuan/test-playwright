import { request, expect } from '@playwright/test';
import { schemeGetter } from "../../../src/utils/helper/schemesManager";
import { faker } from '@faker-js/faker';

let processorAccessToken: string;
let payrunId: string, paymentId: string;

async function getAccessToken(username: string, password: string) {
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.PROCESSOR_BASE_URL}login`, {
        headers: {
            "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    processorAccessToken = body.access_token;
}

async function accessTokenRequestContext() {
    const apiContext = await request.newContext({
        baseURL: `${process.env.PAYMENT_APPROVAL_URL}schemes/`,
        extraHTTPHeaders: {
            Authorization: `Bearer ${processorAccessToken}`,
        },
    });

    return apiContext;
}

export async function createPayrun() {
    let time = new Date();
    time.setHours(time.getHours()+24);
    let currentDatePlusOne = time.toJSON();

    await getAccessToken(schemeGetter().financePayrunCreatorUserName, schemeGetter().defaultPassWord);
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${schemeGetter().multiSchemeId}/pay-runs`, {
        data: {
            "paymentsCreatedOnAndBefore": currentDatePlusOne
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    payrunId = body.payrunId;
}

export async function getPayrun(status: string) {
    await getAccessToken(schemeGetter().financePayrunApproverUserName, schemeGetter().defaultPassWord);
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/pay-runs?statuses=${status}`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    for(let i = 0; i < body.length; i++){
        if (body[i].payrunId == payrunId)
            expect(body[i].status == status)
    }
}

export async function getPayrunSummary() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/pay-runs/payment-summary?payrun_id=${payrunId}`);

    expect(response.ok()).toBeTruthy();
}

export async function getRecipientsByPayrun(status: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/pay-runs/recipients?payrunIds=${payrunId}&statuses=${status}`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    paymentId = body.content[0].paymentIds[0];
}

export async function approvePayrun() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${schemeGetter().multiSchemeId}/pay-runs/${payrunId}/approval`, {
        data: {
            "status": "APPROVED"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.payrunId).toEqual(payrunId);
    expect(body.status).toEqual('APPROVED');
}

export async function updatePaymentStatus(status: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${schemeGetter().multiSchemeId}/payments/${paymentId}/status`, {
        data: {
            "status": status,
            "comment": faker.lorem.text(),
            "activePayrunId": payrunId
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toEqual(status);
}

export async function getPaymentFullDetails() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/payments/${paymentId}`);

    expect(response.ok()).toBeTruthy();
}

export async function getPaymentSummary() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/payments/${paymentId}/summary`);

    expect(response.ok()).toBeTruthy();
}

export async function getOutstandingPaymentSummary() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/payments/outstanding-payments-summary`);

    expect(response.ok()).toBeTruthy();
}

export async function getPaymentsWithNoPayrun() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${schemeGetter().multiSchemeId}/payments/recipients?statuses=HOLD,PENDING_APPROVAL,REJECTED`);

    expect(response.ok()).toBeTruthy();
}

