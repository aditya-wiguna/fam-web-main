import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import numeral from "numeral";
import { H1, H2, P, Button, Card, TopNav, Small, Tiny } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext } from "../contexts";
import { useOrders, type Order } from "../services";
import noOrderImage from "../assets/images/noOrder.png";
import colors from "../theme/colors";

const amountFormat = "0,0.00";
const unitFormat = "0,0.000";

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateAuthData } = useContext(AuthContext);
  const { orders, loading } = useOrders();

  const handleLogout = async () => {
    await updateAuthData(null);
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav inverse showLogo />
          <div className="px-5 pb-6">
            <H1 color="white" className="text-[28px] mt-0 mb-1">{t("orders:heading.title")}</H1>
          </div>
        </HighlightHeader>
        <HighlightBody className="min-h-[60vh]">
          <div className="text-center py-12">
            <P color="grey500" className="my-4">{t("common:text.pleaseLogin")}</P>
            <Button onClick={() => navigate("/login")}>{t("login:button.login")}</Button>
          </div>
        </HighlightBody>
      </div>
    );
  }

  // Group orders by date
  const groupOrdersByDate = (orders: Order[] | null) => {
    if (!orders || orders.length === 0) return [];
    
    const dateOrders: Array<{ orderDate: string; orders: Order[] }> = [];
    let currentDate: string | null = null;
    
    orders.forEach((order) => {
      const orderDate = dayjs(order.createdDate).format("D MMMM YYYY");
      if (orderDate !== currentDate) {
        currentDate = orderDate;
        dateOrders.push({ orderDate, orders: [] });
      }
      dateOrders[dateOrders.length - 1].orders.push(order);
    });
    
    return dateOrders;
  };

  const dateOrders = groupOrdersByDate(orders);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CLOSED":
        return { color: colors.green };
      case "CANCELLED":
        return { color: colors.red500 };
      default:
        return { color: colors.warning };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CLOSED":
        return t("orders:text.status.completed");
      case "CANCELLED":
        return t("orders:text.status.cancelled");
      default:
        return t("orders:text.status.processing");
    }
  };

  const backToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />
        <div className="px-5 pb-6">
          <H1 color="white" className="text-[28px] mt-0 mb-1">{t("orders:heading.title")}</H1>
        </div>
      </HighlightHeader>

      <HighlightBody color="whiteRGBA" className="min-h-[60vh] pb-24">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
          </div>
        )}

        {!loading && (!orders || orders.length === 0) && (
          <div className="mt-8">
            <Card className="text-center py-8">
              <div className="flex justify-center mb-4 mt-4">
                <img src={noOrderImage} alt="No orders" className="h-32 object-contain" />
              </div>
              <div className="px-4 mb-4">
                <P color="grey600" className="text-center">{t("orders:text.emptyList")}</P>
              </div>
              <div className="px-4">
                <Button compact onClick={backToHome}>
                  {t("orders:button.feature.products")}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {!loading && dateOrders.map(({ orderDate, orders }) => (
          <div key={orderDate}>
            <H2 
              color="white" 
              className="text-2xl font-extralight mt-6 mb-5"
            >
              {orderDate}
            </H2>
            {orders.map((order) => (
              <Card key={order.id} className="mb-4">
                {/* Product name header */}
                <div className="border-b-0 border-gray-200 pb-2 mb-0">
                  <h3 
                    className="text-base font-light pb-2 mt-1 mb-0"
                    style={{ borderBottomWidth: 0 }}
                  >
                    {order.product?.name || order.fundName}
                  </h3>
                </div>
                
                {/* Order details */}
                {order.type === "SUBSCRIPTION" && (
                  <div className="mb-2">
                    <P className="font-semibold mt-2">
                      {t("orders:text.type.subscribe")} - {order.currency}{" "}
                      {numeral(order.amount).format(amountFormat)}
                    </P>
                  </div>
                )}
                
                {order.type === "REDEMPTION" && (
                  <div className="mb-2">
                    {order.unit ? (
                      <P className="font-semibold mt-2">
                        {t("orders:text.type.redeem")} - {numeral(order.unit).format(unitFormat)}{" "}
                        <Tiny color="grey500">({t("orders:text.type.unit")})</Tiny>
                      </P>
                    ) : (
                      <P className="font-semibold mt-2">
                        {t("orders:text.type.redeem")} - {order.currency}{" "}
                        {numeral(order.amount).format(amountFormat)}{" "}
                        <Tiny color="grey500">({t("orders:text.redemption.estimated")})</Tiny>
                      </P>
                    )}
                    {order.settlementAmount && (
                      <P className="font-semibold">
                        {t("orders:text.redemption.settlement")} - {order.currency}{" "}
                        {numeral(order.settlementAmount).format(amountFormat)}
                      </P>
                    )}
                  </div>
                )}
                
                {/* Status */}
                <span 
                  className="text-xs font-semibold tracking-wider"
                  style={getStatusStyle(order.status)}
                >
                  {getStatusText(order.status)}
                </span>
              </Card>
            ))}
          </div>
        ))}
      </HighlightBody>
    </div>
  );
}
