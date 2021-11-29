const sql = require('mssql');
const ConversationModel = require('../Models/ConversationModel');
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
    async InsertConversation(conversationObject, email = null) {
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
                    (BotId, BotName, ConversationType, ConversationId, UserId, UserName, Email)
                    VALUES
                    (
                        @BotId,
                        @BotName,
                        @ConversationType,
                        @ConversationId,
                        @UserId,
                        @UserName,
                        @Email
                    );
                `;

                const request = new sql.Request();
                request.input('BotId', sql.NVarChar(300), conversationObject.bot.id);
                request.input('BotName', sql.NVarChar(100), conversationObject.bot.name);
                request.input('ConversationType', sql.NVarChar(50), conversationObject.conversation.conversationType);
                request.input('ConversationId', sql.NVarChar(300), conversationObject.conversation.id);
                request.input('UserId', sql.NVarChar(300), conversationObject.user.id);
                // request.input('UserAADId', sql.UniqueIdentifier, conversationObject.user.aadObjectId);
                request.input('UserName', sql.NVarChar(200), conversationObject.user.name);
                request.input('Email', sql.NVarChar(100), email);

                request.query(query, (err, result) => {
                    console.dir(result)
                });
            } else {
                await this.UpdatetUserConversation(conversationModel);
            }
        } catch (err) {
            console.error("insert error : ", err)
        }
    }

    /**
     *
     * @param {String} UserEmail Azure AD guid
     * @returns 배열
     */
    async GetUserConversation(UserEmail) {
        let returnObject = {
            /**
             * Conversation 정보
             * @type {ConversationModel}
             */
            data: {},
            /** 갯수 */
            length: 0
        }

        try {
            await sql.connect(connection_string);

            let query = `
                SELECT
                    *
                FROM Conversations
                WHERE Email = '${UserEmail}'
            `;

            const result = await sql.query(query);
            const queryResult = result.recordset;
            if (queryResult.length > 0) {
                const userConversation = queryResult[0];
                let model = new ConversationModel();
                model.bot.id = userConversation.BotId;
                model.bot.name = userConversation.BotName;
                model.user.id = userConversation.UserId;
                // model.user.aadObjectId = userConversation.UserAADId;
                model.user.name = userConversation.UserName;
                model.conversation.id = userConversation.ConversationId;
                model.conversation.conversationType = userConversation.ConversationType;
                model.email = userConversation.Email;

                returnObject.data = model;
            }
            returnObject.length = queryResult.length;
        } catch (err) {
            // ... error checks
            console.error(err);
        }
        return returnObject;
    }

    /**
     * 업데이트
     * @param {ConversationModel} conversationObject
     */
    async UpdatetUserConversation(conversationObject, email = null) {
        try {
            await sql.connect(connection_string);

            let query = `
                UPDATE Conversations
                SET
                    BotId = @BotId,
                    BotName = @BotName,
                    ConversationType = @ConversationType,
                    ConversationId = @ConversationId,
                    UserId = @UserId,
                    UserName = @UserName,
                    UpdatedTime = @UpdatedTime
                WHERE Email = @Email
            `;

            const request = new sql.Request();
            request.input('BotId', sql.NVarChar(300), conversationObject.bot.id);
            request.input('BotName', sql.NVarChar(100), conversationObject.bot.name);
            request.input('ConversationType', sql.NVarChar(50), conversationObject.conversation.conversationType);
            request.input('ConversationId', sql.NVarChar(300), conversationObject.conversation.id);
            request.input('UserId', sql.NVarChar(300), conversationObject.user.id);
            request.input('UserName', sql.NVarChar(200), conversationObject.user.name);
            request.input('Email', sql.NVarChar(100), email);
            request.input('UpdatedTime', sql.DateTime, new Date());
            // request.input('UserAADId', sql.UniqueIdentifier, conversationObject.user.aadObjectId);

            request.query(query, (err, result) => {
                console.dir(result)
            });
        } catch (err) {
            console.error("update error : ", err);
        }
    }
}
module.exports = ConversationHandler;
