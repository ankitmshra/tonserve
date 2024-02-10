// order.fulfillment_created
import { 
    OrderService,
    // invento,
    type SubscriberConfig, 
    type SubscriberArgs, 
  } from "@medusajs/medusa"
import { log } from "console";

// const shippo = require('shippo');
  
  export default async function createFulfillmentHandler({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, any>>) {
    const orderService: OrderService = container.resolve(
      "orderService"
    )

    // const productService: SalesChannelLocationService = container.resolve(
    //     "productService"
    //   )

    //   productService.
    // const apiKey = "shippo_test_b76c740df140d7a7c168271784c86c205b3157c9";
  
    // const shippoClient = shippo(apiKey);
    // log(shippoClient);
    const { id } = data
  
    const order = await orderService.retrieve(id)
    // console.log(order)
    log("id ", order);
    // orderService.

    log("address ", order.billing_address, order.shipping_address);
    var addressFrom  = {
        "name": "Shawn Ippotle",
        "street1": "215 Clayton St.",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94117",
        "country": "US"
    };
    
    var addressTo = {
        "name": "Mr Hippo",
        "street1": "Broadway 1",
        "city": "New York",
        "state": "NY",
        "zip": "10007",
        "country": "US"
    };
    
    var parcel = {
        "length": "5",
        "width": "5",
        "height": "5",
        "distance_unit": "in",
        "weight": "2",
        "mass_unit": "lb"
    };

    

    // try {
    //     // const parcel = await shippoClient.parcel.
    //     // Perform actions using the Shippo client
    //     const shipment = await shippo.shipment.create({
    //         "address_from": order.shipping_address_id,
    //         "address_to": order.billing_address_id,
    //         // "address_from": addressFrom,
    //         // "address_to": addressTo,
    //         "parcels": [parcel],
    //         "async": false
    //     });
    
    //     // Example: Save shipment information to database or perform other actions
    //     log("Saving shipment information:", shipment);
    
    //     return shipment;
    //   } catch (error) {
    //     error("Error creating fulfillment:", error);
    //     throw error;
    //   }

      
  
    // do something with the product...
    
  }
  
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.FULFILLMENT_CREATED,
    context: {
      subscriberId: "fulfillment-created-handler",
    },
  }