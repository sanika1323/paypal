export declare const OrganizationType: {
    readonly NGO: 'NGO';
    readonly GOVERNMENT: 'GOVERNMENT';
    readonly SUPPLIER: 'SUPPLIER';
};
export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType];
export declare const RequestStatus: {
    readonly PENDING: 'PENDING';
    readonly VERIFIED: 'VERIFIED';
    readonly CONSOLIDATED: 'CONSOLIDATED';
    readonly APPROVED: 'APPROVED';
    readonly FULFILLED: 'FULFILLED';
    readonly REJECTED: 'REJECTED';
};
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];
export declare const ProcurementStatus: {
    readonly DRAFT: 'DRAFT';
    readonly ANALYZING: 'ANALYZING';
    readonly PENDING_APPROVAL: 'PENDING_APPROVAL';
    readonly APPROVED: 'APPROVED';
    readonly ORDERED: 'ORDERED';
    readonly COMPLETED: 'COMPLETED';
    readonly CANCELLED: 'CANCELLED';
};
export type ProcurementStatus = (typeof ProcurementStatus)[keyof typeof ProcurementStatus];
export declare const PaymentStatus: {
    readonly PENDING: 'PENDING';
    readonly APPROVED: 'APPROVED';
    readonly PROCESSING: 'PROCESSING';
    readonly COMPLETED: 'COMPLETED';
    readonly FAILED: 'FAILED';
    readonly REFUNDED: 'REFUNDED';
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const DeliveryStatus: {
    readonly PENDING: 'PENDING';
    readonly DISPATCHED: 'DISPATCHED';
    readonly IN_TRANSIT: 'IN_TRANSIT';
    readonly DELIVERED: 'DELIVERED';
    readonly DELAYED: 'DELAYED';
};
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];
