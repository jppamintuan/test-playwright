import {Page} from "@playwright/test"

export default class SalesVolumesPage {
    private page: Page

    constructor (private p : Page) {
        this.page = p;
    }

    private elements = {
        currentMonthButton : "Current Month",
        bulkUploadButton : "Bulk Upload",
        expandSalesRowIcon : "td.status>span"
    }

    async clickCurrnetMonth() {
        await this.page.getByText(this.elements.currentMonthButton).click();
    }

    async clickBulkUploadButton() {
        await this.page.getByText(this.elements.bulkUploadButton).click();
    }

    async clickExpandSalesRowIcon() {
        await this.page.locator(this.elements.expandSalesRowIcon).click();
    }
}