import * as runtime from "@prisma/client/runtime/library";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Organization
 *
 */
export type Organization = Prisma.OrganizationModel;
/**
 * Model Emergency
 *
 */
export type Emergency = Prisma.EmergencyModel;
/**
 * Model Product
 *
 */
export type Product = Prisma.ProductModel;
/**
 * Model ReliefRequest
 *
 */
export type ReliefRequest = Prisma.ReliefRequestModel;
/**
 * Model Vendor
 *
 */
export type Vendor = Prisma.VendorModel;
/**
 * Model VendorOffer
 *
 */
export type VendorOffer = Prisma.VendorOfferModel;
/**
 * Model ProcurementPlan
 *
 */
export type ProcurementPlan = Prisma.ProcurementPlanModel;
/**
 * Model Allocation
 *
 */
export type Allocation = Prisma.AllocationModel;
/**
 * Model Approval
 *
 */
export type Approval = Prisma.ApprovalModel;
/**
 * Model Payment
 *
 */
export type Payment = Prisma.PaymentModel;
/**
 * Model Delivery
 *
 */
export type Delivery = Prisma.DeliveryModel;
/**
 * Model AuditLog
 *
 */
export type AuditLog = Prisma.AuditLogModel;
