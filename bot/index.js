// index.js is used to setup and configure your bot

// Import required packages
const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MessageFactory } = require("botbuilder");
const { ProactiveBot } = require('./BotHandler/proactiveBot');
const ConversationHandler = require("./Database/ConversationHandler");

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
server.use(restify.plugins.queryParser());      // query string 자동 파서

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// const tenant_id = "2f73c339-0881-4953-93ec-9379c837f5a3";
// const user_id = "57ba0d68-0e3f-44ac-9272-127cb2496043";
// Listen for incoming notifications and send proactive messages to users.
server.get('/api/notify', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        res.send("err");
        return;
    }

    try {
        // DB에서 conversation 있나 확인
        const handler = new ConversationHandler();
        const getResult = await handler.GetUserConversation(user_id);
        if (getResult.length > 0) {
            const conversation_id = getResult.data.conversation.id;
            const connectorClient = adapter.createConnectorClient("https://smba.trafficmanager.net/kr/");
            // const response = await connectorClient.conversations.createConversation(conversationParameters);
            // conversation_id = response.id 임
            const result = await connectorClient.conversations.sendToConversation(conversation_id, MessageFactory.text("PR이 발생했습니다!"));
        }
    } catch (error) {
        console.error(error);
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
