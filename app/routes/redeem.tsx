import { useState, useEffect, useContext, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import numeral from "numeral";
import { H1, H2, P, Button, TopNav, Input, Card, Small, Alert, Progress, Radio } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { useProduct, useOrderService } from "../services";
import colors from "../theme/colors";

const amountFormat = "0,0.00";
const unitFormat = "0,0.000";

interface FundClass {
  id: string;
  fundClass: string;
  baseCurrencyCode: string;
  minimumRedemption?: number;
  primaryClass: boolean;
  name: string;
}

interface ClassDetail {
  classId: string;
  noOfShares: number;
  totalNavSGD?: number;
  totalNavUSD?: number;
}

interface OrderData {
  type: string;
  ownerId: string;
  productId: string;
  classId?: string;
  currency?: string;
  amount?: number;
  unit?: number;
  disclaimerAccepted?: boolean;
}

const Currencies: Record<string, { id: string; name: string }> = {
  SGD: { id: "SGD", name: "SGD" },
  USD: { id: "USD", name: "USD" },
};

export default function Redeem() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile, portfolio } = useContext(ProfileContext);
  const [product, loading, productError] = useProduct(productId || null);
  const { save, loading: saving, error: saveError } = useOrderService();
  
  const [step, setStep] = useState(0);
  const [orderData, setOrderData] = useState<OrderData>({
    type: "REDEMPTION",
    ownerId: "",
    productId: productId || "",
  });
  const [selectedClass, setSelectedClass] = useState<FundClass | null>(null);
  const [redemptionType, setRedemptionType] = useState<"amount" | "unit">("amount");
  const [presetFundClass, setPresetFundClass] = useState(false);

  const steps = [
    { title: t("subscription:heading.title.redeem") },
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

  // Get holdings for this product
  const productHolding = portfolio?.find(p => p.productId === productId);
  const holdings = (productHolding?.classDetails || []) as ClassDetail[];
  const holdingClassIds = holdings
    .filter(h => h.noOfShares > 0)
    .map(h => h.classId);

  // Get fund classes that user holds
  const fundClasses: FundClass[] = ((product?.fund as { classes?: FundClass[] })?.classes || [])
    .filter((fc: FundClass) => holdingClassIds.includes(fc.id));

  // Auto-select if only one class
  useEffect(() => {
    if (fundClasses.length === 1 && !orderData.classId) {
      const fc = fundClasses[0];
      setOrderData(prev => ({ 
        ...prev, 
        classId: fc.id,
        currency: fc.baseCurrencyCode,
        amount: 0,
      }));
      setSelectedClass(fc);
      setPresetFundClass(true);
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

  // Get current holding for selected class
  const fundHolding = holdings.find(
    h => selectedClass && h.classId === selectedClass.id && h.noOfShares > 0
  );

  // Calculate estimated value
  let estimatedValue = 0;
  if (fundHolding && selectedClass) {
    const currency = Object.values(Currencies).find(
      c => c.name === selectedClass.baseCurrencyCode
    );
    if (currency) {
      const navKey = `totalNav${currency.id}` as keyof ClassDetail;
      estimatedValue = Number(fundHolding[navKey] || 0);
    }
  }

  const updateField = useCallback((field: keyof OrderData, value: unknown) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateAmount = (percent: number) => {
    if (redemptionType === "unit" && fundHolding) {
      const amount = Number((percent * fundHolding.noOfShares).toFixed(3));
      setOrderData(prev => ({ ...prev, unit: amount, amount: undefined }));
    } else if (redemptionType === "amount") {
      const amount = Number((percent * estimatedValue).toFixed(2));
      setOrderData(prev => ({ ...prev, amount, unit: undefined }));
    }
  };

  const switchRedemptionType = (type: "amount" | "unit") => {
    setRedemptionType(type);
    if (type === "amount") {
      setOrderData(prev => ({ ...prev, amount: 0, unit: undefined }));
    } else {
      setOrderData(prev => ({ ...prev, unit: 0, amount: undefined }));
    }
  };

  // Validation
  const isValidAmount = estimatedValue && 
    Number(orderData.amount) > 0 && 
    Number(orderData.amount) <= estimatedValue;
  const isValidUnit = fundHolding && 
    Number(orderData.unit) > 0 && 
    Number(orderData.unit) <= fundHolding.noOfShares;
  const isValid = orderData.classId && 
    (isValidAmount || isValidUnit) && 
    orderData.disclaimerAccepted;

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(`/fund/${productId}`);
    }
  };

  const next = () => {
    setStep(step + 1);
  };

  const submit = async () => {
    try {
      await save(orderData as unknown as Record<string, unknown>);
      navigate(`/redeem/success?productId=${productId}`);
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

  // No holdings check
  if (fundClasses.length === 0) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav allowBack inverse onBack={back} />
          <div className="px-5 pb-6">
            <H1 color="white">{t("subscription:heading.title.redeem")}</H1>
          </div>
        </HighlightHeader>
        <HighlightBody>
          <Card className="text-center py-8">
            <P color="grey600" className="mb-4">You don't have any holdings in this fund to redeem.</P>
            <Button onClick={() => navigate(`/fund/${productId}`)}>
              {t("common:button.back")}
            </Button>
          </Card>
        </HighlightBody>
      </div>
    );
  }

  const renderRedeemForm = () => (
    <div className="animate-fadeIn">
      {/* Fund Name */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.fund")}</Small>
        <P className="font-semibold" style={{ color: colors.teal700 }}>{product.name}</P>
      </div>

      {/* Fund Class Selection */}
      <div className="mb-4">
        <Small color="grey500">{t("subscription:form.label.fundClass")}</Small>
        {presetFundClass || fundClasses.length === 1 ? (
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

      {/* Account Value */}
      {selectedClass && estimatedValue > 0 && (
        <div className="mb-4">
          <Small color="grey500">{t("subscription:form.label.value")}</Small>
          <P className="font-semibold">
            {selectedClass.baseCurrencyCode} {numeral(estimatedValue).format(amountFormat)}
          </P>
        </div>
      )}

      {/* Redemption Type */}
      {selectedClass && (
        <div className="mb-4">
          <Small color="grey500">{t("subscription:form.label.redemptionType")}</Small>
          <div className="flex gap-4 mt-2">
            <Radio
              label={t("subscription:form.label.amount")}
              value={redemptionType === "amount"}
              onPress={() => switchRedemptionType("amount")}
            />
            <Radio
              label={t("subscription:form.label.unit")}
              value={redemptionType === "unit"}
              onPress={() => switchRedemptionType("unit")}
            />
          </div>
        </div>
      )}

      {/* Amount Input */}
      {redemptionType === "amount" && selectedClass && fundHolding && (
        <div className="mb-4">
          <Small color="grey500">
            {t("subscription:form.label.amount")} ({selectedClass.baseCurrencyCode})
          </Small>
          <Input
            type="number"
            value={orderData.amount === 0 ? "" : String(orderData.amount || "")}
            onValueChange={(val) => updateField("amount", val)}
            placeholder={t("subscription:form.label.redeemAmount", {
              amount: `${selectedClass.baseCurrencyCode} ${numeral(estimatedValue).format(amountFormat)}`,
            })}
          />
          <div className="flex gap-2 mt-3">
            <Button compact outline onClick={() => updateAmount(0.25)} className="flex-1">
              {t("subscription:button.percent25")}
            </Button>
            <Button compact outline onClick={() => updateAmount(0.5)} className="flex-1">
              {t("subscription:button.percent50")}
            </Button>
            <Button compact outline onClick={() => updateAmount(1)} className="flex-1">
              {t("subscription:button.percent100")}
            </Button>
          </div>
        </div>
      )}

      {/* Unit Input */}
      {redemptionType === "unit" && selectedClass && fundHolding && (
        <>
          <div className="mb-4">
            <Small color="grey500">{t("subscription:form.label.noOfShares")}</Small>
            <P className="font-semibold">{numeral(fundHolding.noOfShares).format(unitFormat)}</P>
          </div>
          <div className="mb-4">
            <Small color="grey500">{t("subscription:form.label.unit")}</Small>
            <Input
              type="number"
              value={orderData.unit === 0 ? "" : String(orderData.unit || "")}
              onValueChange={(val) => updateField("unit", val)}
              placeholder={t("subscription:form.label.redeemUnit", {
                unit: numeral(fundHolding.noOfShares).format(unitFormat),
              })}
            />
            <div className="flex gap-2 mt-3">
              <Button compact outline onClick={() => updateAmount(0.25)} className="flex-1">
                {t("subscription:button.percent25")}
              </Button>
              <Button compact outline onClick={() => updateAmount(0.5)} className="flex-1">
                {t("subscription:button.percent50")}
              </Button>
              <Button compact outline onClick={() => updateAmount(1)} className="flex-1">
                {t("subscription:button.percent100")}
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <Small color="grey500">{t("subscription:form.label.estimatedValue")}</Small>
            <P className="font-semibold">
              {selectedClass.baseCurrencyCode} {numeral(estimatedValue).format(amountFormat)}
            </P>
          </div>
        </>
      )}

      {/* Disclaimer */}
      {selectedClass && (
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={orderData.disclaimerAccepted || false}
              onChange={(e) => updateField("disclaimerAccepted", e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded"
            />
            <span className="text-sm">{t("subscription:text.redemption.message")}</span>
          </label>
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
    </div>
  );

  const renderReview = () => (
    <div className="animate-fadeIn">
      <Card className="mb-6">
        <div className="mb-3">
          <Small color="grey500">{t("subscription:form.label.fund")}</Small>
          <P className="font-semibold" style={{ color: colors.teal700 }}>{product.name}</P>
        </div>

        <div className="mb-3">
          <Small color="grey500">{t("subscription:form.label.fundClass")}</Small>
          <P className="font-semibold">Class {selectedClass?.fundClass} {selectedClass?.baseCurrencyCode}</P>
        </div>

        {redemptionType === "amount" && (
          <div className="mb-3">
            <Small color="grey500">{t("subscription:form.label.amount")}</Small>
            <H1 className="mt-0">
              {selectedClass?.baseCurrencyCode} {numeral(orderData.amount).format(amountFormat)}
            </H1>
          </div>
        )}

        {redemptionType === "unit" && (
          <>
            <div className="mb-3">
              <Small color="grey500">{t("subscription:form.label.unit")}</Small>
              <P className="font-semibold">{numeral(orderData.unit).format(unitFormat)}</P>
            </div>
            <div className="mb-3">
              <Small color="grey500">{t("subscription:form.label.estimatedValue")}</Small>
              <H1 className="mt-0">
                {selectedClass?.baseCurrencyCode} {numeral(estimatedValue).format(amountFormat)}
              </H1>
            </div>
          </>
        )}
      </Card>

      {saveError && <Alert className="mb-4">{saveError}</Alert>}

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
        {step === 0 && renderRedeemForm()}
        {step === 1 && renderReview()}
      </HighlightBody>
    </div>
  );
}
