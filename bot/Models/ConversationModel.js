class ConversationModel {
    /**
     * @param {String} email 사용자 이메일 정보
     */
    constructor(email) {
        this.email = email;
        this.timestamp = new Date();
        // this.channelId = channelId;
        // this.promptedUserForName = promptedUserForName;

        /** 봇 정보 */
        this.bot = {
            /** 28:{AAD application id} */
            id: '',
            /** bot name */
            name: ''
        };

        /** 봇과의 대화 정보 */
        this.conversation = {
            /** personal or channel */
            conversationType: '',
            /** a:{암호화문자열} */
            id: '',
            /** office 365 tenant id */
            tenantId: ''
        };

        /** 봇이 대답을 어느 곳으로 보낼지 콜백 url */
        this.serviceUrl = "";

        /** 메시지를 보낼 사용자 정보 */
        this.user = {
            /** AAD user guid */
            aadObjectId: '',
            /** 29:{암호화문자열} */
            id: '',
            /** 사용자이름 */
            name: ''
        };
    }

    setConversationObject(bot_id, bot_name, conv_type, conv_id, conv_tenant_id, service_url, user_id, user_object_id, user_name) {
        this.bot.id = bot_id;
        this.bot.name = bot_name;
        this.conversation.conversationType = conv_type;
        this.conversation.id = conv_id;
        this.conversation.tenantId = conv_tenant_id;
        this.serviceUrl = service_url;
        this.user.id = user_id;
        this.user.aadObjectId = user_object_id;
        this.user.name = user_name;
    }
}

module.exports = ConversationModel
