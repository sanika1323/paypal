import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, } from "../services/product.service.js";
import { createProductSchema, updateProductSchema, } from "../utils/validators/product.validator.js";
const getId = (req) => {
    const id = req.params.id;
    return typeof id === "string" && id.trim()
        ? id
        : null;
};
const getErrorCode = (error) => {
    if (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string") {
        return error.code;
    }
    return null;
};
export const createProductController = async (req, res) => {
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid product data",
            errors: validation.error.issues,
        });
    }
    try {
        const product = await createProduct(validation.data);
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        if (getErrorCode(error) === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A product with these details already exists",
            });
        }
        console.error("Create product error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};
export const getAllProductsController = async (_req, res) => {
    try {
        const products = await getAllProducts();
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
        });
    }
};
export const getProductByIdController = async (req, res) => {
    const id = getId(req);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }
    try {
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve product",
        });
    }
};
export const updateProductController = async (req, res) => {
    const id = getId(req);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid product update data",
            errors: validation.error.issues,
        });
    }
    try {
        const product = await updateProduct(id, validation.data);
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        if (getErrorCode(error) === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        if (getErrorCode(error) === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A product with these details already exists",
            });
        }
        console.error("Update product error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
};
export const deleteProductController = async (req, res) => {
    const id = getId(req);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }
    try {
        const product = await deleteProduct(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PRODUCT_HAS_LINKED_RECORDS") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a product with existing relief requests or supplier offers",
            });
        }
        console.error("Delete product error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
};
//# sourceMappingURL=product.controller.js.map