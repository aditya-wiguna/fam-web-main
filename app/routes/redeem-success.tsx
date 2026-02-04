import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, Button, Card } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { useProduct } from "../services";

export default function RedeemSuccess() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [product] = useProduct(productId || null);

  const goToHome = () => {
    navigate("/");
  };

  const goToOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <div className="px-5 py-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <H1 color="white">{t("subscription:text.success")}</H1>
        </div>
      </HighlightHeader>

      <HighlightBody className="pb-8">
        <Card className="text-center mb-6">
          {product && (
            <P className="mb-4">{product.name}</P>
          )}
          <P color="grey600">
            Your redemption order has been submitted successfully. You can track the status in your orders.
          </P>
        </Card>

        <div className="space-y-3">
          <Button onClick={goToOrders} className="w-full">
            View Orders
          </Button>
          <Button outline onClick={goToHome} className="w-full">
            {t("subscription:button.back")}
          </Button>
        </div>
      </HighlightBody>
    </div>
  );
}
