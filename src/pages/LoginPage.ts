// import { Page, expect } from "@playwright/test";
// // import MailinatorAPI from "automation-shared-library/dist/mailinator/MailinatorAPI";
// import * as loginData from "../utils/test-data/login_users.json";
// import CreateSupplier from "../utils/api/bm-onboarding/CreateSupplier";

// let createSupplier:CreateSupplier;
// export default class LoginPage {
//     private page: Page

//     private elements = {
//         userName: "#idcs-signin-basic-signin-form-username",
//         password: "input[type='password']",
//         signInButton: "Sign In",

//         //Reset Password Page
//         newPassword: "input[id^='idcs-unauthenticated-reset-password-new-password']",
//         confirmPassword: "input[id^='idcs-unauthenticated-reset-password-confirm-password']",
//         resetPasswordButton: "#idcs-unauthenticated-reset-password-submit-button",
//         successMsg: ".idcs-signin-Success"
//     }

//     constructor(private p: Page) {
//         this.page = p;
//     }

//     async navigateToLoginPage() {
//         await this.page.goto(process.env.BASEURL);
//     }

//     async enterUserName(username: string) {
//         this.page.locator(this.elements.userName).waitFor();
//         await this.page.locator(this.elements.userName).fill(username);
//     }

//     async enterPassword(password: string) {
//         await this.page.locator(this.elements.password).fill(password);
//     }

//     async clickSignIn() {
//         await this.page.getByRole('button', { name: this.elements.signInButton }).click();
//     }

//     async enterNewPassword(password: string) {
//         await this.page.locator(this.elements.newPassword).fill(password);
//         await this.page.keyboard.press('Enter');
//     }

//     async enterConfirmPassword(password: string) {
//         await this.page.locator(this.elements.confirmPassword).fill(password);
//         await this.page.keyboard.press('Enter');
//     }

//     async clickResetPassword() {
//         await this.page.locator(this.elements.resetPasswordButton).click();
//         await this.verifySetPasswordSuccess();
//     }

//     async verifySetPasswordSuccess() {
//         await this.page.locator(this.elements.successMsg).waitFor();
//         await expect(this.page.locator(this.elements.successMsg)).toBeVisible();
//     }

//     async signIn() {
//         const loginId = createSupplier.email;
//         await this.enterUserName(loginId);

//         await this.enterPassword(loginData.QLD.password);

//         await this.clickSignIn();

//         // await this.page.locator('nz-avatar').click({ timeout: 60000 });

//         //Make sure that the user login is the correct one
//         // await expect(this.page.getByText(loginId)).toBeVisible();
//     }

//     private async getPassSetupLink() {
//         createSupplier = new CreateSupplier();
//         await createSupplier.createSupplier();
//         const email = createSupplier.email;
//         // console.log(email)
//         const inboxName = email.substring(0, email.lastIndexOf("@"));
//         await this.page.waitForTimeout(15000);
//         const mailAPI = new MailinatorAPI();
//         const setPasswordLink = await mailAPI.getSignInLink(inboxName);
//         return setPasswordLink;
//     }

//     async setPassword() {
//         // this wait is for the welcome email to arrive in mailinator inbox
//         await this.page.goto(await this.getPassSetupLink());
//         await this.enterNewPassword(loginData.QLD.password);
//         await this.enterConfirmPassword(loginData.QLD.password);
//         await this.clickResetPassword();
//     }
// }
