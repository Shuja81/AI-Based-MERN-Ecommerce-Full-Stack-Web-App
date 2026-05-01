import React from "react";
import { Row, Col } from "reactstrap";

import { ROLES } from "../../../constants";
import useAnalytics from "../../../utils/useAnalytics";
import LoadingIndicator from "../../Common/LoadingIndicator";

const DashboardAnalyticsSummary = ({ user }) => {
    const role = user && user.role;
    const merchantId = user && user.merchant ? user.merchant : null;
    const userId = user && user._id ? user._id : null;

    const isSuperAdmin = role === ROLES.SuperAdmin;
    const isAdmin = role === ROLES.Admin;
    const isMerchant = role === ROLES.Merchant;
    const enabled = isSuperAdmin || isAdmin || isMerchant;

    const {
        data: salesData,
        loading: salesLoading,
        error: salesError,
    } = useAnalytics("sales", { merchantId }, enabled);

    const {
        data: userData,
        loading: usersLoading,
        error: usersError,
    } = useAnalytics("users", {}, enabled);

    const {
        data: recommendationsData,
        loading: recommendationsLoading,
        error: recommendationsError,
    } = useAnalytics("recommendations", { userId, merchantId }, enabled);

    const {
        data: anomaliesData,
        loading: anomaliesLoading,
        error: anomaliesError,
    } = useAnalytics("anomalies", {}, enabled);

    const loading =
        salesLoading ||
        usersLoading ||
        recommendationsLoading ||
        anomaliesLoading;
    const error =
        salesError || usersError || recommendationsError || anomaliesError;

    if (!isSuperAdmin && !isAdmin && !isMerchant) {
        return null;
    }

    const totalRevenue =
        salesData?.data?.total_revenue?.total_revenue ||
        salesData?.total_revenue?.total_revenue ||
        0;
    const totalOrders =
        salesData?.data?.total_revenue?.total_orders ||
        salesData?.total_revenue?.total_orders ||
        0;
    const topProducts =
        salesData?.data?.top_products || salesData?.top_products || [];
    const salesByStatus =
        salesData?.data?.sales_by_status || salesData?.sales_by_status || [];
    const activeUsers =
        userData?.data?.retention?.total_users ||
        userData?.retention?.total_users ||
        0;
    const retentionRate =
        userData?.data?.retention?.retention_rate_percent ||
        userData?.retention?.retention_rate_percent ||
        0;
    const conversionRate =
        userData?.data?.conversion_rate?.conversion_rate_percent ||
        userData?.conversion_rate?.conversion_rate_percent ||
        0;
    const trendingProducts =
        recommendationsData?.data?.trending_products ||
        recommendationsData?.trending_products ||
        [];
    const unusualOrders =
        anomaliesData?.data?.unusual_orders ||
        anomaliesData?.unusual_orders ||
        [];
    const suspiciousActivity =
        anomaliesData?.data?.suspicious_activity ||
        anomaliesData?.suspicious_activity ||
        [];
    const highCancellationUsers =
        anomaliesData?.data?.high_cancellation_users ||
        anomaliesData?.high_cancellation_users ||
        [];

    const renderMetricCard = (label, value, subtitle) => (
        <div className="analytics-card">
            <div className="analytics-card__label">{label}</div>
            <div className="analytics-card__value">{value}</div>
            {subtitle && (
                <div className="analytics-card__subtitle">{subtitle}</div>
            )}
        </div>
    );

    const renderTopProductRows = () => {
        return topProducts.slice(0, 5).map((product, index) => {
            const name =
                product["Product Name"] ||
                product.name ||
                product.Name ||
                "Unknown Product";
            const sold =
                product["Quantity Sold"] ||
                product.quantity_sold ||
                product.quantity ||
                0;
            const revenue =
                product["Total Revenue"] ||
                product.total_revenue ||
                product.revenue ||
                0;
            return (
                <tr key={`${name}-${index}`}>
                    <td>{name}</td>
                    <td>{sold}</td>
                    <td>${Number(revenue).toLocaleString()}</td>
                </tr>
            );
        });
    };

    return (
        <div className="dashboard-analytics">
            <div className="analytics-header">
                <h4>Dashboard Analytics</h4>
                <p className="analytics-subtitle">
                    Live analytics fetched from the existing AI analytics
                    service.
                </p>
            </div>

            {loading && <LoadingIndicator inline />}
            {error && (
                <div className="analytics-error">
                    Analytics could not be loaded. Please try again later.
                </div>
            )}

            {!loading && !error && (
                <>
                    <Row className="analytics-card-row">
                        {renderMetricCard(
                            "Revenue",
                            `$${Number(totalRevenue).toLocaleString()}`,
                            `${Number(totalOrders).toLocaleString()} orders`,
                        )}
                        {renderMetricCard(
                            "Active Users",
                            Number(activeUsers).toLocaleString(),
                        )}
                        {renderMetricCard(
                            "Retention Rate",
                            `${retentionRate}%`,
                        )}
                        {renderMetricCard(
                            "Conversion Rate",
                            `${conversionRate}%`,
                        )}
                    </Row>

                    <Row className="analytics-grid">
                        <Col xs="12" lg="6">
                            <div className="analytics-panel">
                                <div className="analytics-panel__title">
                                    Top Products
                                </div>
                                <table className="analytics-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Sold</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderTopProductRows()}</tbody>
                                </table>
                            </div>
                        </Col>

                        <Col xs="12" lg="6">
                            <div className="analytics-panel">
                                <div className="analytics-panel__title">
                                    Order Performance
                                </div>
                                <div className="status-list">
                                    {salesByStatus.length > 0 ? (
                                        salesByStatus.map((status, index) => (
                                            <div
                                                className="status-list__item"
                                                key={index}
                                            >
                                                <span>
                                                    {status.Status ||
                                                        status.status ||
                                                        "Status"}
                                                </span>
                                                <span>
                                                    {status["Order Count"] ||
                                                        status.order_count ||
                                                        status.orders ||
                                                        0}{" "}
                                                    orders
                                                </span>
                                                <span>
                                                    $
                                                    {Number(
                                                        status[
                                                            "Total Revenue"
                                                        ] ||
                                                            status.total_revenue ||
                                                            0,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="status-list__empty">
                                            No order summaries available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {(isSuperAdmin || isAdmin) && (
                        <Row className="analytics-grid">
                            <Col xs="12" lg="6">
                                <div className="analytics-panel">
                                    <div className="analytics-panel__title">
                                        Platform Health
                                    </div>
                                    <div className="platform-metrics">
                                        <div className="metric-row">
                                            <strong>Total Revenue</strong>
                                            <span>
                                                $
                                                {Number(
                                                    totalRevenue,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="metric-row">
                                            <strong>Total Orders</strong>
                                            <span>
                                                {Number(
                                                    totalOrders,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="metric-row">
                                            <strong>User Growth</strong>
                                            <span>
                                                {Number(
                                                    activeUsers,
                                                ).toLocaleString()}{" "}
                                                users
                                            </span>
                                        </div>
                                        <div className="metric-row">
                                            <strong>Retention</strong>
                                            <span>{retentionRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs="12" lg="6">
                                <div className="analytics-panel">
                                    <div className="analytics-panel__title">
                                        AI Insights
                                    </div>
                                    {trendingProducts.length > 0 ? (
                                        <ul className="insights-list">
                                            {trendingProducts
                                                .slice(0, 5)
                                                .map((product, index) => (
                                                    <li
                                                        key={`${product.ID || index}-${index}`}
                                                    >
                                                        {product.Name ||
                                                            product[
                                                                "Product Name"
                                                            ] ||
                                                            product.title ||
                                                            "Trending product"}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <div className="status-list__empty">
                                            No AI insights available.
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}

                    {isSuperAdmin && (
                        <Row className="analytics-grid">
                            <Col xs="12">
                                <div className="analytics-panel anomaly-panel">
                                    <div className="analytics-panel__title">
                                        Anomaly Detection Alerts
                                    </div>
                                    {unusualOrders.length === 0 &&
                                    suspiciousActivity.length === 0 &&
                                    highCancellationUsers.length === 0 ? (
                                        <div className="status-list__empty">
                                            No anomalies detected.
                                        </div>
                                    ) : (
                                        <>
                                            {unusualOrders.length > 0 && (
                                                <div className="alert-block">
                                                    <strong>
                                                        Unusual Orders
                                                    </strong>
                                                    <p>
                                                        {unusualOrders.length}{" "}
                                                        order alerts detected.
                                                    </p>
                                                </div>
                                            )}
                                            {suspiciousActivity.length > 0 && (
                                                <div className="alert-block">
                                                    <strong>
                                                        Suspicious Activity
                                                    </strong>
                                                    <p>
                                                        {
                                                            suspiciousActivity.length
                                                        }{" "}
                                                        user alerts detected.
                                                    </p>
                                                </div>
                                            )}
                                            {highCancellationUsers.length >
                                                0 && (
                                                <div className="alert-block">
                                                    <strong>
                                                        High Cancellation Users
                                                    </strong>
                                                    <p>
                                                        {
                                                            highCancellationUsers.length
                                                        }{" "}
                                                        accounts flagged.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardAnalyticsSummary;
