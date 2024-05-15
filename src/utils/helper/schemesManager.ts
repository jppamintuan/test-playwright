import * as schemes from "../../utils/test-data/login_users.json"
export const schemeGetter = () => {
    const scheme = process.env.npm_config_scheme || "QLD";
    switch (scheme) {
        case "QLD":
            return schemes.QLD;
        case "WA":
            return schemes.WA;
        case "VIC":
            return schemes.VIC;
        default:
            throw new Error("Please set the proper scheme!")
    }
}