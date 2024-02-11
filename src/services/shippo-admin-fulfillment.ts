import { Cart, Fulfillment, LineItem, Order, User } from "@medusajs/medusa";
import { log } from "console";
import { FulfillmentService } from "medusa-interfaces";
import FetchAddressService from "./fetchAddress";
const shippo = require('shippo');

class ShippoAdminFulfillmentService extends FulfillmentService {
  static identifier = "shippo-admin";

    private shippoClient;
    private fetchAddressService: FetchAddressService;


  constructor(container, options) {
    super(container)
    const apiKey = "shippo_test_e5833aff35b985f39755ea360c6d0f381e198a7c";
    this.shippoClient = shippo(apiKey);
    this.fetchAddressService = new FetchAddressService();

  }
  

  async getFulfillmentOptions(): Promise<any[]> {
    return [
      {
        id: "shippo-admin-fulfillment",
      },
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    cart: Cart
  ): Promise<Record<string, unknown>> {
    try{
      const shipment = await this.shippoClient.address.create(
        {
          "name":cart.shipping_address.first_name+" "+cart.shipping_address.last_name, 
          "company":cart.shipping_address.company,
          "street1":cart.shipping_address.address_1,
          "street2":cart.shipping_address.address_2,
          "city":cart.shipping_address.city,
          "state":cart.shipping_address.province,
          "zip":cart.shipping_address.postal_code,
          "country":cart.shipping_address.country_code,
          "email":cart.email,
          "validate": true
        }
      )
      log("Shipment:", shipment)
      if(shipment.is_complete == false){
        if (shipment.validation_results.is_valid !== true) {
        throw new Error(shipment.validation_results.messages.text)
        }
      }
    }catch (error) {
      throw new Error(error)
    }
    return {
      ...data,
    }
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

  createOrder() {
    return Promise.resolve({})
  }

  createReturn() {
    return Promise.resolve({})
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: LineItem[],
    order: Order,
    fulfillment: Fulfillment,
  ) {
    log("Fulfillment Data:",fulfillment)
    const senderAddress = await FetchAddressService.getAddress(fulfillment.location_id);
    log("Sender Address:", senderAddress);
    


      const response = await this.shippoClient.shipment.create({
          "address_from": {
            "name" : "Jacob Hoyt",
            "company" : senderAddress.company,
            "street1": senderAddress.address_1,
            "city":  senderAddress.city,
            "state":senderAddress.address_2,
            "zip": senderAddress.postal_code,
            "country": senderAddress.country_code
        },
          "address_to": {
            "name": order.billing_address.first_name+" "+order.billing_address.last_name,
            "street1": order.billing_address.address_1+" "+order.billing_address.address_2,
            "city": order.billing_address.city,
            "state": order.billing_address.province,
            "zip": order.billing_address.postal_code,
            "country": order.billing_address.country_code
        },
          "parcels" : [{
            "length": "5",
            "width": "5",
            "height": "5",
            "distance_unit": "in",
            "weight": "2",
            "mass_unit": "lb"
          }],
          "async": false
      })

      let cheapestRateAmount = Infinity;
      let cheapestRateId = null;

      log("shipment:",response)

      response.rates.forEach(rate => {
        const amount = parseFloat(rate.amount);
        if (amount < cheapestRateAmount) {
          cheapestRateAmount = amount;
          cheapestRateId = rate.object_id;
        }
      });

      log("Cheapest rate object ID:", cheapestRateId);

      const label = await this.shippoClient.transaction.create({
        "rate": cheapestRateId,
        "label_file_type": "PDF",
        "async": false
      }) 
      log("Label:", label);

      return { data, order };

  }
  

  cancelFulfillment() {
    return Promise.resolve({})
  }

  async getFulfillmentDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    return {
        ...data
    };
  }

  async getReturnDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    return {...data}
  }

  async getShipmentDocuments(
    data: Record<string, unknown>
  ): Promise<any> {
    return {...data}
  }

  async retrieveDocuments(
    fulfillmentData: Record<string, unknown>,
    documentType: "invoice" | "label"
  ): Promise<any> {
    return {}
  }

  
}

export default ShippoAdminFulfillmentService