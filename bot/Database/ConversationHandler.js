const sql = require('mssql');
const ConversationModel = require('./ConversationModel');
const connection_string = 'Server=tcp:todaylunch.database.windows.net,1433;Initial Catalog=riaincome_noti_bot;Persist Security Info=False;User ID=lunchadmin;Password=0vnrvjwuTek!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;';

/**
 * Conversation 을 DB에 저장하는 핸들러
 */
class ConversationHandler {
    /**
     * DB에 저장
     * @param {Object} conversationObject conversation 정보 통째로
     * @param {String} email 사용자 이메일 정보
     */
    async InsertConversation(conversationObject, email = '') {
        try {
            await sql.connect(connection_string);

            // Name
            // Timestamp
            // ChannelId
            // PromptedUserForName
            var sss = new ConversationModel(email);

            sss.setConversationObject(
                conversationObject.bot.id,
                conversationObject.bot.name,
                conversationObject.conversation.conversationType,
                conversationObject.conversation.id,
                conversationObject.conversation.tenantId,
                conversationObject.user.id,
                conversationObject.user.aadObjectId,
                conversationObject.user.name
            );

            let query = `
                INSERT INTO Conversations
                (BotId, BotName, ConversationType, ConversationId, UserId, UserAADId, UserName, Email)
                VALUES
                (
                    '${sss.bot.id}', '${sss.bot.name}',
                    '${sss.conversation.conversationType}', '${sss.conversation.id}',
                    '${sss.user.id}', '${sss.user.aadObjectId}', '${sss.user.name}',
                    'Email'
                );
            `;
            const result = await sql.query(query);
            console.dir(result)
        } catch (err) {
            // ... error checks
        }
    }

    async GetUserConversation(userId) {
        try {
            await sql.connect(connection_string);

            const result = await sql.query`select * from mytable where id = ${value}`
            console.dir(result)
        } catch (err) {
            // ... error checks
        }
    }
}
module.exports = ConversationHandler;
