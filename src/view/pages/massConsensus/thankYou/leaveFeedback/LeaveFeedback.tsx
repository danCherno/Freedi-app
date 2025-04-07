import { MailIcon } from 'lucide-react';
import TitleMassConsensus from '../../TitleMassConsensus/TitleMassConsensus';
import FooterMassConsensus from '../../footerMassConsensus/FooterMassConsensus';
import styles from './LeaveFeedback.module.scss';
import { useUserConfig } from '@/controllers/hooks/useUserConfig';
import { useLeaveFeedback } from './LeaveFeedbackVM';
import { useHeader } from '../../headerMassConsensus/HeaderContext';
import { useEffect } from 'react';

function LeaveFeedback(setState) {
	const { t } = useUserConfig();
	const { handleSendButton, handleEmailChange, mailStatus } =
		useLeaveFeedback(setState);

	const { setHeader } = useHeader();

	useEffect(() => {
		setHeader({
			title: t('Sign up'),
			backToApp: false,
			isIntro: false,
			setHeader,
		});
	}, []);

	return (
		<div>
			<TitleMassConsensus title={t('Thank you for your participation')} />
			<div className={styles.feedback}>
				<p>{t('Please leave your email to receive updates')}</p>
				<div className={styles.input}>
					<input
						placeholder={t('Mail')}
						type='email'
						name='email'
						onChange={handleEmailChange}
						onKeyUp={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleSendButton();
							}
						}}
					/>
					<span>
						{' '}
						{mailStatus === 'invalid'
							? t('Invalid email')
							: null}{' '}
					</span>
					<MailIcon />
				</div>
			</div>
			<FooterMassConsensus
				isNextActive={true}
				onNext={handleSendButton}
				ifFeedback={() => setState("skipped")}
				blockNavigation={true}
			/>
			<div style={{ textAlign: 'center', marginTop: '1rem' }}>
				<a
					href='https://freedi.co'
					target='_blank'
					style={{ color: 'var(--text-blue)' }}
				>
					{t('Yours FreeDi')}
				</a>
			</div>
		</div>
	);
}

export default LeaveFeedback;
