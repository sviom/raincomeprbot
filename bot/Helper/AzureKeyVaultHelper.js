const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const dotenv = require("dotenv");

const vaultName = "todaylunchkeyvault";
const url = `https://${vaultName}.vault.azure.net`;
dotenv.config();        // env파일은 루트에

class AzureKeyVaultHelper {
    /**
 * test22
 * @param {*} secretName
 */
    async GetKeyVaultSecret(secretName = 'RaincomePrConnectionString') {
        const credential = new DefaultAzureCredential();
        const client = new SecretClient(url, credential);
        const latestSecret = await client.getSecret(secretName);
        console.log(`Latest version of the secret ${secretName}: `, latestSecret);
        // const specificSecret = await client.getSecret(secretName, { version: latestSecret.properties.version! });
        // console.log(`The secret ${secretName} at the version ${latestSecret.properties.version!}: `, specificSecret);
        return latestSecret;
    }
}



async function main() {
    // DefaultAzureCredential expects the following three environment variables:
    // - AZURE_TENANT_ID: The tenant ID in Azure Active Directory
    // - AZURE_CLIENT_ID: The application (client) ID registered in the AAD tenant
    // - AZURE_CLIENT_SECRET: The client secret for the registered application
    const credential = new DefaultAzureCredential();

    const url = process.env["KEYVAULT_URI"] || "<keyvault-url>";

    const client = new SecretClient(url, credential);

    // Create a secret
    const uniqueString = new Date().getTime();
    const secretName = `secret${uniqueString}`;
    const result = await client.setSecret(secretName, "MySecretValue");
    console.log("result: ", result);

    // Read the secret we created
    const secret = await client.getSecret(secretName);
    console.log("secret: ", secret);

    // Update the secret with different attributes
    const updatedSecret = await client.updateSecretProperties(secretName, result.properties.version, {
        enabled: false
    });
    console.log("updated secret: ", updatedSecret);

    // Delete the secret
    // If we don't want to purge the secret later, we don't need to wait until this finishes
    await client.beginDeleteSecret(secretName);
}

module.exports = AzureKeyVaultHelper;
