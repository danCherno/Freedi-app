import { useUserConfig } from '@/controllers/hooks/useUserConfig';
import styles from './ThankYou.module.scss';
import Dove from '@/assets/images/SubscriptionThanks.png';
import LeaveFeedback from './leaveFeedback/LeaveFeedback';
import { useState } from 'react';

const ThankYou = () => {
    const { t } = useUserConfig();
    const [ state, setState ] = useState<"feedback" | "submited" | "skipped">("feedback");

    return (
        <>
            { (state === "feedback")? <LeaveFeedback setstate={setState}/> :
            <div className={styles.thanks}>
                <img src={Dove} alt="a dove that says thanks" />
                {(state === "submited")? 
                <>
                    <h2>{t("Thank you for the registration")}</h2>
                    <p>{t("You have successfully registered to receive updates. We will send you a message when there is news.")}
                </p>
                </>: <h2>{t("Thank you!")}</h2>}
                <a href="https://freedi.co" className="btn btn--primary">{t("Back to home")}</a>
            </div>}
        </>
    )
}

export default ThankYou