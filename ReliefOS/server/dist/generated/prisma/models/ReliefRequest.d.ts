import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ReliefRequest
 *
 */
export type ReliefRequestModel = runtime.Types.Result.DefaultSelection<Prisma.$ReliefRequestPayload>;
export type AggregateReliefRequest = {
    _count: ReliefRequestCountAggregateOutputType | null;
    _avg: ReliefRequestAvgAggregateOutputType | null;
    _sum: ReliefRequestSumAggregateOutputType | null;
    _min: ReliefRequestMinAggregateOutputType | null;
    _max: ReliefRequestMaxAggregateOutputType | null;
};
export type ReliefRequestAvgAggregateOutputType = {
    quantity: number | null;
    urgency: number | null;
};
export type ReliefRequestSumAggregateOutputType = {
    quantity: number | null;
    urgency: number | null;
};
export type ReliefRequestMinAggregateOutputType = {
    id: string | null;
    organizationId: string | null;
    emergencyId: string | null;
    productId: string | null;
    quantity: number | null;
    urgency: number | null;
    status: $Enums.RequestStatus | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ReliefRequestMaxAggregateOutputType = {
    id: string | null;
    organizationId: string | null;
    emergencyId: string | null;
    productId: string | null;
    quantity: number | null;
    urgency: number | null;
    status: $Enums.RequestStatus | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ReliefRequestCountAggregateOutputType = {
    id: number;
    organizationId: number;
    emergencyId: number;
    productId: number;
    quantity: number;
    urgency: number;
    status: number;
    notes: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ReliefRequestAvgAggregateInputType = {
    quantity?: true;
    urgency?: true;
};
export type ReliefRequestSumAggregateInputType = {
    quantity?: true;
    urgency?: true;
};
export type ReliefRequestMinAggregateInputType = {
    id?: true;
    organizationId?: true;
    emergencyId?: true;
    productId?: true;
    quantity?: true;
    urgency?: true;
    status?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ReliefRequestMaxAggregateInputType = {
    id?: true;
    organizationId?: true;
    emergencyId?: true;
    productId?: true;
    quantity?: true;
    urgency?: true;
    status?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ReliefRequestCountAggregateInputType = {
    id?: true;
    organizationId?: true;
    emergencyId?: true;
    productId?: true;
    quantity?: true;
    urgency?: true;
    status?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ReliefRequestAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ReliefRequest to aggregate.
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReliefRequests to fetch.
     */
    orderBy?: Prisma.ReliefRequestOrderByWithRelationInput | Prisma.ReliefRequestOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ReliefRequestWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReliefRequests from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReliefRequests.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ReliefRequests
    **/
    _count?: true | ReliefRequestCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ReliefRequestAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ReliefRequestSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ReliefRequestMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ReliefRequestMaxAggregateInputType;
};
export type GetReliefRequestAggregateType<T extends ReliefRequestAggregateArgs> = {
    [P in keyof T & keyof AggregateReliefRequest]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateReliefRequest[P]> : Prisma.GetScalarType<T[P], AggregateReliefRequest[P]>;
};
export type ReliefRequestGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReliefRequestWhereInput;
    orderBy?: Prisma.ReliefRequestOrderByWithAggregationInput | Prisma.ReliefRequestOrderByWithAggregationInput[];
    by: Prisma.ReliefRequestScalarFieldEnum[] | Prisma.ReliefRequestScalarFieldEnum;
    having?: Prisma.ReliefRequestScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ReliefRequestCountAggregateInputType | true;
    _avg?: ReliefRequestAvgAggregateInputType;
    _sum?: ReliefRequestSumAggregateInputType;
    _min?: ReliefRequestMinAggregateInputType;
    _max?: ReliefRequestMaxAggregateInputType;
};
export type ReliefRequestGroupByOutputType = {
    id: string;
    organizationId: string;
    emergencyId: string;
    productId: string;
    quantity: number;
    urgency: number;
    status: $Enums.RequestStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ReliefRequestCountAggregateOutputType | null;
    _avg: ReliefRequestAvgAggregateOutputType | null;
    _sum: ReliefRequestSumAggregateOutputType | null;
    _min: ReliefRequestMinAggregateOutputType | null;
    _max: ReliefRequestMaxAggregateOutputType | null;
};
type GetReliefRequestGroupByPayload<T extends ReliefRequestGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ReliefRequestGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ReliefRequestGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ReliefRequestGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ReliefRequestGroupByOutputType[P]>;
}>>;
export type ReliefRequestWhereInput = {
    AND?: Prisma.ReliefRequestWhereInput | Prisma.ReliefRequestWhereInput[];
    OR?: Prisma.ReliefRequestWhereInput[];
    NOT?: Prisma.ReliefRequestWhereInput | Prisma.ReliefRequestWhereInput[];
    id?: Prisma.StringFilter<"ReliefRequest"> | string;
    organizationId?: Prisma.StringFilter<"ReliefRequest"> | string;
    emergencyId?: Prisma.StringFilter<"ReliefRequest"> | string;
    productId?: Prisma.StringFilter<"ReliefRequest"> | string;
    quantity?: Prisma.IntFilter<"ReliefRequest"> | number;
    urgency?: Prisma.IntFilter<"ReliefRequest"> | number;
    status?: Prisma.EnumRequestStatusFilter<"ReliefRequest"> | $Enums.RequestStatus;
    notes?: Prisma.StringNullableFilter<"ReliefRequest"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    emergency?: Prisma.XOR<Prisma.EmergencyScalarRelationFilter, Prisma.EmergencyWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
};
export type ReliefRequestOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    organization?: Prisma.OrganizationOrderByWithRelationInput;
    emergency?: Prisma.EmergencyOrderByWithRelationInput;
    product?: Prisma.ProductOrderByWithRelationInput;
};
export type ReliefRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ReliefRequestWhereInput | Prisma.ReliefRequestWhereInput[];
    OR?: Prisma.ReliefRequestWhereInput[];
    NOT?: Prisma.ReliefRequestWhereInput | Prisma.ReliefRequestWhereInput[];
    organizationId?: Prisma.StringFilter<"ReliefRequest"> | string;
    emergencyId?: Prisma.StringFilter<"ReliefRequest"> | string;
    productId?: Prisma.StringFilter<"ReliefRequest"> | string;
    quantity?: Prisma.IntFilter<"ReliefRequest"> | number;
    urgency?: Prisma.IntFilter<"ReliefRequest"> | number;
    status?: Prisma.EnumRequestStatusFilter<"ReliefRequest"> | $Enums.RequestStatus;
    notes?: Prisma.StringNullableFilter<"ReliefRequest"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    emergency?: Prisma.XOR<Prisma.EmergencyScalarRelationFilter, Prisma.EmergencyWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
}, "id">;
export type ReliefRequestOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ReliefRequestCountOrderByAggregateInput;
    _avg?: Prisma.ReliefRequestAvgOrderByAggregateInput;
    _max?: Prisma.ReliefRequestMaxOrderByAggregateInput;
    _min?: Prisma.ReliefRequestMinOrderByAggregateInput;
    _sum?: Prisma.ReliefRequestSumOrderByAggregateInput;
};
export type ReliefRequestScalarWhereWithAggregatesInput = {
    AND?: Prisma.ReliefRequestScalarWhereWithAggregatesInput | Prisma.ReliefRequestScalarWhereWithAggregatesInput[];
    OR?: Prisma.ReliefRequestScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ReliefRequestScalarWhereWithAggregatesInput | Prisma.ReliefRequestScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ReliefRequest"> | string;
    organizationId?: Prisma.StringWithAggregatesFilter<"ReliefRequest"> | string;
    emergencyId?: Prisma.StringWithAggregatesFilter<"ReliefRequest"> | string;
    productId?: Prisma.StringWithAggregatesFilter<"ReliefRequest"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"ReliefRequest"> | number;
    urgency?: Prisma.IntWithAggregatesFilter<"ReliefRequest"> | number;
    status?: Prisma.EnumRequestStatusWithAggregatesFilter<"ReliefRequest"> | $Enums.RequestStatus;
    notes?: Prisma.StringNullableWithAggregatesFilter<"ReliefRequest"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ReliefRequest"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ReliefRequest"> | Date | string;
};
export type ReliefRequestCreateInput = {
    id?: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRequestsInput;
    emergency: Prisma.EmergencyCreateNestedOneWithoutRequestsInput;
    product: Prisma.ProductCreateNestedOneWithoutRequestsInput;
};
export type ReliefRequestUncheckedCreateInput = {
    id?: string;
    organizationId: string;
    emergencyId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRequestsNestedInput;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutRequestsNestedInput;
    product?: Prisma.ProductUpdateOneRequiredWithoutRequestsNestedInput;
};
export type ReliefRequestUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestCreateManyInput = {
    id?: string;
    organizationId: string;
    emergencyId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestListRelationFilter = {
    every?: Prisma.ReliefRequestWhereInput;
    some?: Prisma.ReliefRequestWhereInput;
    none?: Prisma.ReliefRequestWhereInput;
};
export type ReliefRequestOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ReliefRequestCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ReliefRequestAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
};
export type ReliefRequestMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ReliefRequestMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ReliefRequestSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    urgency?: Prisma.SortOrder;
};
export type ReliefRequestCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput> | Prisma.ReliefRequestCreateWithoutOrganizationInput[] | Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput | Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.ReliefRequestCreateManyOrganizationInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput> | Prisma.ReliefRequestCreateWithoutOrganizationInput[] | Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput | Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.ReliefRequestCreateManyOrganizationInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput> | Prisma.ReliefRequestCreateWithoutOrganizationInput[] | Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput | Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.ReliefRequestCreateManyOrganizationInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutOrganizationInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type ReliefRequestUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput> | Prisma.ReliefRequestCreateWithoutOrganizationInput[] | Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput | Prisma.ReliefRequestCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.ReliefRequestCreateManyOrganizationInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutOrganizationInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type ReliefRequestCreateNestedManyWithoutEmergencyInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput> | Prisma.ReliefRequestCreateWithoutEmergencyInput[] | Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput | Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput[];
    createMany?: Prisma.ReliefRequestCreateManyEmergencyInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUncheckedCreateNestedManyWithoutEmergencyInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput> | Prisma.ReliefRequestCreateWithoutEmergencyInput[] | Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput | Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput[];
    createMany?: Prisma.ReliefRequestCreateManyEmergencyInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUpdateManyWithoutEmergencyNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput> | Prisma.ReliefRequestCreateWithoutEmergencyInput[] | Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput | Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutEmergencyInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutEmergencyInput[];
    createMany?: Prisma.ReliefRequestCreateManyEmergencyInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutEmergencyInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutEmergencyInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutEmergencyInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutEmergencyInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type ReliefRequestUncheckedUpdateManyWithoutEmergencyNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput> | Prisma.ReliefRequestCreateWithoutEmergencyInput[] | Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput | Prisma.ReliefRequestCreateOrConnectWithoutEmergencyInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutEmergencyInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutEmergencyInput[];
    createMany?: Prisma.ReliefRequestCreateManyEmergencyInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutEmergencyInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutEmergencyInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutEmergencyInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutEmergencyInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type ReliefRequestCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput> | Prisma.ReliefRequestCreateWithoutProductInput[] | Prisma.ReliefRequestUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutProductInput | Prisma.ReliefRequestCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.ReliefRequestCreateManyProductInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUncheckedCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput> | Prisma.ReliefRequestCreateWithoutProductInput[] | Prisma.ReliefRequestUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutProductInput | Prisma.ReliefRequestCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.ReliefRequestCreateManyProductInputEnvelope;
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
};
export type ReliefRequestUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput> | Prisma.ReliefRequestCreateWithoutProductInput[] | Prisma.ReliefRequestUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutProductInput | Prisma.ReliefRequestCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutProductInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.ReliefRequestCreateManyProductInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutProductInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutProductInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type ReliefRequestUncheckedUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput> | Prisma.ReliefRequestCreateWithoutProductInput[] | Prisma.ReliefRequestUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.ReliefRequestCreateOrConnectWithoutProductInput | Prisma.ReliefRequestCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.ReliefRequestUpsertWithWhereUniqueWithoutProductInput | Prisma.ReliefRequestUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.ReliefRequestCreateManyProductInputEnvelope;
    set?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    disconnect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    delete?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    connect?: Prisma.ReliefRequestWhereUniqueInput | Prisma.ReliefRequestWhereUniqueInput[];
    update?: Prisma.ReliefRequestUpdateWithWhereUniqueWithoutProductInput | Prisma.ReliefRequestUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.ReliefRequestUpdateManyWithWhereWithoutProductInput | Prisma.ReliefRequestUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumRequestStatusFieldUpdateOperationsInput = {
    set?: $Enums.RequestStatus;
};
export type ReliefRequestCreateWithoutOrganizationInput = {
    id?: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    emergency: Prisma.EmergencyCreateNestedOneWithoutRequestsInput;
    product: Prisma.ProductCreateNestedOneWithoutRequestsInput;
};
export type ReliefRequestUncheckedCreateWithoutOrganizationInput = {
    id?: string;
    emergencyId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestCreateOrConnectWithoutOrganizationInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput>;
};
export type ReliefRequestCreateManyOrganizationInputEnvelope = {
    data: Prisma.ReliefRequestCreateManyOrganizationInput | Prisma.ReliefRequestCreateManyOrganizationInput[];
    skipDuplicates?: boolean;
};
export type ReliefRequestUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedUpdateWithoutOrganizationInput>;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedCreateWithoutOrganizationInput>;
};
export type ReliefRequestUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutOrganizationInput, Prisma.ReliefRequestUncheckedUpdateWithoutOrganizationInput>;
};
export type ReliefRequestUpdateManyWithWhereWithoutOrganizationInput = {
    where: Prisma.ReliefRequestScalarWhereInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateManyMutationInput, Prisma.ReliefRequestUncheckedUpdateManyWithoutOrganizationInput>;
};
export type ReliefRequestScalarWhereInput = {
    AND?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
    OR?: Prisma.ReliefRequestScalarWhereInput[];
    NOT?: Prisma.ReliefRequestScalarWhereInput | Prisma.ReliefRequestScalarWhereInput[];
    id?: Prisma.StringFilter<"ReliefRequest"> | string;
    organizationId?: Prisma.StringFilter<"ReliefRequest"> | string;
    emergencyId?: Prisma.StringFilter<"ReliefRequest"> | string;
    productId?: Prisma.StringFilter<"ReliefRequest"> | string;
    quantity?: Prisma.IntFilter<"ReliefRequest"> | number;
    urgency?: Prisma.IntFilter<"ReliefRequest"> | number;
    status?: Prisma.EnumRequestStatusFilter<"ReliefRequest"> | $Enums.RequestStatus;
    notes?: Prisma.StringNullableFilter<"ReliefRequest"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ReliefRequest"> | Date | string;
};
export type ReliefRequestCreateWithoutEmergencyInput = {
    id?: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRequestsInput;
    product: Prisma.ProductCreateNestedOneWithoutRequestsInput;
};
export type ReliefRequestUncheckedCreateWithoutEmergencyInput = {
    id?: string;
    organizationId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestCreateOrConnectWithoutEmergencyInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput>;
};
export type ReliefRequestCreateManyEmergencyInputEnvelope = {
    data: Prisma.ReliefRequestCreateManyEmergencyInput | Prisma.ReliefRequestCreateManyEmergencyInput[];
    skipDuplicates?: boolean;
};
export type ReliefRequestUpsertWithWhereUniqueWithoutEmergencyInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedUpdateWithoutEmergencyInput>;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedCreateWithoutEmergencyInput>;
};
export type ReliefRequestUpdateWithWhereUniqueWithoutEmergencyInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutEmergencyInput, Prisma.ReliefRequestUncheckedUpdateWithoutEmergencyInput>;
};
export type ReliefRequestUpdateManyWithWhereWithoutEmergencyInput = {
    where: Prisma.ReliefRequestScalarWhereInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateManyMutationInput, Prisma.ReliefRequestUncheckedUpdateManyWithoutEmergencyInput>;
};
export type ReliefRequestCreateWithoutProductInput = {
    id?: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRequestsInput;
    emergency: Prisma.EmergencyCreateNestedOneWithoutRequestsInput;
};
export type ReliefRequestUncheckedCreateWithoutProductInput = {
    id?: string;
    organizationId: string;
    emergencyId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestCreateOrConnectWithoutProductInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput>;
};
export type ReliefRequestCreateManyProductInputEnvelope = {
    data: Prisma.ReliefRequestCreateManyProductInput | Prisma.ReliefRequestCreateManyProductInput[];
    skipDuplicates?: boolean;
};
export type ReliefRequestUpsertWithWhereUniqueWithoutProductInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutProductInput, Prisma.ReliefRequestUncheckedUpdateWithoutProductInput>;
    create: Prisma.XOR<Prisma.ReliefRequestCreateWithoutProductInput, Prisma.ReliefRequestUncheckedCreateWithoutProductInput>;
};
export type ReliefRequestUpdateWithWhereUniqueWithoutProductInput = {
    where: Prisma.ReliefRequestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateWithoutProductInput, Prisma.ReliefRequestUncheckedUpdateWithoutProductInput>;
};
export type ReliefRequestUpdateManyWithWhereWithoutProductInput = {
    where: Prisma.ReliefRequestScalarWhereInput;
    data: Prisma.XOR<Prisma.ReliefRequestUpdateManyMutationInput, Prisma.ReliefRequestUncheckedUpdateManyWithoutProductInput>;
};
export type ReliefRequestCreateManyOrganizationInput = {
    id?: string;
    emergencyId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutRequestsNestedInput;
    product?: Prisma.ProductUpdateOneRequiredWithoutRequestsNestedInput;
};
export type ReliefRequestUncheckedUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestUncheckedUpdateManyWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestCreateManyEmergencyInput = {
    id?: string;
    organizationId: string;
    productId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestUpdateWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRequestsNestedInput;
    product?: Prisma.ProductUpdateOneRequiredWithoutRequestsNestedInput;
};
export type ReliefRequestUncheckedUpdateWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestUncheckedUpdateManyWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestCreateManyProductInput = {
    id?: string;
    organizationId: string;
    emergencyId: string;
    quantity: number;
    urgency?: number;
    status?: $Enums.RequestStatus;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ReliefRequestUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRequestsNestedInput;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutRequestsNestedInput;
};
export type ReliefRequestUncheckedUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestUncheckedUpdateManyWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    urgency?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReliefRequestSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    emergencyId?: boolean;
    productId?: boolean;
    quantity?: boolean;
    urgency?: boolean;
    status?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reliefRequest"]>;
export type ReliefRequestSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    emergencyId?: boolean;
    productId?: boolean;
    quantity?: boolean;
    urgency?: boolean;
    status?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reliefRequest"]>;
export type ReliefRequestSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    emergencyId?: boolean;
    productId?: boolean;
    quantity?: boolean;
    urgency?: boolean;
    status?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reliefRequest"]>;
export type ReliefRequestSelectScalar = {
    id?: boolean;
    organizationId?: boolean;
    emergencyId?: boolean;
    productId?: boolean;
    quantity?: boolean;
    urgency?: boolean;
    status?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ReliefRequestOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "organizationId" | "emergencyId" | "productId" | "quantity" | "urgency" | "status" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["reliefRequest"]>;
export type ReliefRequestInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type ReliefRequestIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type ReliefRequestIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type $ReliefRequestPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ReliefRequest";
    objects: {
        organization: Prisma.$OrganizationPayload<ExtArgs>;
        emergency: Prisma.$EmergencyPayload<ExtArgs>;
        product: Prisma.$ProductPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        organizationId: string;
        emergencyId: string;
        productId: string;
        quantity: number;
        urgency: number;
        status: $Enums.RequestStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["reliefRequest"]>;
    composites: {};
};
export type ReliefRequestGetPayload<S extends boolean | null | undefined | ReliefRequestDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload, S>;
export type ReliefRequestCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ReliefRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ReliefRequestCountAggregateInputType | true;
};
export interface ReliefRequestDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ReliefRequest'];
        meta: {
            name: 'ReliefRequest';
        };
    };
    /**
     * Find zero or one ReliefRequest that matches the filter.
     * @param {ReliefRequestFindUniqueArgs} args - Arguments to find a ReliefRequest
     * @example
     * // Get one ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReliefRequestFindUniqueArgs>(args: Prisma.SelectSubset<T, ReliefRequestFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ReliefRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReliefRequestFindUniqueOrThrowArgs} args - Arguments to find a ReliefRequest
     * @example
     * // Get one ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReliefRequestFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ReliefRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ReliefRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestFindFirstArgs} args - Arguments to find a ReliefRequest
     * @example
     * // Get one ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReliefRequestFindFirstArgs>(args?: Prisma.SelectSubset<T, ReliefRequestFindFirstArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ReliefRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestFindFirstOrThrowArgs} args - Arguments to find a ReliefRequest
     * @example
     * // Get one ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReliefRequestFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ReliefRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ReliefRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReliefRequests
     * const reliefRequests = await prisma.reliefRequest.findMany()
     *
     * // Get first 10 ReliefRequests
     * const reliefRequests = await prisma.reliefRequest.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const reliefRequestWithIdOnly = await prisma.reliefRequest.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ReliefRequestFindManyArgs>(args?: Prisma.SelectSubset<T, ReliefRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ReliefRequest.
     * @param {ReliefRequestCreateArgs} args - Arguments to create a ReliefRequest.
     * @example
     * // Create one ReliefRequest
     * const ReliefRequest = await prisma.reliefRequest.create({
     *   data: {
     *     // ... data to create a ReliefRequest
     *   }
     * })
     *
     */
    create<T extends ReliefRequestCreateArgs>(args: Prisma.SelectSubset<T, ReliefRequestCreateArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ReliefRequests.
     * @param {ReliefRequestCreateManyArgs} args - Arguments to create many ReliefRequests.
     * @example
     * // Create many ReliefRequests
     * const reliefRequest = await prisma.reliefRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ReliefRequestCreateManyArgs>(args?: Prisma.SelectSubset<T, ReliefRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ReliefRequests and returns the data saved in the database.
     * @param {ReliefRequestCreateManyAndReturnArgs} args - Arguments to create many ReliefRequests.
     * @example
     * // Create many ReliefRequests
     * const reliefRequest = await prisma.reliefRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ReliefRequests and only return the `id`
     * const reliefRequestWithIdOnly = await prisma.reliefRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ReliefRequestCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ReliefRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ReliefRequest.
     * @param {ReliefRequestDeleteArgs} args - Arguments to delete one ReliefRequest.
     * @example
     * // Delete one ReliefRequest
     * const ReliefRequest = await prisma.reliefRequest.delete({
     *   where: {
     *     // ... filter to delete one ReliefRequest
     *   }
     * })
     *
     */
    delete<T extends ReliefRequestDeleteArgs>(args: Prisma.SelectSubset<T, ReliefRequestDeleteArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ReliefRequest.
     * @param {ReliefRequestUpdateArgs} args - Arguments to update one ReliefRequest.
     * @example
     * // Update one ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ReliefRequestUpdateArgs>(args: Prisma.SelectSubset<T, ReliefRequestUpdateArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ReliefRequests.
     * @param {ReliefRequestDeleteManyArgs} args - Arguments to filter ReliefRequests to delete.
     * @example
     * // Delete a few ReliefRequests
     * const { count } = await prisma.reliefRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ReliefRequestDeleteManyArgs>(args?: Prisma.SelectSubset<T, ReliefRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ReliefRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReliefRequests
     * const reliefRequest = await prisma.reliefRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ReliefRequestUpdateManyArgs>(args: Prisma.SelectSubset<T, ReliefRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ReliefRequests and returns the data updated in the database.
     * @param {ReliefRequestUpdateManyAndReturnArgs} args - Arguments to update many ReliefRequests.
     * @example
     * // Update many ReliefRequests
     * const reliefRequest = await prisma.reliefRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ReliefRequests and only return the `id`
     * const reliefRequestWithIdOnly = await prisma.reliefRequest.updateManyAndReturn({
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
    updateManyAndReturn<T extends ReliefRequestUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ReliefRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ReliefRequest.
     * @param {ReliefRequestUpsertArgs} args - Arguments to update or create a ReliefRequest.
     * @example
     * // Update or create a ReliefRequest
     * const reliefRequest = await prisma.reliefRequest.upsert({
     *   create: {
     *     // ... data to create a ReliefRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReliefRequest we want to update
     *   }
     * })
     */
    upsert<T extends ReliefRequestUpsertArgs>(args: Prisma.SelectSubset<T, ReliefRequestUpsertArgs<ExtArgs>>): Prisma.Prisma__ReliefRequestClient<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ReliefRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestCountArgs} args - Arguments to filter ReliefRequests to count.
     * @example
     * // Count the number of ReliefRequests
     * const count = await prisma.reliefRequest.count({
     *   where: {
     *     // ... the filter for the ReliefRequests we want to count
     *   }
     * })
    **/
    count<T extends ReliefRequestCountArgs>(args?: Prisma.Subset<T, ReliefRequestCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ReliefRequestCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ReliefRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReliefRequestAggregateArgs>(args: Prisma.Subset<T, ReliefRequestAggregateArgs>): Prisma.PrismaPromise<GetReliefRequestAggregateType<T>>;
    /**
     * Group by ReliefRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReliefRequestGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ReliefRequestGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ReliefRequestGroupByArgs['orderBy'];
    } : {
        orderBy?: ReliefRequestGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ReliefRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReliefRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ReliefRequest model
     */
    readonly fields: ReliefRequestFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ReliefRequest.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ReliefRequestClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    organization<T extends Prisma.OrganizationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationDefaultArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    emergency<T extends Prisma.EmergencyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EmergencyDefaultArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ReliefRequest model
 */
export interface ReliefRequestFieldRefs {
    readonly id: Prisma.FieldRef<"ReliefRequest", 'String'>;
    readonly organizationId: Prisma.FieldRef<"ReliefRequest", 'String'>;
    readonly emergencyId: Prisma.FieldRef<"ReliefRequest", 'String'>;
    readonly productId: Prisma.FieldRef<"ReliefRequest", 'String'>;
    readonly quantity: Prisma.FieldRef<"ReliefRequest", 'Int'>;
    readonly urgency: Prisma.FieldRef<"ReliefRequest", 'Int'>;
    readonly status: Prisma.FieldRef<"ReliefRequest", 'RequestStatus'>;
    readonly notes: Prisma.FieldRef<"ReliefRequest", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ReliefRequest", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ReliefRequest", 'DateTime'>;
}
/**
 * ReliefRequest findUnique
 */
export type ReliefRequestFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter, which ReliefRequest to fetch.
     */
    where: Prisma.ReliefRequestWhereUniqueInput;
};
/**
 * ReliefRequest findUniqueOrThrow
 */
export type ReliefRequestFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter, which ReliefRequest to fetch.
     */
    where: Prisma.ReliefRequestWhereUniqueInput;
};
/**
 * ReliefRequest findFirst
 */
export type ReliefRequestFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter, which ReliefRequest to fetch.
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReliefRequests to fetch.
     */
    orderBy?: Prisma.ReliefRequestOrderByWithRelationInput | Prisma.ReliefRequestOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ReliefRequests.
     */
    cursor?: Prisma.ReliefRequestWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReliefRequests from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReliefRequests.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ReliefRequests.
     */
    distinct?: Prisma.ReliefRequestScalarFieldEnum | Prisma.ReliefRequestScalarFieldEnum[];
};
/**
 * ReliefRequest findFirstOrThrow
 */
export type ReliefRequestFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter, which ReliefRequest to fetch.
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReliefRequests to fetch.
     */
    orderBy?: Prisma.ReliefRequestOrderByWithRelationInput | Prisma.ReliefRequestOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ReliefRequests.
     */
    cursor?: Prisma.ReliefRequestWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReliefRequests from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReliefRequests.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ReliefRequests.
     */
    distinct?: Prisma.ReliefRequestScalarFieldEnum | Prisma.ReliefRequestScalarFieldEnum[];
};
/**
 * ReliefRequest findMany
 */
export type ReliefRequestFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter, which ReliefRequests to fetch.
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReliefRequests to fetch.
     */
    orderBy?: Prisma.ReliefRequestOrderByWithRelationInput | Prisma.ReliefRequestOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ReliefRequests.
     */
    cursor?: Prisma.ReliefRequestWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReliefRequests from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReliefRequests.
     */
    skip?: number;
    distinct?: Prisma.ReliefRequestScalarFieldEnum | Prisma.ReliefRequestScalarFieldEnum[];
};
/**
 * ReliefRequest create
 */
export type ReliefRequestCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * The data needed to create a ReliefRequest.
     */
    data: Prisma.XOR<Prisma.ReliefRequestCreateInput, Prisma.ReliefRequestUncheckedCreateInput>;
};
/**
 * ReliefRequest createMany
 */
export type ReliefRequestCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReliefRequests.
     */
    data: Prisma.ReliefRequestCreateManyInput | Prisma.ReliefRequestCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ReliefRequest createManyAndReturn
 */
export type ReliefRequestCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * The data used to create many ReliefRequests.
     */
    data: Prisma.ReliefRequestCreateManyInput | Prisma.ReliefRequestCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ReliefRequest update
 */
export type ReliefRequestUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * The data needed to update a ReliefRequest.
     */
    data: Prisma.XOR<Prisma.ReliefRequestUpdateInput, Prisma.ReliefRequestUncheckedUpdateInput>;
    /**
     * Choose, which ReliefRequest to update.
     */
    where: Prisma.ReliefRequestWhereUniqueInput;
};
/**
 * ReliefRequest updateMany
 */
export type ReliefRequestUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ReliefRequests.
     */
    data: Prisma.XOR<Prisma.ReliefRequestUpdateManyMutationInput, Prisma.ReliefRequestUncheckedUpdateManyInput>;
    /**
     * Filter which ReliefRequests to update
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * Limit how many ReliefRequests to update.
     */
    limit?: number;
};
/**
 * ReliefRequest updateManyAndReturn
 */
export type ReliefRequestUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * The data used to update ReliefRequests.
     */
    data: Prisma.XOR<Prisma.ReliefRequestUpdateManyMutationInput, Prisma.ReliefRequestUncheckedUpdateManyInput>;
    /**
     * Filter which ReliefRequests to update
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * Limit how many ReliefRequests to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ReliefRequest upsert
 */
export type ReliefRequestUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * The filter to search for the ReliefRequest to update in case it exists.
     */
    where: Prisma.ReliefRequestWhereUniqueInput;
    /**
     * In case the ReliefRequest found by the `where` argument doesn't exist, create a new ReliefRequest with this data.
     */
    create: Prisma.XOR<Prisma.ReliefRequestCreateInput, Prisma.ReliefRequestUncheckedCreateInput>;
    /**
     * In case the ReliefRequest was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ReliefRequestUpdateInput, Prisma.ReliefRequestUncheckedUpdateInput>;
};
/**
 * ReliefRequest delete
 */
export type ReliefRequestDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
    /**
     * Filter which ReliefRequest to delete.
     */
    where: Prisma.ReliefRequestWhereUniqueInput;
};
/**
 * ReliefRequest deleteMany
 */
export type ReliefRequestDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ReliefRequests to delete
     */
    where?: Prisma.ReliefRequestWhereInput;
    /**
     * Limit how many ReliefRequests to delete.
     */
    limit?: number;
};
/**
 * ReliefRequest without action
 */
export type ReliefRequestDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReliefRequest
     */
    select?: Prisma.ReliefRequestSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ReliefRequest
     */
    omit?: Prisma.ReliefRequestOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ReliefRequestInclude<ExtArgs> | null;
};
export {};
