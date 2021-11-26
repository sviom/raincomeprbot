const { TeamsActivityHandler, CardFactory, TurnContext, TeamsInfo,
    ActionTypes,
    Channels,
    MessageFactory } = require("botbuilder");
const rawWelcomeCard = require("../adaptiveCards/welcome.json");
const rawLearnCard = require("../adaptiveCards/learn.json");
const ACData = require("adaptivecards-templating");

class TeamsBot extends TeamsActivityHandler {
    constructor() {
        super();

        // record the likeCount
        this.likeCountObj = { likeCount: 0 };

        this.onMessage(async (context, next) => {
            console.log("Running with Message Activity.");
            let txt = context.activity.text;
            const removedMentionText = TurnContext.removeRecipientMention(
                context.activity
            );
            if (removedMentionText) {
                // Remove the line break
                txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
            }

            // Trigger command by IM text
            switch (txt) {
                case "welcome": {
                    const card = this.renderAdaptiveCard(rawWelcomeCard);
                    await context.sendActivity({ attachments: [card] });
                    break;
                }
                case "learn": {
                    this.likeCountObj.likeCount = 0;
                    const card = this.renderAdaptiveCard(rawLearnCard, this.likeCountObj);
                    await context.sendActivity({ attachments: [card] });
                    break;
                }
                /**
                 * case "yourCommand": {
                 *   await context.sendActivity(`Add your response here!`);
                 *   break;
                 * }
                 */
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id) {
                    const card = this.renderAdaptiveCard(rawWelcomeCard);
                    await context.sendActivity({ attachments: [card] });
                    break;
                }
            }
            await next();
        });
    }

    // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
    // method handles that event.
    async onAdaptiveCardInvoke(context, invokeValue) {
        // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
        if (invokeValue.action.verb === "userlike") {
            this.likeCountObj.likeCount++;
            const card = this.renderAdaptiveCard(rawLearnCard, this.likeCountObj);
            await context.updateActivity({
                type: "message",
                id: context.activity.replyToId,
                attachments: [card],
            });
            return { statusCode: 200 };
        }
    }

    // Bind AdaptiveCard with data
    renderAdaptiveCard(rawCardTemplate, dataObj) {
        const cardTemplate = new ACData.Template(rawCardTemplate);
        const cardWithData = cardTemplate.expand({ $root: dataObj });
        const card = CardFactory.adaptiveCard(cardWithData);
        return card;
    }


    sendMessageFromBitbucket = async (context, next) => {
        console.log("Running with Message Activity.");
        const card = this.renderAdaptiveCard(rawWelcomeCard);
        await context.sendActivity({ attachments: [card] });

        await next();
    }

    async getSingleMember(context) {
        try {
            const member = await TeamsInfo.getMember(
                context,
                context.activity.from.id
            );
            const message = MessageFactory.text(`You are: ${member.name}`);
            console.log("message");
            await context.sendActivity(message);
        } catch (e) {
            if (e.code === 'MemberNotFoundInConversation') {
                return context.sendActivity(MessageFactory.text('Member not found.'));
            } else {
                throw e;
            }
        }
    }
}


module.exports.TeamsBot = TeamsBot;
