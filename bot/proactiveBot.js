const { ActivityHandler, TurnContext, TeamsInfo, MessageFactory } = require('botbuilder');
var ProactiveAppIntallationHelper = require('./ProactiveAppIntallationHelper');

class ProactiveBot extends ActivityHandler {
    constructor(conversationReferences) {
        super();
        this.conversationReferences = conversationReferences;

        this.onConversationUpdate(async (context, next) => {
            this.addConversationReference(context.activity);
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    this.addConversationReference(context.activity);
                }
            }
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
        const member = await TeamsInfo.getMember(context, "57ba0d68-0e3f-44ac-9272-127cb2496043");
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

    addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        const userId = conversationReference.user.aadObjectId;
        if (!this.conversationReferences[userId])
            this.conversationReferences[userId] = conversationReference;
    }
}
module.exports.ProactiveBot = ProactiveBot;
