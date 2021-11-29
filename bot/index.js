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
server.post('/api/notify', async (req, res) => {
    // const { user_email } = req.query;
    const rawBody = req.body;

    // if (!user_email) {
    //     res.send("err");
    //     return;
    // }

    const actorEmail = rawBody.actor ? rawBody.actor.emailAddress : '';
    if (!actorEmail)
        return res.send(404, { message: 'actorEmail not found' });

    const rawPullRequest = rawBody.pullRequest;

    if (!rawPullRequest)
        return res.send(404, { message: 'pr not found' });

    const prTitle = rawPullRequest.title;
    const prDescription = rawPullRequest.description;
    const reviewers = rawPullRequest.reviewers;
    let prLink = rawPullRequest.links.self[0].href.toString();

    if (!Array.isArray(reviewers))
        return res.send(404, { message: 'No reviewers' });

    for (let index = 0; index < reviewers.length; index++) {
        const element = reviewers[index];
        const reviewerEmail = element.user.emailAddress;

        try {
            const handler = new ConversationHandler();      // DB에서 conversation 있나 확인
            const getResult = await handler.GetUserConversation(reviewerEmail);
            if (getResult.length == 1) {
                const conversation_id = getResult.data.conversation.id;
                const connectorClient = adapter.createConnectorClient("https://smba.trafficmanager.net/kr/");
                // const response = await connectorClient.conversations.createConversation(conversationParameters);

                let rawNotificationCard = require("./adaptiveCards/prNotification.json");
                rawNotificationCard.body[0].text = prTitle;
                rawNotificationCard.body[1].text = prDescription;

                prLink = prLink.replace("bitbucket.jinhaksa.net", "10.1.4.71");

                rawNotificationCard.actions[0].url = prLink;

                // conversation_id = response.id 임
                // MessageFactory.text("PR이 발생했습니다!")
                const card = bot.renderAdaptiveCard(rawNotificationCard);
                const result = await connectorClient.conversations.sendToConversation(conversation_id, { attachments: [card] });
            } else {
                return res.send(404, { message: 'user not found' });
            }
        } catch (error) {
            console.error(error);
            return res.send(500, { message: JSON.stringify(error) });
        }
    }
    return res.send(200, { message: "No error occurred." });;
});

// Gracefully shutdown HTTP server
["exit", "uncaughtException", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"].forEach((event) => {
    process.on(event, () => {
        server.close();
    });
});
