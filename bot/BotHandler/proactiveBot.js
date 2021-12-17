const { ActivityHandler, TurnContext, TeamsInfo, MessageFactory, CardFactory } = require('botbuilder');
// const { TeamsActivityHandler, CardFactory, TurnContext, TeamsInfo,
//     ActionTypes,
//     Channels,
//     MessageFactory } = require("botbuilder");
var ProactiveAppIntallationHelper = require('../Helper/ProactiveAppIntallationHelper');
const fs = require("fs");
const ConversationHandler = require("../Database/ConversationHandler");
const rawWelcomeCard = require("../adaptiveCards/welcome.json");
const rawLearnCard = require("../adaptiveCards/learn.json");
const ACData = require("adaptivecards-templating");

class ProactiveBot extends ActivityHandler {
    constructor(conversationReferences) {
        super();
        this.conversationReferences = conversationReferences;

        this.onConversationUpdate(async (context, next) => {
            await this.addConversationReference(context.activity);
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            console.log("member added : ", membersAdded);
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await this.addConversationReference(context.activity);
                }
            }

            // 최초 사용자에게 웰컴 메시지 보내기
            const card = this.renderAdaptiveCard(rawWelcomeCard);
            await context.sendActivity({ attachments: [card] });

            await next();
        });

        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            const text = context.activity.text.trim().toLocaleLowerCase();
            if (text.includes('install')) {
                await this.InstallAppInTeamsAndChatMembersPersonalScope(context);
            } else if (text.includes('send')) {
                await this.SendNotificationToUsersAsync(context);
            }


            // 아무 텍스트나 들어와도 안내메시지 보내기 및 Conversation Update
            const card = this.renderAdaptiveCard(rawLearnCard);
            await context.sendActivity({ attachments: [card] });
            await this.addConversationReference(context.activity);
        });

        this.onInstallationUpdate(async (context, next) => {
            await this.addConversationReference(context.activity);
        });
    }

    async InstallAppInTeamsAndChatMembersPersonalScope(context) {
        let NewAppInstallCount = 0;
        let ExistingAppInstallCount = 0;
        let result = "";
        const objProactiveAppIntallationHelper = new ProactiveAppIntallationHelper();
        const TeamMembers = await TeamsInfo.getPagedMembers(context);
        let Count = TeamMembers.members.map(async member => {
            if (!this.conversationReferences[member.aadObjectId]) {
                result = await objProactiveAppIntallationHelper.InstallAppInPersonalScope(context.activity.conversation.tenantId, member.aadObjectId);
            }
            return result;
        });
        (await Promise.all(Count)).forEach(function (Status_Code) {
            if (Status_Code == 409) ExistingAppInstallCount++;
            else if (Status_Code == 201) NewAppInstallCount++;
        });
        await context.sendActivity(MessageFactory.text("Existing: " + ExistingAppInstallCount + " \n\n Newly Installed: " + NewAppInstallCount));
    }

    async SendNotificationToAllUsersAsync(context) {
        const TeamMembers = await TeamsInfo.getPagedMembers(context);
        let Sent_msg_Cout = TeamMembers.members.length;
        TeamMembers.members.map(async member => {
            const ref = TurnContext.getConversationReference(context.activity);
            ref.user = member;
            await context.adapter.createConversation(ref, async (context) => {
                const ref = TurnContext.getConversationReference(context.activity);
                await context.adapter.continueConversation(ref, async (context) => {
                    await context.sendActivity("Proactive hello.");
                });
            });
        });
        await context.sendActivity(MessageFactory.text("Message sent:" + Sent_msg_Cout));
    }

    async SendNotificationToUsersAsync(context) {
        const sample_user_id = process.env["SAMPLE_USER_ID"];
        const member = await TeamsInfo.getMember(context, sample_user_id);
        const ref = TurnContext.getConversationReference(context.activity);
        ref.user = member;
        await context.adapter.createConversation(ref, async (context) => {
            const ref = TurnContext.getConversationReference(context.activity);
            await context.adapter.continueConversation(ref, async (context) => {
                await context.sendActivity("Proactive hello.");
            });
        });
        await context.sendActivity(MessageFactory.text("Message sent:"));
    }

    // Bind AdaptiveCard with data
    renderAdaptiveCard(rawCardTemplate, dataObj) {
        const cardTemplate = new ACData.Template(rawCardTemplate);
        const cardWithData = cardTemplate.expand({ $root: dataObj });
        const card = CardFactory.adaptiveCard(cardWithData);
        return card;
    }

    async addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        const userId = conversationReference.user.aadObjectId;
        if (!this.conversationReferences[userId])
            this.conversationReferences[userId] = conversationReference;

        // fs.writeFile(`./converstaion_${userId}.txt`, JSON.stringify(conversationReference), (error) => {
        //     console.log("error : ", error);
        // });

        const handler = new ConversationHandler();
        await handler.UpsertConversation(conversationReference);
    }
}
module.exports.ProactiveBot = ProactiveBot;
