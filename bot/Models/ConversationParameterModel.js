class ConversationParameterModel {
    constructor() {
        /** 그룹챗에 보낼건지 단독 챗에보낼건지 */
        this.isGroup = false;
        this.channelData = {
            tenant: {
                id: ''
            }
        };

        this.bot = {
            id: '',
            name: ''
        };

        this.members = [];
    }

    configureParameter(tenantId, bot_id, bot_name, user_id, user_name, isGroup = false) {
        this.isGroup = isGroup;
        this.channelData.tenant.id = tenantId;

        this.bot.id = bot_id;
        this.bot.name = bot_name;

        this.members.push({
            id: user_id,
            name: user_name
        });
    }

    getConversationParameter() {
        return {
            isGroup: this.isGroup,
            channelData: {
                tenant: {
                    id: this.channelData.tenant.id
                }
            },
            bot: {
                id: this.bot.id,
                name: this.bot.name
            },
            members: this.members
        };
    }
}

module.exports = ConversationParameterModel
