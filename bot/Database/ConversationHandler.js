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

            var conversationModel = new ConversationModel(email);
            conversationModel.setConversationObject(
                conversationObject.bot.id,
                conversationObject.bot.name,
                conversationObject.conversation.conversationType,
                conversationObject.conversation.id,
                conversationObject.conversation.tenantId,
                conversationObject.user.id,
                conversationObject.user.aadObjectId,
                conversationObject.user.name
            );

            const getResult = await this.GetUserConversation(conversationModel.user.aadObjectId);
            if (getResult.length <= 0) {
                let query = `
                    INSERT INTO Conversations
                    (BotId, BotName, ConversationType, ConversationId, UserId, UserAADId, UserName, Email)
                    VALUES
                    (
                        '${conversationModel.bot.id}', '${conversationModel.bot.name}',
                        '${conversationModel.conversation.conversationType}', '${conversationModel.conversation.id}',
                        '${conversationModel.user.id}', '${conversationModel.user.aadObjectId}', '${conversationModel.user.name}',
                        'Email'
                    );
                `;
                const result = await sql.query(query);
            } else {
                await this.UpdatetUserConversation(conversationModel);
            }
        } catch (err) {
            console.log("err");
        }
    }

    /**
     *
     * @param {string} UserAADId Azure aad guid
     * @returns 배열
     */
    async GetUserConversation(UserAADId) {
        try {
            await sql.connect(connection_string);

            let query = `
                SELECT
                    *
                FROM Conversations
                WHERE UserAADId = '${UserAADId}'
            `;

            const result = await sql.query(query);

            const queryResult = result.recordset;
            console.log("dd");
            return queryResult;
        } catch (err) {
            // ... error checks
            console.error(err);
            return [];
        }
    }

    /**
     * 업데이트
     * @param {ConversationModel} conversationObject
     */
    async UpdatetUserConversation(conversationObject) {
        try {
            await sql.connect(connection_string);

            let query = `
                UPDATE Conversations
                SET
                    BotId = '${conversationObject.bot.id}',
                    BotName = '${conversationObject.bot.name}',
                    ConversationType = '${conversationObject.conversation.conversationType}',
                    ConversationId = '${conversationObject.conversation.id}',
                    UserId = '${conversationObject.user.id}',
                    UserName = '${conversationObject.user.name}'
                WHERE UserAADId = '${conversationObject.user.aadObjectId}'
            `;

            const result = await sql.query(query);
        } catch (err) {
            console.error("update error : ", err);
        }
    }
}
module.exports = ConversationHandler;
