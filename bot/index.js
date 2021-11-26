// index.js is used to setup and configure your bot

// Import required packages
const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    CloudAdapter,
    MessageFactory
} = require("botbuilder");
const { TeamsBot } = require("./teamsBot");
const { ProactiveBot } = require('./proactiveBot');
const ProactiveAppIntallationHelper = require('./ProactiveAppIntallationHelper');
const axios = require("axios");

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.BOT_ID,
    appPassword: process.env.BOT_PASSWORD,
});

// 봇 프레임워크 커넥터로 연결
const BotConnector = require("botframework-connector");
const credentials = new BotConnector.MicrosoftAppCredentials(
    process.env.BOT_ID,
    process.env.BOT_PASSWORD,
);

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a message to the user
    await context.sendActivity(`The bot encountered an unhandled error:\n ${error.message}`);
    await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};

// 봇 시작
const conversationReferences = {};
const bot = new ProactiveBot(conversationReferences);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\nBot started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Listen for incoming notifications and send proactive messages to users.
server.get('/api/notify', async (req, res) => {
    // DB에서 conversation 있나 확인

    // 있으면 해당 conversation 으로 진행

    // 없으면 시작



    const bot_id = "20343e66-49b0-4955-9d26-b3ab1255d26d";
    const tenant_id = "2f73c339-0881-4953-93ec-9379c837f5a3";
    const user_id = "57ba0d68-0e3f-44ac-9272-127cb2496043";
    const message = MessageFactory.text("PR이 발생했습니다!");


    const conversationParameters = {
        isGroup: false,
        channelData: {
            tenant: {
                id: tenant_id
            }
        },
        bot: {
            id: "28:20343e66-49b0-4955-9d26-b3ab1255d26d",
            name: "raincomeprbot-local-debug"
        },
        members: [
            {
                id: "29:1K8i1iYCl-lBIDtewgNgX7JFolxmpi_YMI37vhi99gB3BfWQzTXvvUygUL9BNqGzkWdPcuTnEZ1fI4kG9j2kw9g",
                name: '강한별'
            }
        ]
    };

    try {
        const connectorClient = adapter.createConnectorClient("https://smba.trafficmanager.net/kr/");
        const response = await connectorClient.conversations.createConversation(conversationParameters);
        const result = await connectorClient.conversations.sendToConversation(response.id, message);
    } catch (error) {
        console.log(error);
    }

    res.send("Message sent");
    return;
});

// Gracefully shutdown HTTP server
["exit", "uncaughtException", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"].forEach((event) => {
    process.on(event, () => {
        server.close();
    });
});
