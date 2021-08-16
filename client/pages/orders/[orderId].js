import StripeCheckout from 'react-stripe-checkout';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { errors, doRequest } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: () => Router.push('/orders'),
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msRemaining = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msRemaining / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        // Clean up hook that is called on destory or on re-render
        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey="pk_test_51GuPhcATEDAUNIQXgQCtU4xUrvGHlhN3ssOik7EaXtJBO5uq0pVHE12p1ip5EphhmDR4geLOTpYQCHCt2d0QH3iu009BAr355n"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;
