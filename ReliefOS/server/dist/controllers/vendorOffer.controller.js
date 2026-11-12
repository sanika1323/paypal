import { createVendorOffer, getAllVendorOffers, getVendorOfferById, updateVendorOffer, } from "../services/vendorOffer.service.js";
import { createVendorOfferSchema, updateVendorOfferSchema, } from "../utils/validators/vendor.validator.js";
export const createVendorOfferController = async (req, res) => {
    try {
        const validation = createVendorOfferSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
        }
        const offer = await createVendorOffer(validation.data);
        return res.status(201).json({
            success: true,
            message: "Vendor offer created successfully",
            data: offer,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "VENDOR_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Vendor not found",
                });
            }
            if (error.message === "PRODUCT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
        }
        console.error("Create vendor offer error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create vendor offer",
        });
    }
};
export const getAllVendorOffersController = async (req, res) => {
    try {
        const vendorId = typeof req.query.vendorId === "string"
            ? req.query.vendorId
            : undefined;
        const productId = typeof req.query.productId === "string"
            ? req.query.productId
            : undefined;
        const offers = await getAllVendorOffers(vendorId, productId);
        return res.status(200).json({
            success: true,
            count: offers.length,
            data: offers,
        });
    }
    catch (error) {
        console.error("Get vendor offers error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve vendor offers",
        });
    }
};
export const getVendorOfferByIdController = async (req, res) => {
    try {
        const offer = await getVendorOfferById(req.params.id);
        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Vendor offer not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: offer,
        });
    }
    catch (error) {
        console.error("Get vendor offer error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve vendor offer",
        });
    }
};
export const updateVendorOfferController = async (req, res) => {
    try {
        const validation = updateVendorOfferSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
        }
        const offer = await updateVendorOffer(req.params.id, validation.data);
        return res.status(200).json({
            success: true,
            message: "Vendor offer updated successfully",
            data: offer,
        });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Vendor offer not found",
            });
        }
        console.error("Update vendor offer error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update vendor offer",
        });
    }
};
//# sourceMappingURL=vendorOffer.controller.js.map