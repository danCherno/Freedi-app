import { useEffect, useState } from "react";

// Third party imports
import { Outlet, useLocation, useParams } from "react-router-dom";

// Redux Store
import HomeHeader from "./HomeHeader";
import { getNewStatementsFromSubscriptions, listenToStatementSubscriptions } from "@/controllers/db/subscriptions/getSubscriptions";
import { useAppSelector } from "@/controllers/hooks/reduxHooks";
import { userSelector } from "@/model/users/userSlice";

// Helpers

// Custom Components

interface ListenedStatements {
	unsubFunction: () => void;
	statementId: string;
}

export const listenedStatements: Array<ListenedStatements> = [];

export default function Home() {
	// Hooks
	const { statementId } = useParams();
	const location = useLocation();

	// Redux Store
	const user = useAppSelector(userSelector);

	// Use States
	const [displayHeader, setDisplayHeader] = useState(true);

	useEffect(() => {
		if (location.pathname.includes("addStatement") || statementId) {
			setDisplayHeader(false);
		} else {
			setDisplayHeader(true);
		}
	}, [location]);

	useEffect(() => {

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let unsubscribe: () => void = () => { };
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let updatesUnsubscribe: () => void = () => { };
		try {
			if (user) {
				unsubscribe = listenToStatementSubscriptions(30);
				updatesUnsubscribe = getNewStatementsFromSubscriptions();
			}
		} catch (error) { }

		return () => {
			if (unsubscribe) {
				unsubscribe();
				listenedStatements.forEach((ls) => {
					ls.unsubFunction();
				});
			}
			if (updatesUnsubscribe) {
				updatesUnsubscribe();
			}
		};
	}, [user]);

	return (
		<main className="page slide-in">
			{displayHeader && <HomeHeader />}     
			<Outlet />
		</main>
	);
}
