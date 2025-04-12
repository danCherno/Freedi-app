import Loader from '@/view/components/loaders/Loader';
import InitialQuestion from "./initialQuestion/InitialQuestion";
import useMassConsensusQuestion from "./MassConsesusQuestionVM"
import SimilarSuggestions from "./similarSuggestions/SimilarSuggestions";
import FooterMassConsensus from '../footerMassConsensus/FooterMassConsensus';
import { useNavigate, useParams } from 'react-router';
import { getStepNavigation, useMassConsensusSteps } from '../MassConsensusVM';

const MassConsensusQuestion = () => {
    const { stage, updateStage, handleNext, ifButtonEnabled, setIfButtonEnabled } = useMassConsensusQuestion();
    const navigate = useNavigate();
    const { statementId } = useParams<{ statementId: string }>();
    const { steps, currentStep } = useMassConsensusSteps();
    const { nextStep } = getStepNavigation(steps, currentStep);
    
    return (
        <>
            { (stage === "question" || (stage === "loading"))?
             <InitialQuestion stage={stage} updateStage={updateStage} setIfButtonEnabled={setIfButtonEnabled} /> 
             : <SimilarSuggestions stage={stage} setIfButtonEnabled={setIfButtonEnabled}/> }

            { (stage === "loading" || stage === "submitting")? <Loader/> : null }
             
            <FooterMassConsensus
				onNext={handleNext}
				isNextActive={ifButtonEnabled}
                blockNavigation={true}
                onSkip={() => navigate(`/mass-consensus/${statementId}/${nextStep}`)}
			/>
        </>
    )
}

export default MassConsensusQuestion