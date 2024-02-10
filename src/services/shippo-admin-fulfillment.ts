import { AbstractFulfillmentService, Cart, Fulfillment, LineItem, Order } from "@medusajs/medusa";
import { log } from "console";
// import { FulfillmentService } from "medusa-interfaces";
// import shippo, { Shippo } from "@macder/shippo";
// import shippo from "medusa-fulfillment-shippo";

class ShippoAdminFulfillmentService extends AbstractFulfillmentService {
  static identifier = "shippo-admin";

    // private shippoClient: Shippo;

  constructor(container, options) {
    super(container)
    // const apiKey = "shippo_test_b76c740df140d7a7c168271784c86c205b3157c9";
    // this.shippoClient = shippo(apiKey);
    // this.client = new Client(options)
  }

//   async #fetchCarriers(): Promise<any[]> {
//     // should paginate or poll
//     const response = await this.shippoClient.carrieraccount.list({ service_levels: true, results: 100 });
//     return response.results;
//   }
  

  async getFulfillmentOptions(): Promise<{id: string}[]> {
    return [
        {id: "shippo-admin-fulfillment"},
        {id: "shippo-admin-return-fulfillment"},
    ];
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    cart: Cart
  ): Promise<Record<string, unknown>> {
    log("hbjvbdfjbv" ,optionData, data, cart);
    return {
      ...data,
    };
  }

  async validateOption(
    data: Record<string, unknown>
  ): Promise<boolean> {
    console.log(data);
    // return true;
    log("validateoption ", data)
    return data.id == "shippo-admin-fulfillment";
  }

  async canCalculate(
    data: Record<string, unknown>
  ): Promise<boolean> {
    console.log(data);
    return true;
    // return data.id == "shippo-admin-fulfillment";
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    cart: Cart
  ): Promise<number> {
    console.log(optionData, data, cart);
    return cart.items.length * 1000;
  }

//   calculatePrice() {
//     throw Error("Shippo Admin Fulfillment service cannot calculatePrice")
//   }

  createOrder() {
    // No data is being sent anywhere
    return Promise.resolve({})
  }

  createReturn() {
    // No data is being sent anywhere
    return Promise.resolve({})
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: LineItem[],
    order: Order,
    fulfillment: Fulfillment
  ) {
return {...data, ...items, ...order, fulfillment};
  }

  

  cancelFulfillment() {
    return Promise.resolve({})
  }

  async getFulfillmentDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    // assuming you contact a client to
    // retrieve the document
    return {
        ...data
    };
  }

  async getReturnDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    // assuming you contact a client to
    // retrieve the document
    return {...data}
  }

  async getShipmentDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    // assuming you contact a client to
    // retrieve the document
    return {...data}
  }

  async retrieveDocuments(
    fulfillmentData: Record<string, unknown>,
    documentType: "invoice" | "label"
  ): Promise<any> {
    // assuming you contact a client to
    // retrieve the document
    return {}
  }

  
}

export default ShippoAdminFulfillmentService