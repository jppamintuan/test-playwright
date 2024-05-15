const report = require("multiple-cucumber-html-reporter");

report.generate({
    jsonDir: "test-results",
    reportPath: "test-results/reports/",
    reportName: "Playwright BDD Report",
    pageTitle: "Sales Volumes test report",
    displayDuration: false,
    metadata: {
        browser: {
            name: "chrome",
            version: "120+",
        },
        device: "CES - PC",
        platform: {
            name: "MacOs",
            version: "13",
        },
    },
    customData: {
        title: "Test Info",
        data: [
            { label: "Project", value: "Sales Volumes" },
            { label: "Release", value: "1.2.3" },
            { label: "Cycle", value: "Smoke-1" }
        ],
    },
});