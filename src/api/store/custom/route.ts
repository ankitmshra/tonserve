// import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// export async function GET(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   res.sendStatus(200);
// }

import type { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import { 
  ProductModuleService
} from "@medusajs/product"

export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const productModuleService: ProductModuleService = 
    req.scope.resolve(
      "productModuleService"
    )

  return res.json({
    products: productModuleService.list()
  })
}