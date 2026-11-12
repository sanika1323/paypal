import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model VendorOffer
 *
 */
export type VendorOfferModel = runtime.Types.Result.DefaultSelection<Prisma.$VendorOfferPayload>;
export type AggregateVendorOffer = {
    _count: VendorOfferCountAggregateOutputType | null;
    _avg: VendorOfferAvgAggregateOutputType | null;
    _sum: VendorOfferSumAggregateOutputType | null;
    _min: VendorOfferMinAggregateOutputType | null;
    _max: VendorOfferMaxAggregateOutputType | null;
};
export type VendorOfferAvgAggregateOutputType = {
    unitPrice: runtime.Decimal | null;
    capacity: number | null;
    deliveryDays: number | null;
};
export type VendorOfferSumAggregateOutputType = {
    unitPrice: runtime.Decimal | null;
    capacity: number | null;
    deliveryDays: number | null;
};
export type VendorOfferMinAggregateOutputType = {
    id: string | null;
    vendorId: string | null;
    productId: string | null;
    unitPrice: runtime.Decimal | null;
    capacity: number | null;
    deliveryDays: number | null;
    createdAt: Date | null;
};
export type VendorOfferMaxAggregateOutputType = {
    id: string | null;
    vendorId: string | null;
    productId: string | null;
    unitPrice: runtime.Decimal | null;
    capacity: number | null;
    deliveryDays: number | null;
    createdAt: Date | null;
};
export type VendorOfferCountAggregateOutputType = {
    id: number;
    vendorId: number;
    productId: number;
    unitPrice: number;
    capacity: number;
    deliveryDays: number;
    createdAt: number;
    _all: number;
};
export type VendorOfferAvgAggregateInputType = {
    unitPrice?: true;
    capacity?: true;
    deliveryDays?: true;
};
export type VendorOfferSumAggregateInputType = {
    unitPrice?: true;
    capacity?: true;
    deliveryDays?: true;
};
export type VendorOfferMinAggregateInputType = {
    id?: true;
    vendorId?: true;
    productId?: true;
    unitPrice?: true;
    capacity?: true;
    deliveryDays?: true;
    createdAt?: true;
};
export type VendorOfferMaxAggregateInputType = {
    id?: true;
    vendorId?: true;
    productId?: true;
    unitPrice?: true;
    capacity?: true;
    deliveryDays?: true;
    createdAt?: true;
};
export type VendorOfferCountAggregateInputType = {
    id?: true;
    vendorId?: true;
    productId?: true;
    unitPrice?: true;
    capacity?: true;
    deliveryDays?: true;
    createdAt?: true;
    _all?: true;
};
export type VendorOfferAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VendorOffer to aggregate.
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VendorOffers to fetch.
     */
    orderBy?: Prisma.VendorOfferOrderByWithRelationInput | Prisma.VendorOfferOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VendorOfferWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VendorOffers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VendorOffers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VendorOffers
    **/
    _count?: true | VendorOfferCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: VendorOfferAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: VendorOfferSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VendorOfferMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VendorOfferMaxAggregateInputType;
};
export type GetVendorOfferAggregateType<T extends VendorOfferAggregateArgs> = {
    [P in keyof T & keyof AggregateVendorOffer]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVendorOffer[P]> : Prisma.GetScalarType<T[P], AggregateVendorOffer[P]>;
};
export type VendorOfferGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VendorOfferWhereInput;
    orderBy?: Prisma.VendorOfferOrderByWithAggregationInput | Prisma.VendorOfferOrderByWithAggregationInput[];
    by: Prisma.VendorOfferScalarFieldEnum[] | Prisma.VendorOfferScalarFieldEnum;
    having?: Prisma.VendorOfferScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VendorOfferCountAggregateInputType | true;
    _avg?: VendorOfferAvgAggregateInputType;
    _sum?: VendorOfferSumAggregateInputType;
    _min?: VendorOfferMinAggregateInputType;
    _max?: VendorOfferMaxAggregateInputType;
};
export type VendorOfferGroupByOutputType = {
    id: string;
    vendorId: string;
    productId: string;
    unitPrice: runtime.Decimal;
    capacity: number;
    deliveryDays: number;
    createdAt: Date;
    _count: VendorOfferCountAggregateOutputType | null;
    _avg: VendorOfferAvgAggregateOutputType | null;
    _sum: VendorOfferSumAggregateOutputType | null;
    _min: VendorOfferMinAggregateOutputType | null;
    _max: VendorOfferMaxAggregateOutputType | null;
};
type GetVendorOfferGroupByPayload<T extends VendorOfferGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VendorOfferGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VendorOfferGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VendorOfferGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VendorOfferGroupByOutputType[P]>;
}>>;
export type VendorOfferWhereInput = {
    AND?: Prisma.VendorOfferWhereInput | Prisma.VendorOfferWhereInput[];
    OR?: Prisma.VendorOfferWhereInput[];
    NOT?: Prisma.VendorOfferWhereInput | Prisma.VendorOfferWhereInput[];
    id?: Prisma.StringFilter<"VendorOffer"> | string;
    vendorId?: Prisma.StringFilter<"VendorOffer"> | string;
    productId?: Prisma.StringFilter<"VendorOffer"> | string;
    unitPrice?: Prisma.DecimalFilter<"VendorOffer"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFilter<"VendorOffer"> | number;
    deliveryDays?: Prisma.IntFilter<"VendorOffer"> | number;
    createdAt?: Prisma.DateTimeFilter<"VendorOffer"> | Date | string;
    vendor?: Prisma.XOR<Prisma.VendorScalarRelationFilter, Prisma.VendorWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
};
export type VendorOfferOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    vendorId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    vendor?: Prisma.VendorOrderByWithRelationInput;
    product?: Prisma.ProductOrderByWithRelationInput;
};
export type VendorOfferWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.VendorOfferWhereInput | Prisma.VendorOfferWhereInput[];
    OR?: Prisma.VendorOfferWhereInput[];
    NOT?: Prisma.VendorOfferWhereInput | Prisma.VendorOfferWhereInput[];
    vendorId?: Prisma.StringFilter<"VendorOffer"> | string;
    productId?: Prisma.StringFilter<"VendorOffer"> | string;
    unitPrice?: Prisma.DecimalFilter<"VendorOffer"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFilter<"VendorOffer"> | number;
    deliveryDays?: Prisma.IntFilter<"VendorOffer"> | number;
    createdAt?: Prisma.DateTimeFilter<"VendorOffer"> | Date | string;
    vendor?: Prisma.XOR<Prisma.VendorScalarRelationFilter, Prisma.VendorWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
}, "id">;
export type VendorOfferOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    vendorId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.VendorOfferCountOrderByAggregateInput;
    _avg?: Prisma.VendorOfferAvgOrderByAggregateInput;
    _max?: Prisma.VendorOfferMaxOrderByAggregateInput;
    _min?: Prisma.VendorOfferMinOrderByAggregateInput;
    _sum?: Prisma.VendorOfferSumOrderByAggregateInput;
};
export type VendorOfferScalarWhereWithAggregatesInput = {
    AND?: Prisma.VendorOfferScalarWhereWithAggregatesInput | Prisma.VendorOfferScalarWhereWithAggregatesInput[];
    OR?: Prisma.VendorOfferScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VendorOfferScalarWhereWithAggregatesInput | Prisma.VendorOfferScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"VendorOffer"> | string;
    vendorId?: Prisma.StringWithAggregatesFilter<"VendorOffer"> | string;
    productId?: Prisma.StringWithAggregatesFilter<"VendorOffer"> | string;
    unitPrice?: Prisma.DecimalWithAggregatesFilter<"VendorOffer"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntWithAggregatesFilter<"VendorOffer"> | number;
    deliveryDays?: Prisma.IntWithAggregatesFilter<"VendorOffer"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"VendorOffer"> | Date | string;
};
export type VendorOfferCreateInput = {
    id?: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
    vendor: Prisma.VendorCreateNestedOneWithoutOffersInput;
    product: Prisma.ProductCreateNestedOneWithoutOffersInput;
};
export type VendorOfferUncheckedCreateInput = {
    id?: string;
    vendorId: string;
    productId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    vendor?: Prisma.VendorUpdateOneRequiredWithoutOffersNestedInput;
    product?: Prisma.ProductUpdateOneRequiredWithoutOffersNestedInput;
};
export type VendorOfferUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    vendorId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferCreateManyInput = {
    id?: string;
    vendorId: string;
    productId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    vendorId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferListRelationFilter = {
    every?: Prisma.VendorOfferWhereInput;
    some?: Prisma.VendorOfferWhereInput;
    none?: Prisma.VendorOfferWhereInput;
};
export type VendorOfferOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type VendorOfferCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    vendorId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VendorOfferAvgOrderByAggregateInput = {
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
};
export type VendorOfferMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    vendorId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VendorOfferMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    vendorId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VendorOfferSumOrderByAggregateInput = {
    unitPrice?: Prisma.SortOrder;
    capacity?: Prisma.SortOrder;
    deliveryDays?: Prisma.SortOrder;
};
export type VendorOfferCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput> | Prisma.VendorOfferCreateWithoutProductInput[] | Prisma.VendorOfferUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutProductInput | Prisma.VendorOfferCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.VendorOfferCreateManyProductInputEnvelope;
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
};
export type VendorOfferUncheckedCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput> | Prisma.VendorOfferCreateWithoutProductInput[] | Prisma.VendorOfferUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutProductInput | Prisma.VendorOfferCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.VendorOfferCreateManyProductInputEnvelope;
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
};
export type VendorOfferUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput> | Prisma.VendorOfferCreateWithoutProductInput[] | Prisma.VendorOfferUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutProductInput | Prisma.VendorOfferCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.VendorOfferUpsertWithWhereUniqueWithoutProductInput | Prisma.VendorOfferUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.VendorOfferCreateManyProductInputEnvelope;
    set?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    disconnect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    delete?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    update?: Prisma.VendorOfferUpdateWithWhereUniqueWithoutProductInput | Prisma.VendorOfferUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.VendorOfferUpdateManyWithWhereWithoutProductInput | Prisma.VendorOfferUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
};
export type VendorOfferUncheckedUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput> | Prisma.VendorOfferCreateWithoutProductInput[] | Prisma.VendorOfferUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutProductInput | Prisma.VendorOfferCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.VendorOfferUpsertWithWhereUniqueWithoutProductInput | Prisma.VendorOfferUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.VendorOfferCreateManyProductInputEnvelope;
    set?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    disconnect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    delete?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    update?: Prisma.VendorOfferUpdateWithWhereUniqueWithoutProductInput | Prisma.VendorOfferUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.VendorOfferUpdateManyWithWhereWithoutProductInput | Prisma.VendorOfferUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
};
export type VendorOfferCreateNestedManyWithoutVendorInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput> | Prisma.VendorOfferCreateWithoutVendorInput[] | Prisma.VendorOfferUncheckedCreateWithoutVendorInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutVendorInput | Prisma.VendorOfferCreateOrConnectWithoutVendorInput[];
    createMany?: Prisma.VendorOfferCreateManyVendorInputEnvelope;
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
};
export type VendorOfferUncheckedCreateNestedManyWithoutVendorInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput> | Prisma.VendorOfferCreateWithoutVendorInput[] | Prisma.VendorOfferUncheckedCreateWithoutVendorInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutVendorInput | Prisma.VendorOfferCreateOrConnectWithoutVendorInput[];
    createMany?: Prisma.VendorOfferCreateManyVendorInputEnvelope;
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
};
export type VendorOfferUpdateManyWithoutVendorNestedInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput> | Prisma.VendorOfferCreateWithoutVendorInput[] | Prisma.VendorOfferUncheckedCreateWithoutVendorInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutVendorInput | Prisma.VendorOfferCreateOrConnectWithoutVendorInput[];
    upsert?: Prisma.VendorOfferUpsertWithWhereUniqueWithoutVendorInput | Prisma.VendorOfferUpsertWithWhereUniqueWithoutVendorInput[];
    createMany?: Prisma.VendorOfferCreateManyVendorInputEnvelope;
    set?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    disconnect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    delete?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    update?: Prisma.VendorOfferUpdateWithWhereUniqueWithoutVendorInput | Prisma.VendorOfferUpdateWithWhereUniqueWithoutVendorInput[];
    updateMany?: Prisma.VendorOfferUpdateManyWithWhereWithoutVendorInput | Prisma.VendorOfferUpdateManyWithWhereWithoutVendorInput[];
    deleteMany?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
};
export type VendorOfferUncheckedUpdateManyWithoutVendorNestedInput = {
    create?: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput> | Prisma.VendorOfferCreateWithoutVendorInput[] | Prisma.VendorOfferUncheckedCreateWithoutVendorInput[];
    connectOrCreate?: Prisma.VendorOfferCreateOrConnectWithoutVendorInput | Prisma.VendorOfferCreateOrConnectWithoutVendorInput[];
    upsert?: Prisma.VendorOfferUpsertWithWhereUniqueWithoutVendorInput | Prisma.VendorOfferUpsertWithWhereUniqueWithoutVendorInput[];
    createMany?: Prisma.VendorOfferCreateManyVendorInputEnvelope;
    set?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    disconnect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    delete?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    connect?: Prisma.VendorOfferWhereUniqueInput | Prisma.VendorOfferWhereUniqueInput[];
    update?: Prisma.VendorOfferUpdateWithWhereUniqueWithoutVendorInput | Prisma.VendorOfferUpdateWithWhereUniqueWithoutVendorInput[];
    updateMany?: Prisma.VendorOfferUpdateManyWithWhereWithoutVendorInput | Prisma.VendorOfferUpdateManyWithWhereWithoutVendorInput[];
    deleteMany?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type VendorOfferCreateWithoutProductInput = {
    id?: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
    vendor: Prisma.VendorCreateNestedOneWithoutOffersInput;
};
export type VendorOfferUncheckedCreateWithoutProductInput = {
    id?: string;
    vendorId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferCreateOrConnectWithoutProductInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    create: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput>;
};
export type VendorOfferCreateManyProductInputEnvelope = {
    data: Prisma.VendorOfferCreateManyProductInput | Prisma.VendorOfferCreateManyProductInput[];
    skipDuplicates?: boolean;
};
export type VendorOfferUpsertWithWhereUniqueWithoutProductInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    update: Prisma.XOR<Prisma.VendorOfferUpdateWithoutProductInput, Prisma.VendorOfferUncheckedUpdateWithoutProductInput>;
    create: Prisma.XOR<Prisma.VendorOfferCreateWithoutProductInput, Prisma.VendorOfferUncheckedCreateWithoutProductInput>;
};
export type VendorOfferUpdateWithWhereUniqueWithoutProductInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    data: Prisma.XOR<Prisma.VendorOfferUpdateWithoutProductInput, Prisma.VendorOfferUncheckedUpdateWithoutProductInput>;
};
export type VendorOfferUpdateManyWithWhereWithoutProductInput = {
    where: Prisma.VendorOfferScalarWhereInput;
    data: Prisma.XOR<Prisma.VendorOfferUpdateManyMutationInput, Prisma.VendorOfferUncheckedUpdateManyWithoutProductInput>;
};
export type VendorOfferScalarWhereInput = {
    AND?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
    OR?: Prisma.VendorOfferScalarWhereInput[];
    NOT?: Prisma.VendorOfferScalarWhereInput | Prisma.VendorOfferScalarWhereInput[];
    id?: Prisma.StringFilter<"VendorOffer"> | string;
    vendorId?: Prisma.StringFilter<"VendorOffer"> | string;
    productId?: Prisma.StringFilter<"VendorOffer"> | string;
    unitPrice?: Prisma.DecimalFilter<"VendorOffer"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFilter<"VendorOffer"> | number;
    deliveryDays?: Prisma.IntFilter<"VendorOffer"> | number;
    createdAt?: Prisma.DateTimeFilter<"VendorOffer"> | Date | string;
};
export type VendorOfferCreateWithoutVendorInput = {
    id?: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
    product: Prisma.ProductCreateNestedOneWithoutOffersInput;
};
export type VendorOfferUncheckedCreateWithoutVendorInput = {
    id?: string;
    productId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferCreateOrConnectWithoutVendorInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    create: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput>;
};
export type VendorOfferCreateManyVendorInputEnvelope = {
    data: Prisma.VendorOfferCreateManyVendorInput | Prisma.VendorOfferCreateManyVendorInput[];
    skipDuplicates?: boolean;
};
export type VendorOfferUpsertWithWhereUniqueWithoutVendorInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    update: Prisma.XOR<Prisma.VendorOfferUpdateWithoutVendorInput, Prisma.VendorOfferUncheckedUpdateWithoutVendorInput>;
    create: Prisma.XOR<Prisma.VendorOfferCreateWithoutVendorInput, Prisma.VendorOfferUncheckedCreateWithoutVendorInput>;
};
export type VendorOfferUpdateWithWhereUniqueWithoutVendorInput = {
    where: Prisma.VendorOfferWhereUniqueInput;
    data: Prisma.XOR<Prisma.VendorOfferUpdateWithoutVendorInput, Prisma.VendorOfferUncheckedUpdateWithoutVendorInput>;
};
export type VendorOfferUpdateManyWithWhereWithoutVendorInput = {
    where: Prisma.VendorOfferScalarWhereInput;
    data: Prisma.XOR<Prisma.VendorOfferUpdateManyMutationInput, Prisma.VendorOfferUncheckedUpdateManyWithoutVendorInput>;
};
export type VendorOfferCreateManyProductInput = {
    id?: string;
    vendorId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    vendor?: Prisma.VendorUpdateOneRequiredWithoutOffersNestedInput;
};
export type VendorOfferUncheckedUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    vendorId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferUncheckedUpdateManyWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    vendorId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferCreateManyVendorInput = {
    id?: string;
    productId: string;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity: number;
    deliveryDays: number;
    createdAt?: Date | string;
};
export type VendorOfferUpdateWithoutVendorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    product?: Prisma.ProductUpdateOneRequiredWithoutOffersNestedInput;
};
export type VendorOfferUncheckedUpdateWithoutVendorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferUncheckedUpdateManyWithoutVendorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    capacity?: Prisma.IntFieldUpdateOperationsInput | number;
    deliveryDays?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VendorOfferSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    vendorId?: boolean;
    productId?: boolean;
    unitPrice?: boolean;
    capacity?: boolean;
    deliveryDays?: boolean;
    createdAt?: boolean;
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["vendorOffer"]>;
export type VendorOfferSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    vendorId?: boolean;
    productId?: boolean;
    unitPrice?: boolean;
    capacity?: boolean;
    deliveryDays?: boolean;
    createdAt?: boolean;
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["vendorOffer"]>;
export type VendorOfferSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    vendorId?: boolean;
    productId?: boolean;
    unitPrice?: boolean;
    capacity?: boolean;
    deliveryDays?: boolean;
    createdAt?: boolean;
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["vendorOffer"]>;
export type VendorOfferSelectScalar = {
    id?: boolean;
    vendorId?: boolean;
    productId?: boolean;
    unitPrice?: boolean;
    capacity?: boolean;
    deliveryDays?: boolean;
    createdAt?: boolean;
};
export type VendorOfferOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "vendorId" | "productId" | "unitPrice" | "capacity" | "deliveryDays" | "createdAt", ExtArgs["result"]["vendorOffer"]>;
export type VendorOfferInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type VendorOfferIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type VendorOfferIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    vendor?: boolean | Prisma.VendorDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type $VendorOfferPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VendorOffer";
    objects: {
        vendor: Prisma.$VendorPayload<ExtArgs>;
        product: Prisma.$ProductPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        vendorId: string;
        productId: string;
        unitPrice: runtime.Decimal;
        capacity: number;
        deliveryDays: number;
        createdAt: Date;
    }, ExtArgs["result"]["vendorOffer"]>;
    composites: {};
};
export type VendorOfferGetPayload<S extends boolean | null | undefined | VendorOfferDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload, S>;
export type VendorOfferCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VendorOfferFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VendorOfferCountAggregateInputType | true;
};
export interface VendorOfferDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VendorOffer'];
        meta: {
            name: 'VendorOffer';
        };
    };
    /**
     * Find zero or one VendorOffer that matches the filter.
     * @param {VendorOfferFindUniqueArgs} args - Arguments to find a VendorOffer
     * @example
     * // Get one VendorOffer
     * const vendorOffer = await prisma.vendorOffer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VendorOfferFindUniqueArgs>(args: Prisma.SelectSubset<T, VendorOfferFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VendorOffer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VendorOfferFindUniqueOrThrowArgs} args - Arguments to find a VendorOffer
     * @example
     * // Get one VendorOffer
     * const vendorOffer = await prisma.vendorOffer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VendorOfferFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VendorOfferFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VendorOffer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferFindFirstArgs} args - Arguments to find a VendorOffer
     * @example
     * // Get one VendorOffer
     * const vendorOffer = await prisma.vendorOffer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VendorOfferFindFirstArgs>(args?: Prisma.SelectSubset<T, VendorOfferFindFirstArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VendorOffer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferFindFirstOrThrowArgs} args - Arguments to find a VendorOffer
     * @example
     * // Get one VendorOffer
     * const vendorOffer = await prisma.vendorOffer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VendorOfferFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VendorOfferFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VendorOffers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VendorOffers
     * const vendorOffers = await prisma.vendorOffer.findMany()
     *
     * // Get first 10 VendorOffers
     * const vendorOffers = await prisma.vendorOffer.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const vendorOfferWithIdOnly = await prisma.vendorOffer.findMany({ select: { id: true } })
     *
     */
    findMany<T extends VendorOfferFindManyArgs>(args?: Prisma.SelectSubset<T, VendorOfferFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VendorOffer.
     * @param {VendorOfferCreateArgs} args - Arguments to create a VendorOffer.
     * @example
     * // Create one VendorOffer
     * const VendorOffer = await prisma.vendorOffer.create({
     *   data: {
     *     // ... data to create a VendorOffer
     *   }
     * })
     *
     */
    create<T extends VendorOfferCreateArgs>(args: Prisma.SelectSubset<T, VendorOfferCreateArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VendorOffers.
     * @param {VendorOfferCreateManyArgs} args - Arguments to create many VendorOffers.
     * @example
     * // Create many VendorOffers
     * const vendorOffer = await prisma.vendorOffer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VendorOfferCreateManyArgs>(args?: Prisma.SelectSubset<T, VendorOfferCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VendorOffers and returns the data saved in the database.
     * @param {VendorOfferCreateManyAndReturnArgs} args - Arguments to create many VendorOffers.
     * @example
     * // Create many VendorOffers
     * const vendorOffer = await prisma.vendorOffer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VendorOffers and only return the `id`
     * const vendorOfferWithIdOnly = await prisma.vendorOffer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VendorOfferCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VendorOfferCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VendorOffer.
     * @param {VendorOfferDeleteArgs} args - Arguments to delete one VendorOffer.
     * @example
     * // Delete one VendorOffer
     * const VendorOffer = await prisma.vendorOffer.delete({
     *   where: {
     *     // ... filter to delete one VendorOffer
     *   }
     * })
     *
     */
    delete<T extends VendorOfferDeleteArgs>(args: Prisma.SelectSubset<T, VendorOfferDeleteArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VendorOffer.
     * @param {VendorOfferUpdateArgs} args - Arguments to update one VendorOffer.
     * @example
     * // Update one VendorOffer
     * const vendorOffer = await prisma.vendorOffer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VendorOfferUpdateArgs>(args: Prisma.SelectSubset<T, VendorOfferUpdateArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VendorOffers.
     * @param {VendorOfferDeleteManyArgs} args - Arguments to filter VendorOffers to delete.
     * @example
     * // Delete a few VendorOffers
     * const { count } = await prisma.vendorOffer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VendorOfferDeleteManyArgs>(args?: Prisma.SelectSubset<T, VendorOfferDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VendorOffers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VendorOffers
     * const vendorOffer = await prisma.vendorOffer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VendorOfferUpdateManyArgs>(args: Prisma.SelectSubset<T, VendorOfferUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VendorOffers and returns the data updated in the database.
     * @param {VendorOfferUpdateManyAndReturnArgs} args - Arguments to update many VendorOffers.
     * @example
     * // Update many VendorOffers
     * const vendorOffer = await prisma.vendorOffer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VendorOffers and only return the `id`
     * const vendorOfferWithIdOnly = await prisma.vendorOffer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends VendorOfferUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VendorOfferUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VendorOffer.
     * @param {VendorOfferUpsertArgs} args - Arguments to update or create a VendorOffer.
     * @example
     * // Update or create a VendorOffer
     * const vendorOffer = await prisma.vendorOffer.upsert({
     *   create: {
     *     // ... data to create a VendorOffer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VendorOffer we want to update
     *   }
     * })
     */
    upsert<T extends VendorOfferUpsertArgs>(args: Prisma.SelectSubset<T, VendorOfferUpsertArgs<ExtArgs>>): Prisma.Prisma__VendorOfferClient<runtime.Types.Result.GetResult<Prisma.$VendorOfferPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VendorOffers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferCountArgs} args - Arguments to filter VendorOffers to count.
     * @example
     * // Count the number of VendorOffers
     * const count = await prisma.vendorOffer.count({
     *   where: {
     *     // ... the filter for the VendorOffers we want to count
     *   }
     * })
    **/
    count<T extends VendorOfferCountArgs>(args?: Prisma.Subset<T, VendorOfferCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VendorOfferCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VendorOffer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VendorOfferAggregateArgs>(args: Prisma.Subset<T, VendorOfferAggregateArgs>): Prisma.PrismaPromise<GetVendorOfferAggregateType<T>>;
    /**
     * Group by VendorOffer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorOfferGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends VendorOfferGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VendorOfferGroupByArgs['orderBy'];
    } : {
        orderBy?: VendorOfferGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VendorOfferGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVendorOfferGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VendorOffer model
     */
    readonly fields: VendorOfferFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VendorOffer.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VendorOfferClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    vendor<T extends Prisma.VendorDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.VendorDefaultArgs<ExtArgs>>): Prisma.Prisma__VendorClient<runtime.Types.Result.GetResult<Prisma.$VendorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    product<T extends Prisma.ProductDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProductDefaultArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the VendorOffer model
 */
export interface VendorOfferFieldRefs {
    readonly id: Prisma.FieldRef<"VendorOffer", 'String'>;
    readonly vendorId: Prisma.FieldRef<"VendorOffer", 'String'>;
    readonly productId: Prisma.FieldRef<"VendorOffer", 'String'>;
    readonly unitPrice: Prisma.FieldRef<"VendorOffer", 'Decimal'>;
    readonly capacity: Prisma.FieldRef<"VendorOffer", 'Int'>;
    readonly deliveryDays: Prisma.FieldRef<"VendorOffer", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"VendorOffer", 'DateTime'>;
}
/**
 * VendorOffer findUnique
 */
export type VendorOfferFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter, which VendorOffer to fetch.
     */
    where: Prisma.VendorOfferWhereUniqueInput;
};
/**
 * VendorOffer findUniqueOrThrow
 */
export type VendorOfferFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter, which VendorOffer to fetch.
     */
    where: Prisma.VendorOfferWhereUniqueInput;
};
/**
 * VendorOffer findFirst
 */
export type VendorOfferFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter, which VendorOffer to fetch.
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VendorOffers to fetch.
     */
    orderBy?: Prisma.VendorOfferOrderByWithRelationInput | Prisma.VendorOfferOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VendorOffers.
     */
    cursor?: Prisma.VendorOfferWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VendorOffers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VendorOffers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VendorOffers.
     */
    distinct?: Prisma.VendorOfferScalarFieldEnum | Prisma.VendorOfferScalarFieldEnum[];
};
/**
 * VendorOffer findFirstOrThrow
 */
export type VendorOfferFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter, which VendorOffer to fetch.
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VendorOffers to fetch.
     */
    orderBy?: Prisma.VendorOfferOrderByWithRelationInput | Prisma.VendorOfferOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VendorOffers.
     */
    cursor?: Prisma.VendorOfferWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VendorOffers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VendorOffers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VendorOffers.
     */
    distinct?: Prisma.VendorOfferScalarFieldEnum | Prisma.VendorOfferScalarFieldEnum[];
};
/**
 * VendorOffer findMany
 */
export type VendorOfferFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter, which VendorOffers to fetch.
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VendorOffers to fetch.
     */
    orderBy?: Prisma.VendorOfferOrderByWithRelationInput | Prisma.VendorOfferOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VendorOffers.
     */
    cursor?: Prisma.VendorOfferWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VendorOffers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VendorOffers.
     */
    skip?: number;
    distinct?: Prisma.VendorOfferScalarFieldEnum | Prisma.VendorOfferScalarFieldEnum[];
};
/**
 * VendorOffer create
 */
export type VendorOfferCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * The data needed to create a VendorOffer.
     */
    data: Prisma.XOR<Prisma.VendorOfferCreateInput, Prisma.VendorOfferUncheckedCreateInput>;
};
/**
 * VendorOffer createMany
 */
export type VendorOfferCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VendorOffers.
     */
    data: Prisma.VendorOfferCreateManyInput | Prisma.VendorOfferCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VendorOffer createManyAndReturn
 */
export type VendorOfferCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * The data used to create many VendorOffers.
     */
    data: Prisma.VendorOfferCreateManyInput | Prisma.VendorOfferCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * VendorOffer update
 */
export type VendorOfferUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * The data needed to update a VendorOffer.
     */
    data: Prisma.XOR<Prisma.VendorOfferUpdateInput, Prisma.VendorOfferUncheckedUpdateInput>;
    /**
     * Choose, which VendorOffer to update.
     */
    where: Prisma.VendorOfferWhereUniqueInput;
};
/**
 * VendorOffer updateMany
 */
export type VendorOfferUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VendorOffers.
     */
    data: Prisma.XOR<Prisma.VendorOfferUpdateManyMutationInput, Prisma.VendorOfferUncheckedUpdateManyInput>;
    /**
     * Filter which VendorOffers to update
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * Limit how many VendorOffers to update.
     */
    limit?: number;
};
/**
 * VendorOffer updateManyAndReturn
 */
export type VendorOfferUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * The data used to update VendorOffers.
     */
    data: Prisma.XOR<Prisma.VendorOfferUpdateManyMutationInput, Prisma.VendorOfferUncheckedUpdateManyInput>;
    /**
     * Filter which VendorOffers to update
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * Limit how many VendorOffers to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * VendorOffer upsert
 */
export type VendorOfferUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * The filter to search for the VendorOffer to update in case it exists.
     */
    where: Prisma.VendorOfferWhereUniqueInput;
    /**
     * In case the VendorOffer found by the `where` argument doesn't exist, create a new VendorOffer with this data.
     */
    create: Prisma.XOR<Prisma.VendorOfferCreateInput, Prisma.VendorOfferUncheckedCreateInput>;
    /**
     * In case the VendorOffer was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VendorOfferUpdateInput, Prisma.VendorOfferUncheckedUpdateInput>;
};
/**
 * VendorOffer delete
 */
export type VendorOfferDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
    /**
     * Filter which VendorOffer to delete.
     */
    where: Prisma.VendorOfferWhereUniqueInput;
};
/**
 * VendorOffer deleteMany
 */
export type VendorOfferDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VendorOffers to delete
     */
    where?: Prisma.VendorOfferWhereInput;
    /**
     * Limit how many VendorOffers to delete.
     */
    limit?: number;
};
/**
 * VendorOffer without action
 */
export type VendorOfferDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorOffer
     */
    select?: Prisma.VendorOfferSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VendorOffer
     */
    omit?: Prisma.VendorOfferOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VendorOfferInclude<ExtArgs> | null;
};
export {};
