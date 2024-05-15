import { request, expect } from '@playwright/test';
import { schemeGetter } from "../../src/utils/helper/schemesManager";
import { faker } from '@faker-js/faker';

let posAccessToken: string;
let posCrpId: string, posCcspSiteNumber: string;
let posDeviceId: string, posDeviceSecret: string;
let posMemberSiteId: string;
let agreementFee: number, agreementID: string;

async function getAccessToken(username: string, password: string) {
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.POS_BASE_URL}login`, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    posAccessToken = body.access_token;
}

async function accessTokenRequestContext() {
    const apiContext = await request.newContext({
        baseURL: process.env.POS_BASE_URL,
        extraHTTPHeaders: {
            Authorization: `Bearer ${posAccessToken}`,
        },
    });

    return apiContext;
}

async function queryRefundPoints() {
    let userName: string;
    if (process.env.TEST_ENV == 'sit')
        userName = schemeGetter().sit.posApiUserName;
    else
        userName = schemeGetter().uat.posApiUserName;
    await getAccessToken(userName, schemeGetter().defaultPassWord);

    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get('container-refund-points', {
        headers: {
            "Current-Scheme-Id": `${schemeGetter().scheme}`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    posCrpId = body[0].id;
    posCcspSiteNumber = body[0].ccspSiteNumber;
}

async function registerPosDevice() {
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post(`devices/${posCrpId}`, {
        data: {
            "name": faker.string.uuid(),
            "type": "POS"
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.type).toEqual('POS');
    expect(body.status).toEqual('ACTIVE');
    posDeviceId = body.id;
    posDeviceSecret = body.secret;
}

async function authenticatePosDevice() {
    await getAccessToken(`${posDeviceId}`, `${posDeviceSecret}`);
}

async function getMemberDetails() {
    await authenticatePosDevice();
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.get(`members/${schemeGetter().customerId}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body[0].memberId).toEqual(schemeGetter().customerId);
    posMemberSiteId = body[0].memberSiteId;
}

export async function refund() {
    await queryRefundPoints();
    await registerPosDevice();
    await getMemberDetails();
    
    const transactionId = `${faker.string.uuid()}-playwright`;
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post('refund-transactions', {
        data: [
            {
                "transactionId": transactionId,
                "deviceId": posDeviceId,
                "memberSiteId": posMemberSiteId,
                "memberId": schemeGetter().customerId,
                "refundPaymentType": "SCHEME_PAID",
                "paymentMethod": "SCHEME",
                "transactedOn": "2024-04-05T06:57:43.362Z",
                "materialTypeCount": 1,
                "totalQuantity": 65,
                "materialTypes": [{"materialTypeId":"GLASSMIXED","quantity":65,"refundAmountPerUnit":0.1,"grossAmount":"6.50","taxableAmount":0,"gstAmount":0}],
                "refundCRP": posCrpId
            }
        ]
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toEqual([]);
    console.log(transactionId);
}

// ----------------------------------------------------------------

/**
 * Returns an array of material types based on the given scheme.
 * @param string scheme - The scheme for which material types are requested. Possible values: "QLD", "WA".
 * @returns string[] - An array of material types.
 */
async function getMaterialTypes(scheme: string) {
    var materialTypesQLD = [
        "GLASSMIXED",
        "ALUMINIUM",
        "PETCLEAR",
        "PETCOLORED",
        "HDPE",
        "LQDPAPERBRD",
        "STEEL",
        "OTHER"
    ];
    var materialTypesWA = [
        "WA_GLASSMIXED",
        "WA_ALUMINIUM",
        "WA_PETCLEAR",
        "WA_PETCOLORED",
        "WA_PETWHITE",
        "WA_HDPE",
        "WA_LQDPAPERBRD",
        "WA_STEEL",
        "WA_OTHER",
        "WA_GLASSAMBER",
        "WA_GLASSFLINT",
        "WA_GLASSGREEN"
    ];
        var materialTypesVIC = [
        "VIC_ALUMINIUM",
        "VIC_GLASS",
        "VIC_HDPE",
        "VIC_LQDPAPERBRD",
        "VIC_OTHER",
        "VIC_OTHPLASTICS",
        "VIC_PET",
        "VIC_STEEL"
    ];
    
    if (scheme == "QLD") 
        return materialTypesQLD;
    else if (scheme == "WA")
        return materialTypesWA;
    else if (scheme == "VIC_NOP_A")
        return materialTypesVIC;
}

/**
 * Generates an array of material type objects based on the given material count and aboveThreshold flag.
 * @param number materialCount - The number of material types to generate.
 * @param boolean isAboveThreshold - Indicates whether the generated quantities should be above the daily refund threshold.
 * @param boolean hasTax - Indicates whether the refund has taxes included.
 * @returns Object - An object containing the generated material types as a JSON string and the running total of quantities.
 */
async function generateMaterialTypeBody(materialCount: number, isAboveThreshold: boolean, hasTax?: boolean) {
    let materialTypesList = await getMaterialTypes(schemeGetter().scheme);
    let refundAmountPerUnit = 0.10;
    
    let counter = 1;
    let quantity: number;
    let runningTotal = 0;
    let jsonArray = [];
    
    while (counter <= materialCount) {
        // Generate a Material Type and Remove from the List to avoid duplicates
        let randomNumber = Math.floor(Math.random() * materialTypesList.length);
        let materialTypeId = materialTypesList[randomNumber];
        materialTypesList.splice(randomNumber, 1);
        
        if (isAboveThreshold) {
            let min = Math.floor(2500 / materialCount);
            let max = Math.floor(3000 / materialCount);
            quantity = faker.number.int({ min: min, max: max })
        } 
        else 
        {
            quantity = faker.number.int({ min: 1, max: 100 })
        }
        runningTotal = runningTotal + quantity;

        let grossAmount = parseFloat((quantity * refundAmountPerUnit).toFixed(2));
        
        // Calculate Taxes if Sevice Fee Agreement Exists
        let gstAmount = 0;
        let taxableAmount = 0 ;
        if (hasTax)
        {
            gstAmount = parseFloat((grossAmount / 11).toFixed(2));
            taxableAmount = parseFloat((grossAmount - gstAmount).toFixed(2));
        }

        // Build the JSON object
        let jsonObject = {
            materialTypeId: materialTypeId,
            quantity: quantity,
            refundAmountPerUnit: refundAmountPerUnit,
            grossAmount: grossAmount,
            taxableAmount: taxableAmount,
            gstAmount: gstAmount,
        };
        jsonArray.push(jsonObject);

        counter++;
    }
    
    return {
        runningTotal,
        jsonArray
    };
}

export async function refundNonPsf(paymentMethod: string, isAboveThreshold: boolean, multipleMaterials: boolean) {
    await queryRefundPoints();
    await registerPosDevice();
    await getMemberDetails();
    
    const currentDate = new Date().toJSON();

    let refundPaymentType: string;
    if (paymentMethod == 'SCHEME')
        refundPaymentType = 'SCHEME_PAID';
    else
        refundPaymentType = 'CRP_PAID';

    let materialTypeCount = 1;
    if (multipleMaterials) {
        let materialList = await getMaterialTypes(schemeGetter().scheme);
        materialTypeCount = faker.number.int({ min: 2, max: materialList.length })
    }
    
    let generateMaterialTypes = await generateMaterialTypeBody(materialTypeCount, isAboveThreshold);

    const transactionId = `${faker.string.uuid()}-playwright`;
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post('refund-transactions', {
        data: [
            {
                "transactionId": transactionId,
                "deviceId": posDeviceId,
                "memberSiteId": posMemberSiteId,
                "memberId": schemeGetter().customerId,
                "refundPaymentType": refundPaymentType,
                "paymentMethod": paymentMethod,
                "transactedOn": currentDate,
                "materialTypeCount": materialTypeCount,
                "totalQuantity": generateMaterialTypes.runningTotal,
                "materialTypes": generateMaterialTypes.jsonArray,
                "refundCRP": posCrpId
            }
        ]
    });

    console.log(generateMaterialTypes.runningTotal);
    console.log(generateMaterialTypes.jsonArray);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toEqual([]);
    console.log(transactionId);
}

async function createTokenForAgreementAdapter() {
    let userName: string, password: string;
    if (process.env.TEST_ENV == 'sit') {
        userName = schemeGetter().sit.agreementUser;
        password = schemeGetter().sit.agreementPass;
    }
    else {
        userName = schemeGetter().uat.agreementUser;
        password = schemeGetter().uat.agreementPass;
    }

    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.ORACLE_CLOUD_URL}oauth2/v1/token`, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Basic ${Buffer.from(`${userName}:${password}`).toString('base64')}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "client_credentials",
            scope: `pos-apa-${schemeGetter().scheme}-${process.env.TEST_ENV}/agreements:write`
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const oracleToken = body.access_token;

    return oracleToken;
}

async function createAgreement(type: string) {
    await queryRefundPoints();
    await registerPosDevice();
    await getMemberDetails();

    let preAgreementNumber: string;
    if (schemeGetter().scheme == 'QLD' )
        preAgreementNumber = faker.string.numeric({ length: { min: 8, max: 8 }, allowLeadingZeros: true });
    if (schemeGetter().scheme == 'WA' )
        preAgreementNumber = faker.string.numeric({ length: { min: 6, max: 6 }, allowLeadingZeros: true })
    preAgreementNumber = `A${preAgreementNumber}`;

    let currentDate = new Date().toJSON();
    let time = new Date();
    time.setHours(time.getHours()+24);
    let currentDatePlusOne = time.toJSON();

    if (type == 'PER_CONTAINER')
        agreementFee = faker.number.float({ min: 0.02, max: 0.09, precision: 0.01});
    else
        agreementFee = faker.number.float({ min: 0.01, max: 1, precision: 0.01});

    const oracleToken = await createTokenForAgreementAdapter();
    const requestContext = await request.newContext();
    const response = await requestContext.post(`${process.env.AGREEMENT_ADAPTER_URL}${schemeGetter().scheme}/agreement`, {
        headers: {
            "Authorization": `Bearer ${oracleToken}`
        },
        data: {
            "agreementNumber": preAgreementNumber,
            "customerNumber": schemeGetter().customerId,
            "partnerNumber": posCcspSiteNumber,
            "fee": {
              "type": type,
              "rate": agreementFee
            },
            "effectiveDate": {
              "start": currentDate,
              "end": currentDatePlusOne,
              "timezone": "Australia/Sydney"
            }
          }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const agreementId = body.id;
    agreementID = agreementId;
}

export async function refundPsf(type: string, overRide: boolean, isAboveThreshold: boolean, multipleMaterials: boolean) {
    await createAgreement(type);

    const currentDate = new Date().toJSON();

    let materialTypeCount = 1;
    if (multipleMaterials) {
        let materialList = await getMaterialTypes(schemeGetter().scheme);
        materialTypeCount = faker.number.int({ min: 2, max: materialList.length })
    }
    
    let generateMaterialTypes = await generateMaterialTypeBody(materialTypeCount, isAboveThreshold, true);

    var serviceFeeAgreementObject: object;
    if (type == 'PER_CONTAINER' && overRide == false) {
        let serviceFee = generateMaterialTypes.runningTotal * agreementFee;
        serviceFeeAgreementObject = { 
            id: agreementID,
            type: "PER_CONTAINER",
            fee: serviceFee
        };
    }
    else if (type == 'TOTAL' && overRide == false) {
        serviceFeeAgreementObject = { 
            id: agreementID,
            type: "TOTAL",
            fee: agreementFee
        };
    }
    else if (type == 'PER_CONTAINER' && overRide == true) {
        let overRideRate = faker.number.float({ min: 0.01, max: agreementFee, precision: 0.01});
        let serviceFee = generateMaterialTypes.runningTotal * overRideRate;
        serviceFeeAgreementObject = { 
            id: agreementID,
            type: "PER_CONTAINER",
            fee: serviceFee,
            override: {
                rate: overRideRate
            }
        };
    }
    else if (type == 'TOTAL' && overRide == true) {
        let overRideTotal = faker.number.float({ min: 0.01, max: agreementFee, precision: 0.01});
        serviceFeeAgreementObject = { 
            id: agreementID,
            type: "TOTAL",
            fee: agreementFee,
            override: {
                total: overRideTotal
            }
        };
    }
    console.log(serviceFeeAgreementObject);
    const transactionId = `${faker.string.uuid()}-playwright`;
    const reqContext = await accessTokenRequestContext();
    const response = await reqContext.post('refund-transactions', {
        data: [
            {
                "transactionId": transactionId,
                "deviceId": posDeviceId,
                "memberSiteId": posMemberSiteId,
                "memberId": schemeGetter().customerId,
                "refundPaymentType": "SCHEME_PAID",
                "paymentMethod": "SCHEME",
                "transactedOn": currentDate,
                "materialTypeCount": materialTypeCount,
                "totalQuantity": generateMaterialTypes.runningTotal,
                "serviceFeeAgreement": serviceFeeAgreementObject,
                "materialTypes": generateMaterialTypes.jsonArray,
                "refundCRP": posCrpId
            }
        ]
    });

    console.log(generateMaterialTypes.runningTotal);
    console.log(generateMaterialTypes.jsonArray);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toEqual([]);
    console.log(transactionId);
}