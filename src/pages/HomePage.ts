import { Page, expect } from "@playwright/test";

export default class HomePage {
    private page: Page

    private elements = {
        productsTab : " Products ",
        salesVolumesTab : " Sales Volumes ",
        h1 : ".separator"
    }

    constructor (private p: Page) {
        this.page = p;
    }

    async navigatetoSalesVolumes() {
        await this.page.getByText(this.elements.salesVolumesTab).click();
        await this.page.waitForLoadState();
    }

    async navigatetoProducts() {
        await this.page.getByText(this.elements.productsTab).click();
        await this.page.waitForLoadState();
    }

    async verifySalesVolumesHeader() {
        await expect(this.page.locator(this.elements.h1)).toHaveText("Sales Volume Declarations");
    }

    async verifyProductsPortals() {
        await expect(this.page.locator(this.elements.h1)).toHaveText("Products");
    }
}