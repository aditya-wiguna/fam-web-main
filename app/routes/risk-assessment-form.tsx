import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, Button, TopNav, Alert, Progress, Radio } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { ProfileContext } from "../contexts";
import { useFormTemplateService, FormTemplateKey, type FormTemplate } from "../services";
import { useRiskProfileService } from "../services/useRiskProfileService";
import hourglassImage from "../assets/images/hourglass.png";

interface QuestionOption {
  id?: string;
  label?: string;
  value?: string;
  text?: string;
  points?: number;
  score?: number;
  config?: {
    value: string;
    label: string;
  };
}

interface Question {
  id: string;
  question: string;
  category?: string;
  note?: unknown;
  image?: { url?: string; note?: unknown };
  options?: QuestionOption[];
  answerConfig?: {
    options?: Array<{ config: { value: string; label: string } }>;
  };
}

export default function RiskAssessmentForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, updateRiskProfileData } = useContext(ProfileContext);
  const { getLatestPublished, loading: templateLoading, error: templateError } = useFormTemplateService();
  const { save, loading, error } = useRiskProfileService();
  
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [riskAnswer, setRiskAnswer] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveCalledRef = useRef(false);

  const mode = searchParams.get("mode") || "update";
  const productId = searchParams.get("productId");

  useEffect(() => {
    async function loadTemplate() {
      try {
        const result = await getLatestPublished(FormTemplateKey.AssessmentForm);
        setTemplate(result);
      } catch (e) {
        console.error("Error loading assessment template", e);
      }
    }
    loadTemplate();
  }, [getLatestPublished]);

  const getQuestionOptions = (question: Question): QuestionOption[] => {
    if (question.options && question.options.length > 0) {
      return question.options.map((opt) => ({
        value: opt.value || opt.id || "",
        label: opt.label || opt.text || "",
        points: opt.points || opt.score || 0,
      }));
    }
    if (question.answerConfig?.options) {
      return question.answerConfig.options.map((opt) => ({
        value: opt.config.value,
        label: opt.config.label,
        points: 0,
      }));
    }
    return [];
  };

  // Check if complete and save - using ref to prevent double execution
  useEffect(() => {
    async function checkComplete() {
      if (!template?.form?.questions || !profile?.id) return;
      if (saveCalledRef.current) return; // Prevent double save
      
      const totalSteps = template.form.questions.length;
      if (totalSteps > 0 && step === totalSteps) {
        saveCalledRef.current = true; // Mark as called
        
        // Calculate total score
        let totalScore = 0;
        template.form.questions.forEach((q) => {
          const question = q as Question;
          const answerValue = riskAnswer[question.id];
          const options = getQuestionOptions(question);
          const selectedAnswer = options.find((opt) => opt.value === answerValue);
          if (selectedAnswer?.points) {
            totalScore += selectedAnswer.points;
          }
        });

        const riskProfilePayload = {
          riskAnswer,
          riskAssessmentDate: new Date().toISOString(),
          riskScore: totalScore,
          templateId: template.id,
        };

        try {
          console.log("Saving risk profile...", riskProfilePayload);
          const riskProfileData = await save(profile.id, riskProfilePayload);
          console.log("Risk profile saved:", riskProfileData);
          
          // Update context
          updateRiskProfileData(riskProfileData);

          // Navigate after delay
          setTimeout(() => {
            if (mode === "subscribe" && productId) {
              navigate(`/fund/${productId}`, { replace: true });
            } else {
              const params = new URLSearchParams();
              if (mode) params.set("mode", mode);
              if (productId) params.set("productId", productId);
              navigate(`/risk-profile?${params.toString()}`, { replace: true });
            }
          }, 1500);
        } catch (e) {
          console.error("Error saving risk profile", e);
          saveCalledRef.current = false; // Reset on error to allow retry
        }
      }
    }
    checkComplete();
  }, [step, template, profile?.id, riskAnswer, save, updateRiskProfileData, navigate, mode, productId]);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      scrollToTop();
    } else {
      navigate(-1);
    }
  };

  const next = () => {
    setStep(step + 1);
    scrollToTop();
  };

  const questions = (template?.form?.questions || []) as Question[];
  const totalSteps = questions.length;
  const currentQuestion = questions[step] as Question | undefined;
  const answered = currentQuestion ? !!riskAnswer[currentQuestion.id] : false;

  const assessmentTitle = () => {
    return currentQuestion?.category || t("riskAssessment:heading.title");
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const options = getQuestionOptions(currentQuestion);

    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <P className="font-semibold">
            {step + 1}. {currentQuestion.question}
          </P>
        </div>

        {currentQuestion.image?.url && (
          <div className="flex justify-center mb-6">
            <img 
              src={currentQuestion.image.url} 
              alt="" 
              className="max-w-[320px] w-full object-contain"
            />
          </div>
        )}

        <div className="mb-6">
          <P className="text-gray-500 mb-4">
            {t("riskAssessment:text.selectAnswer")}
          </P>
          {options.map((option) => {
            const isSelected = riskAnswer[currentQuestion.id] === option.value;
            return (
              <Radio
                key={option.value}
                label={option.label}
                value={isSelected}
                onPress={() => {
                  setRiskAnswer({
                    ...riskAnswer,
                    [currentQuestion.id]: option.value || "",
                  });
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderComplete = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <H1 className="mb-4">{t("riskAssessment:text.complete")}</H1>
        <div className="my-4">
          <img 
            src={hourglassImage} 
            alt="Loading" 
            className="w-[50px] h-[72px] object-contain animate-pulse"
          />
        </div>
        <P className="font-semibold">{t("riskAssessment:text.calculate")}</P>
        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
            <Button onClick={() => { saveCalledRef.current = false; setStep(step); }} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <HighlightHeader>
        <TopNav allowBack inverse onBack={back} />
        <div className="pb-4">
          <H1 color="white">{assessmentTitle()}</H1>
        </div>
        {totalSteps > 0 && (
          <div className="pb-6 mx-6">
            <Progress 
              currentStep={Math.min(step + 1, totalSteps)} 
              steps={totalSteps} 
              darkBackground 
            />
          </div>
        )}
      </HighlightHeader>

      <HighlightBody className="flex-1 pb-8">
        {(error || templateError) && step !== totalSteps && (
          <Alert className="mb-4">{error || templateError}</Alert>
        )}

        {(loading || templateLoading) && step !== totalSteps && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10368c]" />
          </div>
        )}

        {!templateLoading && step !== totalSteps && (
          <div className="mt-4">
            {renderQuestion()}
            
            <div className="space-y-3 mt-6">
              <Button onClick={next} disabled={!answered} className="w-full">
                {t("common:button.next")}
              </Button>
              <Button outline onClick={back} className="w-full">
                {t("common:button.back")}
              </Button>
            </div>
          </div>
        )}

        {step === totalSteps && renderComplete()}
      </HighlightBody>
    </div>
  );
}
