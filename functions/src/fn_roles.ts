import { logger } from 'firebase-functions/v1';
import { db } from './index';
import {
	getStatementSubscriptionId,
	StatementSubscription,
	StatementSubscriptionSchema,
} from '../../src/types/statement/subscription';
import { Role } from '../../src/types/user';
import { Collections } from '../../src/types/enums';
import { parse } from 'valibot';

export async function setAdminsToNewStatement(ev: any) {
	//Caution: This function grants administrative privileges to statement creators throughout the entire statement hierarchy. This approach has potential drawbacks:

	//Administrative Overhead: Exponentially increasing admin counts can strain database resources.
	//Security Concerns: Grants broad access privileges to potentially non-top-level admins.

	//Recommendations:
	//Re-evaluate Authorization Model: Consider a more fine-grained permission system that prevents excessive admin proliferation.
	//Future Enhancement: Implement a more scalable and secure solution for managing administrative rights.
	// Tal Yaron, Deliberation Team, 3rd May 2024

	try {
		//get parent statement ID
		const statement = ev.data.data();

		//subscribe the creator to the new statement
		const newStatementSubscriptionId = getStatementSubscriptionId(
			statement.statementId,
			statement.creator
		);
		if (!newStatementSubscriptionId)
			throw new Error('No newStatementSubscriptionId');
		const newSubscription: StatementSubscription = {
			statementId: statement.statementId,
			userId: statement.creatorId,
			role: Role.admin,
			lastUpdate: Date.now(),
			statement,
			statementsSubscribeId: newStatementSubscriptionId,
			notification: false,
			user: statement.creator,
			userAskedForNotification: false,
		};
		parse(StatementSubscriptionSchema, newSubscription);

		await db
			.collection(Collections.statementsSubscribe)
			.doc(newStatementSubscriptionId)
			.set(newSubscription);

		const { parentId } = statement;

		//get all admins of the parent statement
		const adminsDB = await db
			.collection(Collections.statementsSubscribe)
			.where('statementId', '==', parentId)
			.where('role', '==', Role.admin)
			.get();
		const adminsSubscriptions = adminsDB.docs.map((doc: any) => doc.data());

		//subscribe the admins to the new statement
		adminsSubscriptions.forEach(async (adminSub: StatementSubscription) => {
			try {
				const statementsSubscribeId = getStatementSubscriptionId(
					statement.statementId,
					adminSub.user
				);
				if (!statementsSubscribeId) throw new Error('No statementsSubscribeId');

				const newSubscription: StatementSubscription = {
					statementId: statement.statementId,
					userId: adminSub.userId,
					role: Role.admin,
					lastUpdate: Date.now(),
					statement,
					statementsSubscribeId,
					notification: adminSub.notification || false,
					user: adminSub.user,
					userAskedForNotification: adminSub.userAskedForNotification || false,
				};

				const result = parse(StatementSubscriptionSchema, newSubscription);

				await db
					.collection(Collections.statementsSubscribe)
					.doc(statementsSubscribeId)
					.set(newSubscription);
			} catch (error) {
				logger.error(
					'In setAdminsToNewStatement, on subscribe the admins to the new statement'
				);
				logger.error(error);
			}
		});
	} catch (error) {
		logger.error(error);
	}
}
