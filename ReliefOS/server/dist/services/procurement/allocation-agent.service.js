import { runSupplierAgent } from "./supplier-agent.service.js";
import { optimizeProcurement } from "./procurement-optimizer.service.js";
export const runAllocationAgent = async (input) => {
    // Evaluate suppliers using actual database offers.
    const supplierAnalysis = await runSupplierAgent({
        emergencyId: input.emergencyId,
    });
    // Run the existing deterministic optimizer.
    // The optimizer remains authoritative for quantities and costs.
    const optimization = await optimizeProcurement({
        emergencyId: input.emergencyId,
        budget: input.budget,
        maxDeliveryDays: input.maxDeliveryDays,
    });
    const decision = optimization.feasible
        ? "READY_FOR_PLAN"
        : "CONSTRAINTS_UNMET";
    return {
        agent: "ALLOCATION_AGENT",
        status: "COMPLETED",
        decision,
        emergency: optimization.emergency,
        input: {
            budget: optimization.budget,
            maxDeliveryDays: input.maxDeliveryDays ?? null,
        },
        supplierAnalysis: {
            summary: supplierAnalysis.summary,
            products: supplierAnalysis.products,
        },
        allocation: {
            budget: optimization.budget,
            estimatedCost: optimization.estimatedCost,
            remainingBudget: optimization.remainingBudget,
            budgetFeasible: optimization.budgetFeasible,
            fulfillment: optimization.fulfillment,
            feasible: optimization.feasible,
            constraints: optimization.constraints,
            products: optimization.products,
            supplierPurchases: optimization.supplierPurchases,
            ngoAllocations: optimization.ngoAllocations,
        },
        optimizationMethod: optimization.optimizationMethod,
        explanation: optimization.feasible
            ? "Demand has been allocated within the available budget and supplier capacity. The preview is ready for procurement plan creation and subsequent human approval."
            : "The optimizer completed its analysis, but one or more procurement constraints remain unsatisfied. Review the allocation before creating a procurement plan.",
        isPreview: true,
        generatedAt: new Date().toISOString(),
    };
};
//# sourceMappingURL=allocation-agent.service.js.map