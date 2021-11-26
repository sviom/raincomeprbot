
class ConversationModel {
    constructor(email, name, timestamp, channelId, promptedUserForName) {
        this.email = email;
        this.Name = name;
        this.timestamp = timestamp;
        this.channelId = channelId;
        this.promptedUserForName = promptedUserForName;

        this.bot = {
            id: '',
            name: ''
        };
        this.converstaion = {
            conversationType: '',
            id: '',
            tenantId: ''
        };

        /**
         * dfdfd
         */
        this.user = {
            aadObjectId: '',
            id: '',
            name
        };
    }
}

module.exports = ConversationModel
