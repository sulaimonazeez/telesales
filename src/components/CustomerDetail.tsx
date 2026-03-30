import { Order } from '@/types/order';

interface CustomerDetailProps {
  order: Order;
  hidePhone?: boolean;
  hideAddress?: boolean;
}

const CustomerDetail = ({ order, hidePhone, hideAddress }: CustomerDetailProps) => {
  return (
    <div className="bg-raised p-3 space-y-1.5 text-floor">
      {!hidePhone && (
        <div className="flex justify-between">
          <span className="text-mid">Phone</span>
          <span className="font-mono text-accent font-medium">{order.phone}</span>
        </div>
      )}
      {order.email && (
        <div className="flex justify-between">
          <span className="text-mid">Email</span>
          <span className="text-foreground">{order.email}</span>
        </div>
      )}
      {!hideAddress && (
        <>
          <div className="flex justify-between">
            <span className="text-mid">Address</span>
            <span className="text-foreground text-right max-w-[60%]">{order.address}</span>
          </div>
          {order.landmark && (
            <div className="flex justify-between">
              <span className="text-mid">Landmark</span>
              <span className="text-foreground text-right max-w-[60%]">{order.landmark}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-mid">State / LGA</span>
            <span className="text-foreground">{order.state} / {order.lga}</span>
          </div>
        </>
      )}
      <div className="flex justify-between">
        <span className="text-mid">Delivery Date</span>
        <span className="text-foreground">{order.deliveryDate}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-mid">Time Window</span>
        <span className="text-foreground">{order.timeWindow}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-mid">Delivery Fee</span>
        <span className="font-mono text-foreground">₦{order.deliveryFee.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-mid">Payment</span>
        <span className="text-foreground">{order.paymentMethod}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-mid">Heard from</span>
        <span className="text-foreground">{order.heardFrom}</span>
      </div>
    </div>
  );
};

export default CustomerDetail;
