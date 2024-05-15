import { request, expect } from '@playwright/test';
import { schemeGetter } from "../../../src/utils/helper/schemesManager";
import { faker } from '@faker-js/faker';

export var vicIndividualCustomerID: string, vicGroupCustomerID: string;
export var bankId: string, delegateId: string, unapprovedBankId: string;
let auth0AccessToken: string, auth0UserEmail: string, auth0UserAccessToken: string;
let donationPartnerId: string, donationPartnerSchemeParticipantId: string;
let monolithAccessToken: string;

async function getAuth0AccessToken() {
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.AUTH0_OAUTH_TOKEN_URL}oauth/token`, {
        headers: {
            "content-type": "application/json"
        },
        data: {
            "client_id": process.env.AUTH0_AUTOMATED_TESTING_M2M_CLIENT_ID,
            "client_secret": process.env.AUTH0_AUTOMATED_TESTING_M2M_CLIENT_SECRET,
            "audience": `${process.env.AUTH0_OAUTH_TOKEN_URL}api/v2/`,
            "grant_type": "client_credentials"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    auth0AccessToken = body.access_token;
}

async function createAuth0User() {
    await getAuth0AccessToken();

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.AUTH0_OAUTH_TOKEN_URL}api/v2/users`, {
        headers: {
            Authorization: `Bearer ${auth0AccessToken}`,
        },
        data: {
            "email": `${faker.person.firstName()}${faker.word.adverb()}-playwright@cesteam.testinator.com`,
            "email_verified": true,
            "given_name": faker.person.firstName(),
            "family_name": faker.person.lastName(),
            "connection": "Username-Password-Authentication",
            "password": schemeGetter().defaultPassWord
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    auth0UserEmail = body.email;
}

async function getAuth0UserAccessToken() {
    await createAuth0User();

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.AUTH0_OAUTH_TOKEN_URL}oauth/token`, {
        form: {
            grant_type: "password",
            username: auth0UserEmail,
            password: schemeGetter().defaultPassWord,
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            connection: "Username-Password-Authentication",
            audience: "https://api.containersforchange.com/customer"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    auth0UserAccessToken = body.access_token;
}

async function accessTokenRequestContext() {
    const apiContext = await request.newContext({
        baseURL: `${process.env.PAYMENT_APPROVAL_URL}customers/`,
        extraHTTPHeaders: {
            Authorization: `Bearer ${auth0UserAccessToken}`,
        },
    });

    return apiContext;
}

export async function vicIndividualCustomerCreation() {
    await getAuth0UserAccessToken();

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.CUSTOMER_API_NODE_URL}v1/customers`, {
        headers: {
            "Authorization": `Bearer ${auth0UserAccessToken}`
        },
        data: {
            "postcode": "3123",
            "suburb": "HAWTHORN EAST, VIC",
            "first_name": faker.person.firstName(),
            "last_name": "PW",
            "email": auth0UserEmail,
            "marketing_preferences": {
                "news": true,
                "promotions": true,
                "refund_point_updates": true,
                "events": true
            },
            "position": "Staff"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    console.log(body.scheme_participant_id);
    vicIndividualCustomerID = body.id;
}

export async function createBankPaymentProfile(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const name = `${faker.person.fullName()}-PW`
    const accountNumber = faker.string.numeric({ length: 9 });
    const accountSuffix = accountNumber.substring((accountNumber.length - 4));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/payment-profiles`, {
        data: {
            "name": name,
            "default": true,
            "paymentType": "BANK",
            "bankAccount": {
                "bsb": "553037",
                "accountNumber": accountNumber
            }
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toContain(name);
    expect(body.customerId).toContain(customerId);
    expect(body.paymentType).toEqual('BANK');
    expect(body.accountNumberSuffix).toEqual(accountSuffix);
    expect(body.delegate).toBeNull();
    expect(body.approved).toEqual(true);
    bankId = body.id;
}

export async function createDelegatePaymentProfile(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const name = `${faker.person.fullName()}-PW`
    const delegateCustomerId = '08f40dc0-5a3b-4180-a37d-725c8bcc7af1';

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/payment-profiles`, {
        data: {
            "name": name,
            "default": true,
            "paymentType": "DELEGATE",
            "delegate": {
                "customerId": delegateCustomerId,
                "multiSchemeId": "100020001"
            }
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toContain(name);
    expect(body.customerId).toContain(customerId);
    expect(body.paymentType).toEqual('DELEGATE');
    expect(body.accountNumberSuffix).toEqual(delegateCustomerId);
    expect(body.delegate.customerId).toEqual(delegateCustomerId);
    expect(body.approved).toEqual(true);
    delegateId = body.id;
}

export async function verifyPaymentProfileIsCreated(customerId: string, paymentProfileId: string, paymentType: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${customerId}/schemes/100020001/payment-profiles`);
    const body = await response.json();

    if (body.length == 0) {
        var currentIndex = 0;
    }
    else {
        for (let i = 0; i < body.length; i++) {
            if (body[i].id == paymentProfileId) {
                var currentIndex = i;
            }
        }
    }

    expect(response.ok()).toBeTruthy();
    expect(body[currentIndex].id).toEqual(paymentProfileId);
    expect(body[currentIndex].paymentType).toEqual(paymentType);
}

export async function deletePaymentProfile(customerId: string, paymentProfileId: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.delete(`${customerId}/schemes/100020001/payment-profiles/${paymentProfileId}`);
    expect(response.ok()).toBeTruthy();
}

export async function verifyPaymentProfileIsDeleted(customerId: string, paymentProfileId: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`${customerId}/schemes/100020001/payment-profiles`);
    
    let currentIndex: any;
    const body = await response.json();
    if (body.length == 0) {
        currentIndex = false;
    }
    else {
        for (let i = 0; i < body.length; i++) {
            if (body[i].id == paymentProfileId) {
                currentIndex = i;
            }
            else {
                currentIndex = false;
            }
        }
    }

    expect(response.ok()).toBeTruthy();
    expect(currentIndex).toEqual(false);
}

export async function updatePaymentProfileToDefault(customerId: string, paymentProfileId: string) {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.patch(`${customerId}/schemes/100020001/payment-profiles/${paymentProfileId}`, {
        data: {
            "isDefault": true,
            "name": `${faker.person.fullName()}-updated-pw`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.default).toEqual(true);
}

export async function noAbnDonationPartnerCreation() {
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.DONATION_PARTNER_URL}v1/donation-partners`, {
        data: {
            "name": `${faker.company.name()} PW Org`,
            "email_address": `${faker.person.firstName()}-dp-pw@cesteam.testinator.com`,
            "abn": "",
            "category": "Other",
            "description": faker.company.catchPhrase(),
            "website_url": faker.internet.url(),
            "multi_scheme_id": "10002"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    donationPartnerId = body.id;
    donationPartnerSchemeParticipantId = body.scheme_participant_id;
}

async function loginMonolith(username: string, password: string) {
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.MONOLITH_URL}api/v1/login`, {
        headers: {
            "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    monolithAccessToken = body.access_token;
}

export async function approveDonationPartner() {
    await loginMonolith(process.env.SCHEME_APPROVAL_USERNAME, schemeGetter().defaultPassWord);

    const requestContext = await request.newContext();
    const response = await requestContext.patch(`${process.env.DONATION_PARTNER_URL}v1/donation-partners/${donationPartnerId}`, {
        headers: {
            "Authorization": `Bearer ${monolithAccessToken}`,
            "x-scheme-id": "10002"
        },
        data: { "approval_status": "APPROVED" }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.approval_status).toEqual('APPROVED');
}

export async function vicGroupCustomerCreation() {
    await noAbnDonationPartnerCreation();
    await loginMonolith(process.env.SCHEME_APPROVAL_USERNAME, schemeGetter().defaultPassWord);
    await approveDonationPartner();
    await vicIndividualCustomerCreation();
    await new Promise(f => setTimeout(f, 2000));

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.CUSTOMER_API_NODE_URL}v1/customers/${vicIndividualCustomerID}/groups`, {
        headers: {
            "Authorization": `Bearer ${auth0UserAccessToken}`
        },
        data: {
            "scheme_participant_id": donationPartnerSchemeParticipantId,
            "name": `${faker.company.name()} PW Org`,
            "abn": "",
            "category": "mental-health-services"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    console.log(body.scheme_participant_id);
    vicGroupCustomerID = body.id;
}

export async function createUnapprovedBank(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const name = `${faker.person.fullName()}-PW`
    const accountNumber = faker.string.numeric({ length: 9 });
    const accountSuffix = accountNumber.substring((accountNumber.length - 4));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/unapproved-payment-profiles`, {
        data: {
            "name": name,
            "default": true,
            "paymentType": "BANK",
            "bankAccount": {
                "bsb": "553037",
                "accountNumber": accountNumber
            }
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toContain(name);
    expect(body.customerId).toContain(customerId);
    expect(body.paymentType).toEqual('BANK');
    expect(body.accountNumberSuffix).toEqual(accountSuffix);
    expect(body.delegate).toBeNull();
    expect(body.approved).toEqual(false);
    unapprovedBankId = body.id;
}

export async function approveBank(customerId: string, unapprovedBankId: string) {
    await loginMonolith(process.env.NOP_APPROVAL_USERNAME, schemeGetter().defaultPassWord);

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.PAYMENT_APPROVAL_URL}customers/${customerId}/schemes/100020001/unapproved-payment-profiles/${unapprovedBankId}/approval`, {
        headers: {
            "Authorization": `Bearer ${monolithAccessToken}`,
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.approved).toEqual(true);
}

export async function updateApprovedBankToDefault(customerId: string, bankId: string) {
    await loginMonolith(process.env.NOP_APPROVAL_USERNAME, schemeGetter().defaultPassWord);

    const requestContext = await request.newContext();
    const response = await requestContext.patch(`${process.env.PAYMENT_APPROVAL_URL}customers/${customerId}/schemes/100020001/payment-profiles/${bankId}`, {
        headers: {
            "Authorization": `Bearer ${monolithAccessToken}`,
        },
        data: {
            "isDefault": true,
            "name": `${faker.person.fullName()}-updated-pw`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.default).toEqual(true);
}

export async function approveGroup(groupCustomerId: string) {
    await loginMonolith(process.env.NOP_APPROVAL_USERNAME, schemeGetter().defaultPassWord);

    const requestContext = await request.newContext();
    const response = await requestContext.patch(`${process.env.CUSTOMER_API_NODE_URL}v1/groups/${groupCustomerId}`, {
        headers: {
            "Authorization": `Bearer ${monolithAccessToken}`,
            "x-scheme-id": "100020001"
        },
        data: { "status": "APPROVED" }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toEqual('APPROVED');
}

export async function invalidBsbAccountNumberBankCreation(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/unapproved-payment-profiles`, {
        data: {
            "name": `${faker.person.fullName()}-PW`,
            "default": true,
            "paymentType": "BANK",
            "bankAccount": {
                "bsb": "BSB",
                "accountNumber": "accountNumber"
            }
        }
    });

    expect(response.ok()).toBeFalsy();
    const body = await response.json();
    expect(body).toContain('bankAccount.bsb must be a 6 digit long number');
    expect(body).toContain('bankAccount.accountNumber must be only numbers');
}

export async function mismatchPayloadBank(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/unapproved-payment-profiles`, {
        data: {
            "name": `${faker.person.fullName()}-PW`,
            "default": true,
            "paymentType": "BANK",
            "payPalAccount": {
                "payerId": faker.string.numeric({ length: 9 })
            }
        }
    });

    expect(response.ok()).toBeFalsy();
    const body = await response.json();
    expect(body).toContain('bankAccount must be set when paymentType is BANK');
}

export async function mismatchPayloadPayPal(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/unapproved-payment-profiles`, {
        data: {
            "name": `${faker.person.fullName()}-PW`,
            "default": true,
            "paymentType": "PAYPAL",
            "bankAccount": {
                "bsb": "553037",
                "accountNumber": faker.string.numeric({ length: 9 })
            }
        }
    });

    expect(response.ok()).toBeFalsy();
    const body = await response.json();
    expect(body).toContain('paypalAccount must be set when paymentType is PAYPAL');
}

export async function mismatchPayloadDelegate(customerId: string) {
    await new Promise(f => setTimeout(f, 1000));

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`${customerId}/schemes/100020001/unapproved-payment-profiles`, {
        data: {
            "name": `${faker.person.fullName()}-PW`,
            "default": true,
            "paymentType": "DELEGATE",
            "bankAccount": {
                "bsb": "553037",
                "accountNumber": faker.string.numeric({ length: 9 })
            }
        }
    });

    expect(response.ok()).toBeFalsy();
    const body = await response.json();
    expect(body).toContain('delegateAccount must be set when paymentType is DELEGATE');
}