import React, { useEffect, useState } from 'react';
import type { WidgetConfig } from "@medusajs/admin";
import { useAdminOrder } from "medusa-react";

type Props = {
  orderId: string;
}

interface OrderType {
  display_id: string;
  metadata: {
    shipping_label_url?: string;
    tracking_url_provider?: string;
    tracking_number?:string;
    // Add other properties if needed
  }
}

const Order = ({ orderId }: Props) => {
  const {
    order,
    isLoading,
  } = useAdminOrder(orderId);

  const [shippingLabelUrl, setShippingLabelUrl] = useState<string | null>(null);
  const [trackingLabelUrl, setTrackingLabelUrl] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);


  useEffect(() => {
    if (order && typeof order === 'object' && 'metadata' in order && 'shipping_label_url' in order.metadata) {
      const orderData = order as { metadata: { shipping_label_url?: string ,tracking_url_provider?:string,tracking_number?: string} };
      setShippingLabelUrl(orderData.metadata.shipping_label_url || null);
      setTrackingLabelUrl(orderData.metadata.tracking_url_provider|| null);
      setTrackingNumber(orderData.metadata.tracking_number|| null);
    }
  }, [order]);

  const handleDownloadShippingLabel = () => {
    if (shippingLabelUrl) {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = shippingLabelUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = 'shipping_label.pdf'; // You can change the filename if needed
      // Trigger the download
      link.click();
    }
  }

 
  return (
      <div>
          <div className="mt-10 flex items-center gap-x-4 lg:justify-start">
              <a className="rounded-md  px-3.5 py-2.5 text-sm font-semibold text-gray-900  "
                  href={trackingLabelUrl} target="_blank" rel="noopener noreferrer" download="tracking_label.pdf">
                  <button className="btn btn-secondary btn-small min-w-[130px]">Track Order</button>
              </a>

              <button className="btn btn-secondary btn-small min-w-[130px]" onClick={handleDownloadShippingLabel}>Download Shipping Label</button>
              <span><b>Tracking No:</b>&nbsp;&nbsp;{trackingNumber}</span>

          </div>
      </div>
  )
}

const OrderDetailsWidget = () => {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdFromPath = window.location.pathname.split('/').pop();
    if (orderIdFromPath) {
      setOrderId(orderIdFromPath);
    }
  }, []);

  return (
    <div>
      {orderId && <Order orderId={orderId} />}
    </div>
  );
};

export const config: WidgetConfig = {
  zone: "order.details.before",
};

export default OrderDetailsWidget;
