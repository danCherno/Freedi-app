import { Screen, Statement, StatementType } from 'delib-npm';
import { FC, useEffect, useRef, useState } from 'react';

// Third Party

// Redux Store
import { useParams } from 'react-router-dom';
import StatementChatMore from '../../../../chat/components/StatementChatMore';
import CreateStatementModal from '../../../../createStatementModal/CreateStatementModal';
import { sortSubStatements } from '../../../statementsEvaluationCont';
import Evaluation from '../../evaluation/Evaluation';
import SolutionMenu from '../../solutionMenu/SolutionMenu';
import AddQuestionIcon from '@/assets/icons/addQuestion.svg?react';
import { setStatementIsOption } from '@/controllers/db/statements/setStatements';
import { isAuthorized } from '@/controllers/general/helpers';
import { useAppDispatch, useAppSelector } from '@/controllers/hooks/reduxHooks';
import { useLanguage } from '@/controllers/hooks/useLanguages';
import useStatementColor, {
	StyleProps,
} from '@/controllers/hooks/useStatementColor';
import {
	setStatementElementHight,
	statementSubscriptionSelector,
} from '@/model/statements/statementsSlice';

// Helpers

// Hooks

// Custom Components

import EditTitle from '@/view/components/edit/EditTitle';

import IconButton from '@/view/components/iconButton/IconButton';
import './SuggestionCard.scss';

interface Props {
	statement: Statement | undefined;
	siblingStatements: Statement[];
	parentStatement: Statement | undefined;
}

const SuggestionCard: FC<Props> = ({
	parentStatement,
	siblingStatements,
	statement,
}) => {
	// Hooks
	if (!parentStatement) console.error('parentStatement is not defined');

	const { t, dir } = useLanguage();
	const { sort } = useParams();

	// Redux Store
	const dispatch = useAppDispatch();

	const statementSubscription = useAppSelector(
		statementSubscriptionSelector(statement?.statementId)
	);

	// Use Refs
	const elementRef = useRef<HTMLDivElement>(null);

	// Use States

	const [isEdit, setIsEdit] = useState(false);
	const [shouldShowAddSubQuestionModal, setShouldShowAddSubQuestionModal] =
		useState(false);
	const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);

	useEffect(() => {
		if (sort !== Screen.OPTIONS_RANDOM && sort !== Screen.QUESTIONS_RANDOM) {
			sortSubStatements(siblingStatements, sort, 30);
		}
	}, [statement?.consensus]);

	useEffect(() => {
		sortSubStatements(siblingStatements, sort, 30);
	}, [statement?.elementHight]);



	if (!statement) return null;

	const _isAuthorized = isAuthorized(
		statement,
		statementSubscription,
		parentStatement?.creatorId
	);

	const statementColor: StyleProps = useStatementColor({
		statement
	});


	useEffect(() => {
		const element = elementRef.current;
		if (element) {
			setTimeout(() => {
				dispatch(
					setStatementElementHight({
						statementId: statement.statementId,
						height: elementRef.current?.clientHeight,
					})
				);
			}, 0);
		}
	}, [elementRef.current?.clientHeight]);


	function handleSetOption() {
		try {
			if (statement?.statementType === 'option') {
				const cancelOption = window.confirm(
					'Are you sure you want to cancel this option?'
				);
				if (cancelOption) {
					setStatementIsOption(statement);
				}
			} else {
				setStatementIsOption(statement);
			}
		} catch (error) {
			console.error(error);
		}
	}

	const statementAge = new Date().getTime() - statement.createdAt;

	return (
		<div
			className={
				statementAge < 10000
					? 'statement-evaluation-card statement-evaluation-card--new'
					: 'statement-evaluation-card'
			}
			style={{
				top: `${statement.top || 0}px`,
				borderLeft: `8px solid ${statement.isChosen ? "var(--approve)" : statementColor.backgroundColor || 'white'}`,
				color: statementColor.color,
				flexDirection: dir === 'ltr' ? 'row' : 'row-reverse',
			}}
			ref={elementRef}
			id={statement.statementId}
		>
			<div
				className='selected-option'
				style={{
					backgroundColor: statement.selected === true
						? "var(--approve)"
						: '',
				}}
			>
				<div
					style={{
						color: statementColor.color,
						display: statement.selected ? 'block' : 'none',
					}}
				>
					{t('Selected')}
				</div>
			</div>
			<div className='main'>
				<div className='info'>
					<div className='text'>
						<EditTitle
							statement={statement}
							isEdit={isEdit}
							setEdit={setIsEdit}
							isTextArea={true}
						/>
					</div>
					<div className='more'>
						<SolutionMenu
							statement={statement}
							isAuthorized={_isAuthorized}
							isCardMenuOpen={isCardMenuOpen}
							setIsCardMenuOpen={setIsCardMenuOpen}
							isEdit={isEdit}
							setIsEdit={setIsEdit}
							handleSetOption={handleSetOption}
						/>
					</div>
				</div>

				<div className='actions'>
					{statement.hasChildren && (
						<div className='chat chat-more-element'>
							<StatementChatMore statement={statement} />
						</div>
					)}
					<div className='evolution-element'>
						<Evaluation
							parentStatement={parentStatement}
							statement={statement}
						/>
					</div>
					{parentStatement?.hasChildren && (
						<IconButton
							className='add-sub-question-button more-question'
							onClick={() => setShouldShowAddSubQuestionModal(true)}
						>
							<AddQuestionIcon />
						</IconButton>
					)}
				</div>
				{shouldShowAddSubQuestionModal && (
					<CreateStatementModal
						allowedTypes={[StatementType.question]}
						parentStatement={statement}
						isOption={false}
						setShowModal={setShouldShowAddSubQuestionModal}
					/>
				)}
			</div>
		</div>
	);
};

export default SuggestionCard;
