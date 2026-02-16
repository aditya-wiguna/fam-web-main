import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import numeral from "numeral";
import { H1, H2, H4, P, Button, Card, TopNav, Tiny } from "../components";
import { AuthContext } from "../contexts";
import { useOrders, useAuth, type Order } from "../services";
import noOrderImage from "../assets/images/noOrder.png";
import colors from "../theme/colors";

const amountFormat = "0,0.00";
const unitFormat = "0,0.000";

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { orders, loading } = useOrders();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
        <TopNav inverse showLogo />
        <H1 style={{ fontSize: 28, color: colors.white, marginTop: 0, marginBottom: 5 }}>
          {t("orders:heading.title")}
        </H1>
        <div className="text-center py-12">
          <P color="grey500" className="my-4">{t("common:text.pleaseLogin")}</P>
          <Button onClick={() => navigate("/login")}>{t("login:button.login")}</Button>
        </div>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLOSED": return colors.success;
      case "CANCELLED": return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CLOSED": return t("orders:text.status.completed");
      case "CANCELLED": return t("orders:text.status.cancelled");
      default: return t("orders:text.status.processing");
    }
  };

  return (
    <div>
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />
        <H1 style={{ fontSize: 28, color: colors.white, marginTop: 0, marginBottom: 5 }}>
          {t("orders:heading.title")}
        </H1>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.teal }} />
        </div>
      )}

      {!loading && (
        <div style={{ marginLeft: 20, marginRight: 20, paddingBottom: 70 }}>
          {(!orders || orders.length === 0) && (
            <div style={{ marginTop: 25 }}>
              <Card>
                <div style={{ alignItems: "center", textAlign: "center", marginTop: 15, marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 10, marginBottom: 10 }}>
                    <img src={noOrderImage} alt="No orders" style={{ height: 160, objectFit: "contain", marginBottom: 20 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <H4 style={{ textAlign: "center", fontWeight: "300", marginTop: 10 }}>
                    {t("orders:text.emptyList")}
                  </H4>
                </div>
                <div style={{ marginBottom: 10, textAlign: "center" }}>
                  <Button compact onClick={() => navigate("/")}>
                    {t("orders:button.feature.products")}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {dateOrders.map(({ orderDate, orders: dateOrderList }) => (
            <div key={orderDate}>
              <H2 style={{ fontSize: 24, lineHeight: "30px", fontWeight: "200", color: colors.white, marginTop: 10, marginBottom: 20 }}>
                {orderDate}
              </H2>
              {dateOrderList.map((order) => (
                <Card key={order.id}>
                  {/* Product name */}
                  <div style={{ borderBottomWidth: 0, paddingBottom: 10, marginTop: 5, marginBottom: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: "300" }}>
                      {order.product?.name || order.fundName}
                    </span>
                  </div>

                  {/* Order details */}
                  {order.type === "SUBSCRIPTION" && (
                    <div style={{ marginBottom: 10 }}>
                      <H4>
                        {t("orders:text.type.subscribe")} - {order.currency}{" "}
                        {numeral(order.amount).format(amountFormat)}
                      </H4>
                    </div>
                  )}

                  {order.type === "REDEMPTION" && (
                    <div style={{ marginBottom: 10 }}>
                      {order.unit ? (
                        <H4>
                          {t("orders:text.type.redeem")} - {numeral(order.unit).format(unitFormat)}{" "}
                          <Tiny>({t("orders:text.type.unit")})</Tiny>
                        </H4>
                      ) : (
                        <H4>
                          {t("orders:text.type.redeem")} - {order.currency}{" "}
                          {numeral(order.amount).format(amountFormat)}{" "}
                          <Tiny>({t("orders:text.redemption.estimated")})</Tiny>
                        </H4>
                      )}
                      {order.settlementAmount && (
                        <H4>
                          {t("orders:text.redemption.settlement")} - {order.currency}{" "}
                          {numeral(order.settlementAmount).format(amountFormat)}
                        </H4>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <span style={{ fontSize: 12, fontWeight: "600", letterSpacing: 0.8, color: getStatusColor(order.status) }}>
                    {getStatusText(order.status)}
                  </span>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}