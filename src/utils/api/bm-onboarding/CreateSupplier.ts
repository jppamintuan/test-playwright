import { expect } from "@playwright/test";
import { schemeGetter } from "../../helper/schemesManager";
import { getAuthToken, requestContext } from "./BMOnboardingContext";
import * as DataFaker from "../../helper/DataFaker"
import * as bmCreationData from "../../../utils/test-data/bm_onboarding.json"


export default class CreateSupplier {
    email: string;
    private async getBMData() {
        this.email = DataFaker.newSupplier().username + '_' + schemeGetter().scheme + '_bm@' + process.env.MAIL_DOMAIN;
        const bmData = bmCreationData;
        bmData.scheme = schemeGetter().scheme;
        bmData.email = this.email;
        bmData.abn = DataFaker.newSupplier().abn;
        const legalName = DataFaker.newSupplier().tradingName;
        bmData.legalEntityName = legalName;
        bmData.tradingName = legalName;
        bmData.contacts[0].positionTitle = legalName;
        bmData.contacts[0].firstName = DataFaker.newSupplier().firstname;
        bmData.contacts[0].email = this.email;
        return bmData;
    }

    private async getNewAuthToken() {
        await getAuthToken({
            apiEndpoint: process.env.BM_OBR_ENDPOINT as string,
            tokenEndpoint: process.env.BM_OBR_TOKEN_URL as string,
            tokenClientId: process.env.BM_OBR_CLIENT_ID as string,
            tokenClientSecret: process.env.BM_OBR_CLIENT_SECRET as string,
        });
    }

    async createSupplier() {

        await this.getNewAuthToken();
        const reqContext = await requestContext();
        const bmData = await this.getBMData();

        const response = await reqContext.post('api/v1/scheme-participants', {
            data: bmData,
        });

        expect(response.ok()).toBeTruthy();
        const bmResponse = await response.json();
        // console.log("Newly created Supplier: ");
        // console.log(bmResponse);
        
        return bmResponse;
    }

}