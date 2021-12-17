const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const vaultName = "todaylunchkeyvault";
const url = `https://${vaultName}.vault.azure.net`;

async function GetKeyVaultSecret(secretName = 'RaincomePrConnectionString') {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);
    const latestSecret = await client.getSecret(secretName);
    console.log(`Latest version of the secret ${secretName}: `, latestSecret);
    // const specificSecret = await client.getSecret(secretName, { version: latestSecret.properties.version! });
    // console.log(`The secret ${secretName} at the version ${latestSecret.properties.version!}: `, specificSecret);
}

export {
    GetKeyVaultSecret
}
