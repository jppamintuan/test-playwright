module.exports = {

    default: {
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:src/utils/report/@rerun.txt"
        ],
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
            "src/test/features"
        ],
        require: [
            "src/test/steps/*.ts",
            "src/utils/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        parallel: 2
    },
    rerun: {
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:src/utils/report/@rerun.txt"
        ],
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
            "src/test/features"
        ],
        require: [
            "src/test/steps/*.ts",
            "src/utils/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        parallel: 2
    }
}