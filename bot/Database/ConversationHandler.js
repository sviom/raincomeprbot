const sql = require('mssql');
const KeyVaultHelper = require("../Helper/AzureKeyVaultHelper");
const ConversationModel = require('../Models/ConversationModel');

/**
 * Conversation 을 DB에 저장하는 핸들러
 */
class ConversationHandler {
    /**
     * DB에 저장
     * @param {Object} conversationObject conversation 정보 통째로
     * @param {String} email 사용자 이메일 정보
     */
    async UpsertConversation(conversationObject, email = null) {
        try {
            const helper = new KeyVaultHelper();
            const connection_string = await helper.GetKeyVaultSecret();
            await sql.connect(connection_string);

            var conversationModel = new ConversationModel(email);
            conversationModel.setConversationObject(
                conversationObject.bot.id,
                conversationObject.bot.name,
                conversationObject.conversation.conversationType,
                conversationObject.conversation.id,
                conversationObject.conversation.tenantId,
                conversationObject.serviceUrl,
                conversationObject.user.id,
                conversationObject.user.aadObjectId,
                conversationObject.user.name
            );

            const getResult = await this.GetUserConversation(conversationModel.user.aadObjectId);
            if (getResult.length <= 0) {
                let query = `
                    INSERT INTO Conversations
                    (BotId, BotName, ConversationType, ConversationId, UserId, UserAADId, UserName, Email, ServiceUrl)
                    VALUES
                    (
                        @BotId,
                        @BotName,
                        @ConversationType,
                        @ConversationId,
                        @UserId,
                        @UserAADId,
                        @UserName,
                        @Email,
                        @ServiceUrl
                    );
                `;

                const request = new sql.Request();
                request.input('BotId', sql.NVarChar(300), conversationObject.bot.id);
                request.input('BotName', sql.NVarChar(100), conversationObject.bot.name);
                request.input('ConversationType', sql.NVarChar(50), conversationObject.conversation.conversationType);
                request.input('ConversationId', sql.NVarChar(300), conversationObject.conversation.id);
                request.input('UserId', sql.NVarChar(300), conversationObject.user.id);
                request.input('UserAADId', sql.UniqueIdentifier, conversationObject.user.aadObjectId);
                request.input('UserName', sql.NVarChar(200), conversationObject.user.name);
                request.input('Email', sql.NVarChar(100), email);
                request.input('ServiceUrl', sql.NVarChar(300), conversationObject.conversation.serviceUrl);

                request.query(query, (err, result) => {
                    console.dir(result)
                });
            } else {
                console.log("ddd");
                await this.UpdatetUserConversation(conversationModel, email);
            }
        } catch (err) {
            console.error("insert error : ", err)
        }
    }

    /**
     *
     * @param {String} UserAAdId Azure AD guid
     * @returns 배열
     */
    async GetUserConversation(UserAAdId, Email = '') {
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
            const helper = new KeyVaultHelper();
            const connection_string = await helper.GetKeyVaultSecret();
            // await sql.connect(connection_string);
            sql.connect(connection_string).then(() => {
                let query = `
                SELECT
                    *
                FROM Conversations
                WHERE UserAADId = @UserAAdId OR Email = @Email
            `;

                const request = new sql.Request();
                request.input('UserAADId', sql.UniqueIdentifier, UserAAdId);
                request.input('Email', sql.NVarChar(100), Email);
                request.query(query, (err, result) => {
                    // console.dir(result)
                    const queryResult = result.recordset;
                    if (queryResult.length > 0) {
                        const userConversation = queryResult[0];
                        let model = new ConversationModel();
                        model.bot.id = userConversation.BotId;
                        model.bot.name = userConversation.BotName;
                        model.user.id = userConversation.UserId;
                        model.user.aadObjectId = userConversation.UserAADId;
                        model.user.name = userConversation.UserName;
                        model.conversation.id = userConversation.ConversationId;
                        model.conversation.conversationType = userConversation.ConversationType;
                        model.email = userConversation.Email;
                        model.serviceUrl = userConversation.ServiceUrl;

                        returnObject.data = model;
                    }
                    returnObject.length = queryResult.length;
                });
            });
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
            const helper = new KeyVaultHelper();
            const connection_string = await helper.GetKeyVaultSecret();
            await sql.connect(connection_string);

            let query = `
                UPDATE Conversations
                SET
                    BotId = @BotId,
                    BotName = @BotName,
                    ConversationType = @ConversationType,
                    ConversationId = @ConversationId,
                    Email = @Email,
                    UserId = @UserId,
                    UserName = @UserName,
                    UpdatedTime = @UpdatedTime,
                    ServiceUrl = @ServiceUrl
                WHERE UserAADId = @UserAADId
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
            request.input('UserAADId', sql.UniqueIdentifier, conversationObject.user.aadObjectId);
            request.input('ServiceUrl', sql.NVarChar(300), conversationObject.serviceUrl);

            request.query(query, (err, result) => {
                console.dir(result)
            });
        } catch (err) {
            console.error("update error : ", err);
        }
    }
}
module.exports = ConversationHandler;
