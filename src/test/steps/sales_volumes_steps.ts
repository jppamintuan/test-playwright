// import { When, Then, setDefaultTimeout, Given } from "@cucumber/cucumber"
// import LoginPage from "../../pages/LoginPage";
// import { fixture } from "../../utils/hooks/fixture";
// import HomePage from "../../pages/HomePage";
// import SalesVolumes from "../../pages/SalesVolumesPage";
// import CreateSupplier from "../../utils/api/bm-onboarding/CreateSupplier";

// let loginPage: LoginPage;
// let homePage: HomePage;
// let salesVolumes: SalesVolumes;
// let createSupplier: CreateSupplier;

// setDefaultTimeout(60 * 10000)

// Given('a Supplier is created', async function () {
//     if (loginPage == null) { loginPage = new LoginPage(fixture.page); }
//     // createSupplier = new CreateSupplier();
//     // const bmResponse = await createSupplier.createSupplier();
//     await loginPage.setPassword();
// });

// When('login to BM Portal as a Supplier', async function () {
//     // getting token from Login API B2B Portal
//     // response = new LoginAPI(fixture.api);
//     // await response.apiLogin();
//     if (loginPage == null) { loginPage = new LoginPage(fixture.page); }
//     await loginPage.navigateToLoginPage();
//     await loginPage.signIn();
// });

// When('a user navigates to Sales Volumes tab', async function () {
//     homePage = new HomePage(fixture.page);
//     await homePage.navigatetoSalesVolumes();
// });

// Then('user sees the Sales Volumes', async function () {
//     await homePage.verifySalesVolumesHeader();
// });

// When('a user navigates to Product Portal', async function () {
//     // await homePage.navigatetoProducts();
// });

// Then('user sees the Product Portal', async function () {
//     await homePage.verifyProductsPortals();
// });

// When('user clicks on Current Month button', async function () {
//     salesVolumes = new SalesVolumes(fixture.page);
//     await salesVolumes.clickCurrnetMonth();
// });

// When('user expands the Sales Row', async function () {
//     await salesVolumes.clickExpandSalesRowIcon();
// });
