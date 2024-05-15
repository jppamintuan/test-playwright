import * as dotenv from 'dotenv'

export const getEnv = () => {
    if (process.env.TEST_ENV) {
        dotenv.config({
            override: true,
            path: `src/utils/environment/.env.${process.env.TEST_ENV}`
        })
    } else {
        console.error("NO ENV PASSED, Please pass the ENV i.e. TEST_ENV=uat")
    }

}