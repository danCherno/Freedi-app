import { QuestionStage, Statement } from 'delib-npm';
import { FC, useContext, useEffect, useState } from 'react';

// Third party imports

// Redux
// import CreateStatementModalSwitch from '../createStatementModalSwitch/CreateStatementModalSwitch';
import StatementBottomNav from '../nav/bottom/StatementBottomNav';
import { getStagesInfo } from '../settings/components/QuestionSettings/QuestionStageRadioBtn/QuestionStageRadioBtn';
import StatementInfo from './components/info/StatementInfo';
import VotingArea from './components/votingArea/VotingArea';
import { getTotalVoters } from './statementVoteCont';
import HandIcon from '@/assets/icons/handIcon.svg?react';
import X from '@/assets/icons/x.svg?react';
import { getToVoteOnParent } from '@/controllers/db/vote/getVotes';
import { useAppDispatch } from '@/controllers/hooks/reduxHooks';

// Statements helpers
import { setVoteToStore } from '@/model/vote/votesSlice';

// Custom components
import Button from '@/view/components/buttons/button/Button';
import Modal from '@/view/components/modal/Modal';
import './StatementVote.scss';

// Helpers
import Toast from '@/view/components/toast/Toast';
import { useLanguage } from '@/controllers/hooks/useLanguages';
import { StatementContext } from '../../StatementCont';

let getVoteFromDB = false;

const StatementVote: FC = () => {
	// * Hooks * //
	const dispatch = useAppDispatch();
	const { t } = useLanguage();
	const { statement } = useContext(StatementContext);
	const subStatements: Statement[] = [];

	const currentStage = statement?.questionSettings?.currentStage;
	const isCurrentStageVoting = currentStage === QuestionStage.voting;
	const stageInfo = getStagesInfo(currentStage);
	const toastMessage = stageInfo ? stageInfo.message : '';
	// const useSearchForSimilarStatements =
	// 	statement?.statementSettings?.enableSimilaritiesSearch || false;

	// * Use State * //
	const [showMultiStageMessage, setShowMultiStageMessage] =
		useState(isCurrentStageVoting);
	const [isCreateStatementModalOpen] =
		useState(false);
	const [isStatementInfoModalOpen, setIsStatementInfoModalOpen] =
		useState(false);
	const [statementInfo, setStatementInfo] = useState<Statement | null>(null);

	// * Variables * //
	const totalVotes = getTotalVoters(statement);

	useEffect(() => {
		if (!getVoteFromDB) {
			getToVoteOnParent(statement?.statementId, updateStoreWithVoteCB);
			getVoteFromDB = true;
		}
	}, []);

	function updateStoreWithVoteCB(option: Statement) {
		dispatch(setVoteToStore(option));
	}

	return (
		<>
			<div className='page__main'>
				<div className='statement-vote'>
					{showMultiStageMessage && (
						<Toast
							text={t(`${toastMessage}`)}
							type='message'
							show={showMultiStageMessage}
							setShow={setShowMultiStageMessage}
						>
							<Button
								text={t('Got it')}
								iconOnRight={true}
								icon={<X />}
								bckColor='var(--crimson)'
								color='var(--white)'
								onClick={() => setShowMultiStageMessage(false)}
							/>
						</Toast>
					)}
					<div className='number-of-votes-mark'>
						<HandIcon /> {totalVotes}
					</div>
					<VotingArea
						totalVotes={totalVotes}
						setShowInfo={setIsStatementInfoModalOpen}
						subStatements={subStatements}
						setStatementInfo={setStatementInfo}
					/>
				</div>

				{isCreateStatementModalOpen && (
					null
					// <CreateStatementModalSwitch
					// 	allowedTypes={[StatementType.option]}
					// 	isMultiStage={isMuliStage}
					// 	useSimilarStatements={useSearchForSimilarStatements}
					// 	parentStatement={statement}
					// 	isQuestion={false}
					// 	setShowModal={setIsCreateStatementModalOpen}

					// />
				)}
				{isStatementInfoModalOpen && (
					<Modal>
						<StatementInfo
							statement={statementInfo}
							setShowInfo={setIsStatementInfoModalOpen}
						/>
					</Modal>
				)}
			</div>
			<div className='page__footer'>
				<StatementBottomNav />
			</div>
		</>
	);
};

export default StatementVote;
