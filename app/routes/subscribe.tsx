import { useState, useEffect, useContext, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import numeral from "numeral";
import { H1, H2, P, Button, TopNav, Input, Card, Small, Alert, Progress } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { useProduct, useOrderService } from "../services";
import colors from "../theme/colors";

const amountFormat = "0,0.00";

interface FundClass {
  id: string;
  fundClass: string;
  baseCurrencyCode: string;
  minimumSubscription: number;
  minimumTopUp: number;
  primaryClass: boolean;
  dividendOption?: boolean;
  name: string;
}

interface OrderData {
  type: string;
  ownerId: string;
  productId: string;
  classId?: string;
  currency?: string;
  amount: number;
  dividendOption?: string;
  riskAccepted?: boolean;
  declaration?: Record<string, unknown>;
}

const DividendOptions = [
  { value: "REINVEST", label: "Reinvest" },
  { value: "CASH", label: "Cash" },
];

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile, portfolio, riskProfile } = useContext(ProfileContext);
  const [product, loading, productError] = useProduct(productId || null);
  const { save, loading: saving, error: saveError } = useOrderService();
  
  const [step, setStep] = useState(0);
  const [orderData, setOrderData] = useState<OrderData>({
    type: "SUBSCRIPTION",
    ownerId: "",
    productId: productId || "",
    amount: 0,
  });
  const [selectedClass, setSelectedClass] = useState<FundClass | null>(null);
  const [showMinAmountWarning, setShowMinAmountWarning] = useState(false);

  const steps = [
    { title: t("subscription:heading.title.subscribe") },
    { title: t("subscription:heading.title.review") },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.id && !orderData.ownerId) {
      setOrderData(prev => ({ ...prev, ownerId: profile.id }));
    }
  }, [profile, orderData.ownerId]);

  // Find user's holding for this product
  const holdings = portfolio?.flatMap(p => p.classDetails || []) || [];
  const fundHolding = holdings.find(
    (h: { classId?: string; noOfShares?: number }) => 
      selectedClass && h.classId === selectedClass.id && (h.noOfShares || 0) > 0
  );

  // Get fund classes
  const fundClasses: FundClass[] = (product?.fund as { classes?: FundClass[] })?.classes?.filter(
    (fc: FundClass) => fc.primaryClass
  ) || [];

  // Set default class if only one
  useEffect(() => {
    if (fundClasses.length === 1 && !orderData.classId) {
      const fc = fundClasses[0];
      setOrderData(prev => ({ 
        ...prev, 
        classId: fc.id,
        currency: fc.baseCurrencyCode 
      }));
      setSelectedClass(fc);
    }
  }, [fundClasses, orderData.classId]);

  // Update selected class when classId changes
  useEffect(() => {
    if (orderData.classId && product?.fund) {
      const fc = (product.fund as { classes?: FundClass[] }).classes?.find(
        (c: FundClass) => c.id === orderData.classId
      );
      if (fc) {
        setSelectedClass(fc);
        if (orderData.currency !== fc.baseCurrencyCode) {
          setOrderData(prev => ({ ...prev, currency: fc.baseCurrencyCode }));
        }
      }
    }
  }, [orderData.classId, product, orderData.currency]);

  const updateField = useCallback((field: keyof OrderData, value: unknown) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate minimum value
  const minimumValue = selectedClass 
    ? (fundHolding ? selectedClass.minimumTopUp : selectedClass.minimumSubscription) 
    : 0;

  // Risk profile check
  const maxRiskProfileRating = riskProfile?.profile?.riskRating 
    ? Math.max(...riskProfile.profile.riskRating.map(r => parseInt(r)))
    : 0;
  const fundSuitability = parseInt(String(product?.fund?.suitability || 0));
  const needToAcceptRisk = maxRiskProfileRating < fundSuitability;

  // Validation
  const hasDividendOption = selectedClass?.dividendOption || false;
  const isValid = 
    orderData.classId &&
    Number(orderData.amount) > 0 &&
    (!hasDividendOption || orderData.dividendOption) &&
    (!needToAcceptRisk || orderData.riskAccepted);

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(`/fund/${productId}`);
    }
  };

  const next = () => {
    if (Number(orderData.amount) < minimumValue) {
      setShowMinAmountWarning(true);
    } else {
      setStep(step + 1);
    }
  };

  const submit = async () => {
    try {
      await save(orderData as unknown as Record<string, unknown>);
      navigate(`/subscribe/success?productId=${productId}`);
    } catch (e) {
      console.error("Error submitting order", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav allowBack inverse onBack={back} />
        </HighlightHeader>
        <HighlightBody>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        </HighlightBody>
      </div>
    );
  }

  if (!product || productError) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav allowBack inverse onBack={back} />
        </HighlightHeader>
        <HighlightBody>
          <div className="text-center py-12">
            <P color="error">{t("common:error.product.load")}</P>
            <Button onClick={() => navigate(-1)} className="mt-4">
              {t("common:button.back")}
            </Button>
          </div>
        </HighlightBody>
      </div>
    );
  }

  const renderSubscribeForm = () => (
    <div className="animate-fadeIn">
      {/* Fund Name */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.fund")}</Small>
        <P className="font-semibold" style={{ color: colors.teal700 }}>{product.name}</P>
      </div>

      {/* Risk Rating */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.riskAllocation")}</Small>
        <P className="font-semibold">{fundSuitability}</P>
      </div>

      {/* User Risk Profile */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.riskProfile")}</Small>
        <P className="font-semibold">{maxRiskProfileRating || "-"}</P>
      </div>

      {/* Risk Acceptance */}
      {needToAcceptRisk && (
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={orderData.riskAccepted || false}
              onChange={(e) => updateField("riskAccepted", e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded"
            />
            <span className="text-sm">{t("subscription:alert.risk.message")}</span>
          </label>
        </div>
      )}

      {/* Fund Class Selection */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.fundClass")}</Small>
        {fundClasses.length === 1 ? (
          <P className="font-semibold">Class {selectedClass?.fundClass} {selectedClass?.baseCurrencyCode}</P>
        ) : (
          <select
            value={orderData.classId || ""}
            onChange={(e) => updateField("classId", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 font-semibold"
          >
            <option value="">{t("subscription:form.help.fundClass")}</option>
            {fundClasses.map((fc) => (
              <option key={fc.id} value={fc.id}>
                Class {fc.fundClass} {fc.baseCurrencyCode}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dividend Option */}
      {hasDividendOption && (
        <div className="mb-4">
          <Small color="grey500">{t("subscription:form.label.dividendOption")}</Small>
          <select
            value={orderData.dividendOption || ""}
            onChange={(e) => updateField("dividendOption", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 font-semibold"
          >
            <option value="">{t("subscription:form.help.dividendOption")}</option>
            {DividendOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Investment Amount */}
      {selectedClass && (
        <div className="mb-6">
          <Small color="grey500">
            {t("subscription:form.label.investmentAmount")} ({selectedClass.baseCurrencyCode})
          </Small>
          <Input
            type="number"
            value={orderData.amount === 0 ? "" : String(orderData.amount)}
            onValueChange={(val) => updateField("amount", val)}
            placeholder={t("subscription:form.help.investmentAmount", {
              currency: selectedClass.baseCurrencyCode,
              amount: numeral(minimumValue).format(amountFormat),
            })}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        <Button onClick={next} disabled={!isValid} className="w-full">
          {t("common:button.next")}
        </Button>
        <Button outline onClick={back} className="w-full">
          {t("common:button.back")}
        </Button>
      </div>

      {/* Min Amount Warning Modal */}
      {showMinAmountWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full">
            <H2 className="text-center mb-4">{t("subscription:alert.minAmount.title")}</H2>
            <P className="mb-2">{t("subscription:alert.minAmount.message1")}</P>
            <P className="font-semibold text-red-500 my-4">
              {selectedClass?.baseCurrencyCode} {numeral(minimumValue).format(amountFormat)}
            </P>
            <P className="mb-6">{t("subscription:alert.minAmount.message2")}</P>
            <div className="flex gap-3">
              <Button 
                onClick={() => { setShowMinAmountWarning(false); setStep(step + 1); }}
                className="flex-1"
              >
                {t("common:button.continue")}
              </Button>
              <Button 
                outline 
                onClick={() => setShowMinAmountWarning(false)}
                className="flex-1"
              >
                {t("common:button.cancel")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="animate-fadeIn">
      <Card className="mb-6">
        <H2 className="mb-4">1. {t("subscription:heading.title.subscribe")}</H2>
        
        <div className="mb-3">
          <Small color="grey500">{t("subscription:form.label.fund")}</Small>
          <P className="font-semibold" style={{ color: colors.teal700 }}>{product.name}</P>
        </div>

        <div className="mb-3">
          <Small color="grey500">{t("subscription:form.label.fundClass")}</Small>
          <P className="font-semibold">Class {selectedClass?.fundClass} {selectedClass?.baseCurrencyCode}</P>
        </div>

        <div className="mb-3">
          <Small color="grey500">{t("subscription:form.label.investmentAmount")}</Small>
          <H1 className="mt-0">
            {selectedClass?.baseCurrencyCode} {numeral(orderData.amount).format(amountFormat)}
          </H1>
        </div>
      </Card>

      {(saveError) && <Alert className="mb-4">{saveError}</Alert>}

      <div className="space-y-3">
        <Button onClick={submit} loading={saving} className="w-full">
          {t("common:button.submit")}
        </Button>
        <Button outline onClick={back} className="w-full">
          {t("common:button.back")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <HighlightHeader>
        <TopNav allowBack inverse onBack={back} />
        <div className="px-5 pb-4">
          <H1 color="white">
            {step + 1}. {steps[step]?.title}
          </H1>
        </div>
        <div className="px-5 pb-6">
          <Progress currentStep={step + 1} steps={steps.length} darkBackground />
        </div>
      </HighlightHeader>

      <HighlightBody className="pb-8">
        {step === 0 && renderSubscribeForm()}
        {step === 1 && renderReview()}
      </HighlightBody>
    </div>
  );
}
