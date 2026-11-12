import { Router } from "express";

import { runDemandAgentController } from "../controllers/demand-agent.controller.js";
import { runSupplierAgentController } from "../controllers/supplier-agent.controller.js";
import { runAllocationAgentController } from "../controllers/allocation-agent.controller.js";
import { runFulfilmentAgentController } from "../controllers/fulfilment-agent.controller.js";

// Deterministic analyses used by the Python agents (via MCP) and the UI.
const router = Router();

router.post("/demand", runDemandAgentController);
router.post("/suppliers", runSupplierAgentController);
router.post("/allocate", runAllocationAgentController);
router.post("/fulfilment", runFulfilmentAgentController);

export default router;
