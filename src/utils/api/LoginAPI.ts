import { APIRequestContext, Page, expect } from "@playwright/test";
import { schemeGetter } from "../helper/schemesManager";
import { fixture } from "../hooks/fixture";

export default class LoginAPI {
    private request: APIRequestContext;
    response: any;

    constructor(private context: APIRequestContext) {
        this.request = context;
    }

    async getAPIToken(user: string, request: APIRequestContext) {
        const loginId = user;

        const auth = Buffer.from(loginId + ':'+schemeGetter().password).toString('base64');

        const response = await request.post(process.env.HOST + 'api/v1/login',
            {
                headers: {
                    'Accept': '* /*',
                    'Authorization': `Basic ${auth}`
                }
            });

        console.log("auth is: "+auth)

        expect(response.ok).toBeTruthy();
        expect(response.status()).toBe(200);

        const body = await response.json();
        process.env.TOKEN = body.access_token;
    }

    async apiLogin() {
        await this.getAPIToken(schemeGetter().supplier,fixture.api);

        // console.log("TOKEN is : "+ process.env.TOKEN)

        const response1 = await this.request.get(process.env.HOST + 'api/v1/products?pageNumber=0&pageSize=10', {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`,
                'Accept': '*/*'
            }
        });
        console.log(response1)
    }
}