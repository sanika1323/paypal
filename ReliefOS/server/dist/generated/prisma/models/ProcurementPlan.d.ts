import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ProcurementPlan
 *
 */
export type ProcurementPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$ProcurementPlanPayload>;
export type AggregateProcurementPlan = {
    _count: ProcurementPlanCountAggregateOutputType | null;
    _avg: ProcurementPlanAvgAggregateOutputType | null;
    _sum: ProcurementPlanSumAggregateOutputType | null;
    _min: ProcurementPlanMinAggregateOutputType | null;
    _max: ProcurementPlanMaxAggregateOutputType | null;
};
export type ProcurementPlanAvgAggregateOutputType = {
    totalBudget: runtime.Decimal | null;
};
export type ProcurementPlanSumAggregateOutputType = {
    totalBudget: runtime.Decimal | null;
};
export type ProcurementPlanMinAggregateOutputType = {
    id: string | null;
    emergencyId: string | null;
    name: string | null;
    totalBudget: runtime.Decimal | null;
    status: $Enums.ProcurementStatus | null;
    explanation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProcurementPlanMaxAggregateOutputType = {
    id: string | null;
    emergencyId: string | null;
    name: string | null;
    totalBudget: runtime.Decimal | null;
    status: $Enums.ProcurementStatus | null;
    explanation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProcurementPlanCountAggregateOutputType = {
    id: number;
    emergencyId: number;
    name: number;
    totalBudget: number;
    status: number;
    explanation: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ProcurementPlanAvgAggregateInputType = {
    totalBudget?: true;
};
export type ProcurementPlanSumAggregateInputType = {
    totalBudget?: true;
};
export type ProcurementPlanMinAggregateInputType = {
    id?: true;
    emergencyId?: true;
    name?: true;
    totalBudget?: true;
    status?: true;
    explanation?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProcurementPlanMaxAggregateInputType = {
    id?: true;
    emergencyId?: true;
    name?: true;
    totalBudget?: true;
    status?: true;
    explanation?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProcurementPlanCountAggregateInputType = {
    id?: true;
    emergencyId?: true;
    name?: true;
    totalBudget?: true;
    status?: true;
    explanation?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ProcurementPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ProcurementPlan to aggregate.
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProcurementPlans to fetch.
     */
    orderBy?: Prisma.ProcurementPlanOrderByWithRelationInput | Prisma.ProcurementPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ProcurementPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProcurementPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProcurementPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ProcurementPlans
    **/
    _count?: true | ProcurementPlanCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ProcurementPlanAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ProcurementPlanSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ProcurementPlanMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ProcurementPlanMaxAggregateInputType;
};
export type GetProcurementPlanAggregateType<T extends ProcurementPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateProcurementPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProcurementPlan[P]> : Prisma.GetScalarType<T[P], AggregateProcurementPlan[P]>;
};
export type ProcurementPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcurementPlanWhereInput;
    orderBy?: Prisma.ProcurementPlanOrderByWithAggregationInput | Prisma.ProcurementPlanOrderByWithAggregationInput[];
    by: Prisma.ProcurementPlanScalarFieldEnum[] | Prisma.ProcurementPlanScalarFieldEnum;
    having?: Prisma.ProcurementPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProcurementPlanCountAggregateInputType | true;
    _avg?: ProcurementPlanAvgAggregateInputType;
    _sum?: ProcurementPlanSumAggregateInputType;
    _min?: ProcurementPlanMinAggregateInputType;
    _max?: ProcurementPlanMaxAggregateInputType;
};
export type ProcurementPlanGroupByOutputType = {
    id: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal;
    status: $Enums.ProcurementStatus;
    explanation: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ProcurementPlanCountAggregateOutputType | null;
    _avg: ProcurementPlanAvgAggregateOutputType | null;
    _sum: ProcurementPlanSumAggregateOutputType | null;
    _min: ProcurementPlanMinAggregateOutputType | null;
    _max: ProcurementPlanMaxAggregateOutputType | null;
};
type GetProcurementPlanGroupByPayload<T extends ProcurementPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProcurementPlanGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProcurementPlanGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProcurementPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProcurementPlanGroupByOutputType[P]>;
}>>;
export type ProcurementPlanWhereInput = {
    AND?: Prisma.ProcurementPlanWhereInput | Prisma.ProcurementPlanWhereInput[];
    OR?: Prisma.ProcurementPlanWhereInput[];
    NOT?: Prisma.ProcurementPlanWhereInput | Prisma.ProcurementPlanWhereInput[];
    id?: Prisma.StringFilter<"ProcurementPlan"> | string;
    emergencyId?: Prisma.StringFilter<"ProcurementPlan"> | string;
    name?: Prisma.StringFilter<"ProcurementPlan"> | string;
    totalBudget?: Prisma.DecimalFilter<"ProcurementPlan"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFilter<"ProcurementPlan"> | $Enums.ProcurementStatus;
    explanation?: Prisma.StringNullableFilter<"ProcurementPlan"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
    emergency?: Prisma.XOR<Prisma.EmergencyScalarRelationFilter, Prisma.EmergencyWhereInput>;
    allocations?: Prisma.AllocationListRelationFilter;
    approvals?: Prisma.ApprovalListRelationFilter;
    payments?: Prisma.PaymentListRelationFilter;
};
export type ProcurementPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    totalBudget?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    explanation?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    emergency?: Prisma.EmergencyOrderByWithRelationInput;
    allocations?: Prisma.AllocationOrderByRelationAggregateInput;
    approvals?: Prisma.ApprovalOrderByRelationAggregateInput;
    payments?: Prisma.PaymentOrderByRelationAggregateInput;
};
export type ProcurementPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProcurementPlanWhereInput | Prisma.ProcurementPlanWhereInput[];
    OR?: Prisma.ProcurementPlanWhereInput[];
    NOT?: Prisma.ProcurementPlanWhereInput | Prisma.ProcurementPlanWhereInput[];
    emergencyId?: Prisma.StringFilter<"ProcurementPlan"> | string;
    name?: Prisma.StringFilter<"ProcurementPlan"> | string;
    totalBudget?: Prisma.DecimalFilter<"ProcurementPlan"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFilter<"ProcurementPlan"> | $Enums.ProcurementStatus;
    explanation?: Prisma.StringNullableFilter<"ProcurementPlan"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
    emergency?: Prisma.XOR<Prisma.EmergencyScalarRelationFilter, Prisma.EmergencyWhereInput>;
    allocations?: Prisma.AllocationListRelationFilter;
    approvals?: Prisma.ApprovalListRelationFilter;
    payments?: Prisma.PaymentListRelationFilter;
}, "id">;
export type ProcurementPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    totalBudget?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    explanation?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ProcurementPlanCountOrderByAggregateInput;
    _avg?: Prisma.ProcurementPlanAvgOrderByAggregateInput;
    _max?: Prisma.ProcurementPlanMaxOrderByAggregateInput;
    _min?: Prisma.ProcurementPlanMinOrderByAggregateInput;
    _sum?: Prisma.ProcurementPlanSumOrderByAggregateInput;
};
export type ProcurementPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProcurementPlanScalarWhereWithAggregatesInput | Prisma.ProcurementPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProcurementPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProcurementPlanScalarWhereWithAggregatesInput | Prisma.ProcurementPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ProcurementPlan"> | string;
    emergencyId?: Prisma.StringWithAggregatesFilter<"ProcurementPlan"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ProcurementPlan"> | string;
    totalBudget?: Prisma.DecimalWithAggregatesFilter<"ProcurementPlan"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusWithAggregatesFilter<"ProcurementPlan"> | $Enums.ProcurementStatus;
    explanation?: Prisma.StringNullableWithAggregatesFilter<"ProcurementPlan"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ProcurementPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ProcurementPlan"> | Date | string;
};
export type ProcurementPlanCreateInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    emergency: Prisma.EmergencyCreateNestedOneWithoutPlansInput;
    allocations?: Prisma.AllocationCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUncheckedCreateInput = {
    id?: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    allocations?: Prisma.AllocationUncheckedCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalUncheckedCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutPlansNestedInput;
    allocations?: Prisma.AllocationUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allocations?: Prisma.AllocationUncheckedUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUncheckedUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanCreateManyInput = {
    id?: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProcurementPlanUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcurementPlanUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcurementPlanListRelationFilter = {
    every?: Prisma.ProcurementPlanWhereInput;
    some?: Prisma.ProcurementPlanWhereInput;
    none?: Prisma.ProcurementPlanWhereInput;
};
export type ProcurementPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ProcurementPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    totalBudget?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcurementPlanAvgOrderByAggregateInput = {
    totalBudget?: Prisma.SortOrder;
};
export type ProcurementPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    totalBudget?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcurementPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    emergencyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    totalBudget?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcurementPlanSumOrderByAggregateInput = {
    totalBudget?: Prisma.SortOrder;
};
export type ProcurementPlanScalarRelationFilter = {
    is?: Prisma.ProcurementPlanWhereInput;
    isNot?: Prisma.ProcurementPlanWhereInput;
};
export type ProcurementPlanCreateNestedManyWithoutEmergencyInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput> | Prisma.ProcurementPlanCreateWithoutEmergencyInput[] | Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput | Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput[];
    createMany?: Prisma.ProcurementPlanCreateManyEmergencyInputEnvelope;
    connect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
};
export type ProcurementPlanUncheckedCreateNestedManyWithoutEmergencyInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput> | Prisma.ProcurementPlanCreateWithoutEmergencyInput[] | Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput | Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput[];
    createMany?: Prisma.ProcurementPlanCreateManyEmergencyInputEnvelope;
    connect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
};
export type ProcurementPlanUpdateManyWithoutEmergencyNestedInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput> | Prisma.ProcurementPlanCreateWithoutEmergencyInput[] | Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput | Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput[];
    upsert?: Prisma.ProcurementPlanUpsertWithWhereUniqueWithoutEmergencyInput | Prisma.ProcurementPlanUpsertWithWhereUniqueWithoutEmergencyInput[];
    createMany?: Prisma.ProcurementPlanCreateManyEmergencyInputEnvelope;
    set?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    disconnect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    delete?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    connect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    update?: Prisma.ProcurementPlanUpdateWithWhereUniqueWithoutEmergencyInput | Prisma.ProcurementPlanUpdateWithWhereUniqueWithoutEmergencyInput[];
    updateMany?: Prisma.ProcurementPlanUpdateManyWithWhereWithoutEmergencyInput | Prisma.ProcurementPlanUpdateManyWithWhereWithoutEmergencyInput[];
    deleteMany?: Prisma.ProcurementPlanScalarWhereInput | Prisma.ProcurementPlanScalarWhereInput[];
};
export type ProcurementPlanUncheckedUpdateManyWithoutEmergencyNestedInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput> | Prisma.ProcurementPlanCreateWithoutEmergencyInput[] | Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput[];
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput | Prisma.ProcurementPlanCreateOrConnectWithoutEmergencyInput[];
    upsert?: Prisma.ProcurementPlanUpsertWithWhereUniqueWithoutEmergencyInput | Prisma.ProcurementPlanUpsertWithWhereUniqueWithoutEmergencyInput[];
    createMany?: Prisma.ProcurementPlanCreateManyEmergencyInputEnvelope;
    set?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    disconnect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    delete?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    connect?: Prisma.ProcurementPlanWhereUniqueInput | Prisma.ProcurementPlanWhereUniqueInput[];
    update?: Prisma.ProcurementPlanUpdateWithWhereUniqueWithoutEmergencyInput | Prisma.ProcurementPlanUpdateWithWhereUniqueWithoutEmergencyInput[];
    updateMany?: Prisma.ProcurementPlanUpdateManyWithWhereWithoutEmergencyInput | Prisma.ProcurementPlanUpdateManyWithWhereWithoutEmergencyInput[];
    deleteMany?: Prisma.ProcurementPlanScalarWhereInput | Prisma.ProcurementPlanScalarWhereInput[];
};
export type EnumProcurementStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProcurementStatus;
};
export type ProcurementPlanCreateNestedOneWithoutAllocationsInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedCreateWithoutAllocationsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutAllocationsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
};
export type ProcurementPlanUpdateOneRequiredWithoutAllocationsNestedInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedCreateWithoutAllocationsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutAllocationsInput;
    upsert?: Prisma.ProcurementPlanUpsertWithoutAllocationsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProcurementPlanUpdateToOneWithWhereWithoutAllocationsInput, Prisma.ProcurementPlanUpdateWithoutAllocationsInput>, Prisma.ProcurementPlanUncheckedUpdateWithoutAllocationsInput>;
};
export type ProcurementPlanCreateNestedOneWithoutApprovalsInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedCreateWithoutApprovalsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutApprovalsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
};
export type ProcurementPlanUpdateOneRequiredWithoutApprovalsNestedInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedCreateWithoutApprovalsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutApprovalsInput;
    upsert?: Prisma.ProcurementPlanUpsertWithoutApprovalsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProcurementPlanUpdateToOneWithWhereWithoutApprovalsInput, Prisma.ProcurementPlanUpdateWithoutApprovalsInput>, Prisma.ProcurementPlanUncheckedUpdateWithoutApprovalsInput>;
};
export type ProcurementPlanCreateNestedOneWithoutPaymentsInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutPaymentsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
};
export type ProcurementPlanUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.ProcurementPlanCreateOrConnectWithoutPaymentsInput;
    upsert?: Prisma.ProcurementPlanUpsertWithoutPaymentsInput;
    connect?: Prisma.ProcurementPlanWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProcurementPlanUpdateToOneWithWhereWithoutPaymentsInput, Prisma.ProcurementPlanUpdateWithoutPaymentsInput>, Prisma.ProcurementPlanUncheckedUpdateWithoutPaymentsInput>;
};
export type ProcurementPlanCreateWithoutEmergencyInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    allocations?: Prisma.AllocationCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUncheckedCreateWithoutEmergencyInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    allocations?: Prisma.AllocationUncheckedCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalUncheckedCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanCreateOrConnectWithoutEmergencyInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput>;
};
export type ProcurementPlanCreateManyEmergencyInputEnvelope = {
    data: Prisma.ProcurementPlanCreateManyEmergencyInput | Prisma.ProcurementPlanCreateManyEmergencyInput[];
    skipDuplicates?: boolean;
};
export type ProcurementPlanUpsertWithWhereUniqueWithoutEmergencyInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedUpdateWithoutEmergencyInput>;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedCreateWithoutEmergencyInput>;
};
export type ProcurementPlanUpdateWithWhereUniqueWithoutEmergencyInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutEmergencyInput, Prisma.ProcurementPlanUncheckedUpdateWithoutEmergencyInput>;
};
export type ProcurementPlanUpdateManyWithWhereWithoutEmergencyInput = {
    where: Prisma.ProcurementPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateManyMutationInput, Prisma.ProcurementPlanUncheckedUpdateManyWithoutEmergencyInput>;
};
export type ProcurementPlanScalarWhereInput = {
    AND?: Prisma.ProcurementPlanScalarWhereInput | Prisma.ProcurementPlanScalarWhereInput[];
    OR?: Prisma.ProcurementPlanScalarWhereInput[];
    NOT?: Prisma.ProcurementPlanScalarWhereInput | Prisma.ProcurementPlanScalarWhereInput[];
    id?: Prisma.StringFilter<"ProcurementPlan"> | string;
    emergencyId?: Prisma.StringFilter<"ProcurementPlan"> | string;
    name?: Prisma.StringFilter<"ProcurementPlan"> | string;
    totalBudget?: Prisma.DecimalFilter<"ProcurementPlan"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFilter<"ProcurementPlan"> | $Enums.ProcurementStatus;
    explanation?: Prisma.StringNullableFilter<"ProcurementPlan"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ProcurementPlan"> | Date | string;
};
export type ProcurementPlanCreateWithoutAllocationsInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    emergency: Prisma.EmergencyCreateNestedOneWithoutPlansInput;
    approvals?: Prisma.ApprovalCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUncheckedCreateWithoutAllocationsInput = {
    id?: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    approvals?: Prisma.ApprovalUncheckedCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanCreateOrConnectWithoutAllocationsInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedCreateWithoutAllocationsInput>;
};
export type ProcurementPlanUpsertWithoutAllocationsInput = {
    update: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutAllocationsInput>;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedCreateWithoutAllocationsInput>;
    where?: Prisma.ProcurementPlanWhereInput;
};
export type ProcurementPlanUpdateToOneWithWhereWithoutAllocationsInput = {
    where?: Prisma.ProcurementPlanWhereInput;
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutAllocationsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutAllocationsInput>;
};
export type ProcurementPlanUpdateWithoutAllocationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutPlansNestedInput;
    approvals?: Prisma.ApprovalUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateWithoutAllocationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    approvals?: Prisma.ApprovalUncheckedUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanCreateWithoutApprovalsInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    emergency: Prisma.EmergencyCreateNestedOneWithoutPlansInput;
    allocations?: Prisma.AllocationCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUncheckedCreateWithoutApprovalsInput = {
    id?: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    allocations?: Prisma.AllocationUncheckedCreateNestedManyWithoutPlanInput;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanCreateOrConnectWithoutApprovalsInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedCreateWithoutApprovalsInput>;
};
export type ProcurementPlanUpsertWithoutApprovalsInput = {
    update: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutApprovalsInput>;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedCreateWithoutApprovalsInput>;
    where?: Prisma.ProcurementPlanWhereInput;
};
export type ProcurementPlanUpdateToOneWithWhereWithoutApprovalsInput = {
    where?: Prisma.ProcurementPlanWhereInput;
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutApprovalsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutApprovalsInput>;
};
export type ProcurementPlanUpdateWithoutApprovalsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutPlansNestedInput;
    allocations?: Prisma.AllocationUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateWithoutApprovalsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allocations?: Prisma.AllocationUncheckedUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanCreateWithoutPaymentsInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    emergency: Prisma.EmergencyCreateNestedOneWithoutPlansInput;
    allocations?: Prisma.AllocationCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanUncheckedCreateWithoutPaymentsInput = {
    id?: string;
    emergencyId: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    allocations?: Prisma.AllocationUncheckedCreateNestedManyWithoutPlanInput;
    approvals?: Prisma.ApprovalUncheckedCreateNestedManyWithoutPlanInput;
};
export type ProcurementPlanCreateOrConnectWithoutPaymentsInput = {
    where: Prisma.ProcurementPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedCreateWithoutPaymentsInput>;
};
export type ProcurementPlanUpsertWithoutPaymentsInput = {
    update: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutPaymentsInput>;
    create: Prisma.XOR<Prisma.ProcurementPlanCreateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedCreateWithoutPaymentsInput>;
    where?: Prisma.ProcurementPlanWhereInput;
};
export type ProcurementPlanUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: Prisma.ProcurementPlanWhereInput;
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateWithoutPaymentsInput, Prisma.ProcurementPlanUncheckedUpdateWithoutPaymentsInput>;
};
export type ProcurementPlanUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    emergency?: Prisma.EmergencyUpdateOneRequiredWithoutPlansNestedInput;
    allocations?: Prisma.AllocationUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    emergencyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allocations?: Prisma.AllocationUncheckedUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUncheckedUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanCreateManyEmergencyInput = {
    id?: string;
    name: string;
    totalBudget: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ProcurementStatus;
    explanation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProcurementPlanUpdateWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allocations?: Prisma.AllocationUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allocations?: Prisma.AllocationUncheckedUpdateManyWithoutPlanNestedInput;
    approvals?: Prisma.ApprovalUncheckedUpdateManyWithoutPlanNestedInput;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPlanNestedInput;
};
export type ProcurementPlanUncheckedUpdateManyWithoutEmergencyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    totalBudget?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumProcurementStatusFieldUpdateOperationsInput | $Enums.ProcurementStatus;
    explanation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ProcurementPlanCountOutputType
 */
export type ProcurementPlanCountOutputType = {
    allocations: number;
    approvals: number;
    payments: number;
};
export type ProcurementPlanCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    allocations?: boolean | ProcurementPlanCountOutputTypeCountAllocationsArgs;
    approvals?: boolean | ProcurementPlanCountOutputTypeCountApprovalsArgs;
    payments?: boolean | ProcurementPlanCountOutputTypeCountPaymentsArgs;
};
/**
 * ProcurementPlanCountOutputType without action
 */
export type ProcurementPlanCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlanCountOutputType
     */
    select?: Prisma.ProcurementPlanCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ProcurementPlanCountOutputType without action
 */
export type ProcurementPlanCountOutputTypeCountAllocationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AllocationWhereInput;
};
/**
 * ProcurementPlanCountOutputType without action
 */
export type ProcurementPlanCountOutputTypeCountApprovalsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ApprovalWhereInput;
};
/**
 * ProcurementPlanCountOutputType without action
 */
export type ProcurementPlanCountOutputTypeCountPaymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PaymentWhereInput;
};
export type ProcurementPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    emergencyId?: boolean;
    name?: boolean;
    totalBudget?: boolean;
    status?: boolean;
    explanation?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    allocations?: boolean | Prisma.ProcurementPlan$allocationsArgs<ExtArgs>;
    approvals?: boolean | Prisma.ProcurementPlan$approvalsArgs<ExtArgs>;
    payments?: boolean | Prisma.ProcurementPlan$paymentsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProcurementPlanCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["procurementPlan"]>;
export type ProcurementPlanSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    emergencyId?: boolean;
    name?: boolean;
    totalBudget?: boolean;
    status?: boolean;
    explanation?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["procurementPlan"]>;
export type ProcurementPlanSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    emergencyId?: boolean;
    name?: boolean;
    totalBudget?: boolean;
    status?: boolean;
    explanation?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["procurementPlan"]>;
export type ProcurementPlanSelectScalar = {
    id?: boolean;
    emergencyId?: boolean;
    name?: boolean;
    totalBudget?: boolean;
    status?: boolean;
    explanation?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ProcurementPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "emergencyId" | "name" | "totalBudget" | "status" | "explanation" | "createdAt" | "updatedAt", ExtArgs["result"]["procurementPlan"]>;
export type ProcurementPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
    allocations?: boolean | Prisma.ProcurementPlan$allocationsArgs<ExtArgs>;
    approvals?: boolean | Prisma.ProcurementPlan$approvalsArgs<ExtArgs>;
    payments?: boolean | Prisma.ProcurementPlan$paymentsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProcurementPlanCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ProcurementPlanIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
};
export type ProcurementPlanIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    emergency?: boolean | Prisma.EmergencyDefaultArgs<ExtArgs>;
};
export type $ProcurementPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ProcurementPlan";
    objects: {
        emergency: Prisma.$EmergencyPayload<ExtArgs>;
        allocations: Prisma.$AllocationPayload<ExtArgs>[];
        approvals: Prisma.$ApprovalPayload<ExtArgs>[];
        payments: Prisma.$PaymentPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        emergencyId: string;
        name: string;
        totalBudget: runtime.Decimal;
        status: $Enums.ProcurementStatus;
        explanation: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["procurementPlan"]>;
    composites: {};
};
export type ProcurementPlanGetPayload<S extends boolean | null | undefined | ProcurementPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload, S>;
export type ProcurementPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProcurementPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProcurementPlanCountAggregateInputType | true;
};
export interface ProcurementPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ProcurementPlan'];
        meta: {
            name: 'ProcurementPlan';
        };
    };
    /**
     * Find zero or one ProcurementPlan that matches the filter.
     * @param {ProcurementPlanFindUniqueArgs} args - Arguments to find a ProcurementPlan
     * @example
     * // Get one ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcurementPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, ProcurementPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ProcurementPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProcurementPlanFindUniqueOrThrowArgs} args - Arguments to find a ProcurementPlan
     * @example
     * // Get one ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcurementPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProcurementPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ProcurementPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanFindFirstArgs} args - Arguments to find a ProcurementPlan
     * @example
     * // Get one ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcurementPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ProcurementPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanFindFirstOrThrowArgs} args - Arguments to find a ProcurementPlan
     * @example
     * // Get one ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcurementPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ProcurementPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcurementPlans
     * const procurementPlans = await prisma.procurementPlan.findMany()
     *
     * // Get first 10 ProcurementPlans
     * const procurementPlans = await prisma.procurementPlan.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const procurementPlanWithIdOnly = await prisma.procurementPlan.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProcurementPlanFindManyArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ProcurementPlan.
     * @param {ProcurementPlanCreateArgs} args - Arguments to create a ProcurementPlan.
     * @example
     * // Create one ProcurementPlan
     * const ProcurementPlan = await prisma.procurementPlan.create({
     *   data: {
     *     // ... data to create a ProcurementPlan
     *   }
     * })
     *
     */
    create<T extends ProcurementPlanCreateArgs>(args: Prisma.SelectSubset<T, ProcurementPlanCreateArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ProcurementPlans.
     * @param {ProcurementPlanCreateManyArgs} args - Arguments to create many ProcurementPlans.
     * @example
     * // Create many ProcurementPlans
     * const procurementPlan = await prisma.procurementPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProcurementPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ProcurementPlans and returns the data saved in the database.
     * @param {ProcurementPlanCreateManyAndReturnArgs} args - Arguments to create many ProcurementPlans.
     * @example
     * // Create many ProcurementPlans
     * const procurementPlan = await prisma.procurementPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ProcurementPlans and only return the `id`
     * const procurementPlanWithIdOnly = await prisma.procurementPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProcurementPlanCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ProcurementPlan.
     * @param {ProcurementPlanDeleteArgs} args - Arguments to delete one ProcurementPlan.
     * @example
     * // Delete one ProcurementPlan
     * const ProcurementPlan = await prisma.procurementPlan.delete({
     *   where: {
     *     // ... filter to delete one ProcurementPlan
     *   }
     * })
     *
     */
    delete<T extends ProcurementPlanDeleteArgs>(args: Prisma.SelectSubset<T, ProcurementPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ProcurementPlan.
     * @param {ProcurementPlanUpdateArgs} args - Arguments to update one ProcurementPlan.
     * @example
     * // Update one ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProcurementPlanUpdateArgs>(args: Prisma.SelectSubset<T, ProcurementPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ProcurementPlans.
     * @param {ProcurementPlanDeleteManyArgs} args - Arguments to filter ProcurementPlans to delete.
     * @example
     * // Delete a few ProcurementPlans
     * const { count } = await prisma.procurementPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProcurementPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProcurementPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ProcurementPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcurementPlans
     * const procurementPlan = await prisma.procurementPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProcurementPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, ProcurementPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ProcurementPlans and returns the data updated in the database.
     * @param {ProcurementPlanUpdateManyAndReturnArgs} args - Arguments to update many ProcurementPlans.
     * @example
     * // Update many ProcurementPlans
     * const procurementPlan = await prisma.procurementPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ProcurementPlans and only return the `id`
     * const procurementPlanWithIdOnly = await prisma.procurementPlan.updateManyAndReturn({
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
    updateManyAndReturn<T extends ProcurementPlanUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProcurementPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ProcurementPlan.
     * @param {ProcurementPlanUpsertArgs} args - Arguments to update or create a ProcurementPlan.
     * @example
     * // Update or create a ProcurementPlan
     * const procurementPlan = await prisma.procurementPlan.upsert({
     *   create: {
     *     // ... data to create a ProcurementPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcurementPlan we want to update
     *   }
     * })
     */
    upsert<T extends ProcurementPlanUpsertArgs>(args: Prisma.SelectSubset<T, ProcurementPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__ProcurementPlanClient<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ProcurementPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanCountArgs} args - Arguments to filter ProcurementPlans to count.
     * @example
     * // Count the number of ProcurementPlans
     * const count = await prisma.procurementPlan.count({
     *   where: {
     *     // ... the filter for the ProcurementPlans we want to count
     *   }
     * })
    **/
    count<T extends ProcurementPlanCountArgs>(args?: Prisma.Subset<T, ProcurementPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProcurementPlanCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ProcurementPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcurementPlanAggregateArgs>(args: Prisma.Subset<T, ProcurementPlanAggregateArgs>): Prisma.PrismaPromise<GetProcurementPlanAggregateType<T>>;
    /**
     * Group by ProcurementPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcurementPlanGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ProcurementPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProcurementPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: ProcurementPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProcurementPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcurementPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ProcurementPlan model
     */
    readonly fields: ProcurementPlanFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ProcurementPlan.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ProcurementPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    emergency<T extends Prisma.EmergencyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EmergencyDefaultArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    allocations<T extends Prisma.ProcurementPlan$allocationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProcurementPlan$allocationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AllocationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    approvals<T extends Prisma.ProcurementPlan$approvalsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProcurementPlan$approvalsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApprovalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    payments<T extends Prisma.ProcurementPlan$paymentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProcurementPlan$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the ProcurementPlan model
 */
export interface ProcurementPlanFieldRefs {
    readonly id: Prisma.FieldRef<"ProcurementPlan", 'String'>;
    readonly emergencyId: Prisma.FieldRef<"ProcurementPlan", 'String'>;
    readonly name: Prisma.FieldRef<"ProcurementPlan", 'String'>;
    readonly totalBudget: Prisma.FieldRef<"ProcurementPlan", 'Decimal'>;
    readonly status: Prisma.FieldRef<"ProcurementPlan", 'ProcurementStatus'>;
    readonly explanation: Prisma.FieldRef<"ProcurementPlan", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ProcurementPlan", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ProcurementPlan", 'DateTime'>;
}
/**
 * ProcurementPlan findUnique
 */
export type ProcurementPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter, which ProcurementPlan to fetch.
     */
    where: Prisma.ProcurementPlanWhereUniqueInput;
};
/**
 * ProcurementPlan findUniqueOrThrow
 */
export type ProcurementPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter, which ProcurementPlan to fetch.
     */
    where: Prisma.ProcurementPlanWhereUniqueInput;
};
/**
 * ProcurementPlan findFirst
 */
export type ProcurementPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter, which ProcurementPlan to fetch.
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProcurementPlans to fetch.
     */
    orderBy?: Prisma.ProcurementPlanOrderByWithRelationInput | Prisma.ProcurementPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProcurementPlans.
     */
    cursor?: Prisma.ProcurementPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProcurementPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProcurementPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProcurementPlans.
     */
    distinct?: Prisma.ProcurementPlanScalarFieldEnum | Prisma.ProcurementPlanScalarFieldEnum[];
};
/**
 * ProcurementPlan findFirstOrThrow
 */
export type ProcurementPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter, which ProcurementPlan to fetch.
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProcurementPlans to fetch.
     */
    orderBy?: Prisma.ProcurementPlanOrderByWithRelationInput | Prisma.ProcurementPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProcurementPlans.
     */
    cursor?: Prisma.ProcurementPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProcurementPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProcurementPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProcurementPlans.
     */
    distinct?: Prisma.ProcurementPlanScalarFieldEnum | Prisma.ProcurementPlanScalarFieldEnum[];
};
/**
 * ProcurementPlan findMany
 */
export type ProcurementPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter, which ProcurementPlans to fetch.
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProcurementPlans to fetch.
     */
    orderBy?: Prisma.ProcurementPlanOrderByWithRelationInput | Prisma.ProcurementPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ProcurementPlans.
     */
    cursor?: Prisma.ProcurementPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProcurementPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProcurementPlans.
     */
    skip?: number;
    distinct?: Prisma.ProcurementPlanScalarFieldEnum | Prisma.ProcurementPlanScalarFieldEnum[];
};
/**
 * ProcurementPlan create
 */
export type ProcurementPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * The data needed to create a ProcurementPlan.
     */
    data: Prisma.XOR<Prisma.ProcurementPlanCreateInput, Prisma.ProcurementPlanUncheckedCreateInput>;
};
/**
 * ProcurementPlan createMany
 */
export type ProcurementPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcurementPlans.
     */
    data: Prisma.ProcurementPlanCreateManyInput | Prisma.ProcurementPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ProcurementPlan createManyAndReturn
 */
export type ProcurementPlanCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * The data used to create many ProcurementPlans.
     */
    data: Prisma.ProcurementPlanCreateManyInput | Prisma.ProcurementPlanCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ProcurementPlan update
 */
export type ProcurementPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * The data needed to update a ProcurementPlan.
     */
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateInput, Prisma.ProcurementPlanUncheckedUpdateInput>;
    /**
     * Choose, which ProcurementPlan to update.
     */
    where: Prisma.ProcurementPlanWhereUniqueInput;
};
/**
 * ProcurementPlan updateMany
 */
export type ProcurementPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcurementPlans.
     */
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateManyMutationInput, Prisma.ProcurementPlanUncheckedUpdateManyInput>;
    /**
     * Filter which ProcurementPlans to update
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * Limit how many ProcurementPlans to update.
     */
    limit?: number;
};
/**
 * ProcurementPlan updateManyAndReturn
 */
export type ProcurementPlanUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * The data used to update ProcurementPlans.
     */
    data: Prisma.XOR<Prisma.ProcurementPlanUpdateManyMutationInput, Prisma.ProcurementPlanUncheckedUpdateManyInput>;
    /**
     * Filter which ProcurementPlans to update
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * Limit how many ProcurementPlans to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ProcurementPlan upsert
 */
export type ProcurementPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * The filter to search for the ProcurementPlan to update in case it exists.
     */
    where: Prisma.ProcurementPlanWhereUniqueInput;
    /**
     * In case the ProcurementPlan found by the `where` argument doesn't exist, create a new ProcurementPlan with this data.
     */
    create: Prisma.XOR<Prisma.ProcurementPlanCreateInput, Prisma.ProcurementPlanUncheckedCreateInput>;
    /**
     * In case the ProcurementPlan was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ProcurementPlanUpdateInput, Prisma.ProcurementPlanUncheckedUpdateInput>;
};
/**
 * ProcurementPlan delete
 */
export type ProcurementPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
    /**
     * Filter which ProcurementPlan to delete.
     */
    where: Prisma.ProcurementPlanWhereUniqueInput;
};
/**
 * ProcurementPlan deleteMany
 */
export type ProcurementPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ProcurementPlans to delete
     */
    where?: Prisma.ProcurementPlanWhereInput;
    /**
     * Limit how many ProcurementPlans to delete.
     */
    limit?: number;
};
/**
 * ProcurementPlan.allocations
 */
export type ProcurementPlan$allocationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allocation
     */
    select?: Prisma.AllocationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Allocation
     */
    omit?: Prisma.AllocationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AllocationInclude<ExtArgs> | null;
    where?: Prisma.AllocationWhereInput;
    orderBy?: Prisma.AllocationOrderByWithRelationInput | Prisma.AllocationOrderByWithRelationInput[];
    cursor?: Prisma.AllocationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AllocationScalarFieldEnum | Prisma.AllocationScalarFieldEnum[];
};
/**
 * ProcurementPlan.approvals
 */
export type ProcurementPlan$approvalsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Approval
     */
    select?: Prisma.ApprovalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Approval
     */
    omit?: Prisma.ApprovalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ApprovalInclude<ExtArgs> | null;
    where?: Prisma.ApprovalWhereInput;
    orderBy?: Prisma.ApprovalOrderByWithRelationInput | Prisma.ApprovalOrderByWithRelationInput[];
    cursor?: Prisma.ApprovalWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ApprovalScalarFieldEnum | Prisma.ApprovalScalarFieldEnum[];
};
/**
 * ProcurementPlan.payments
 */
export type ProcurementPlan$paymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: Prisma.PaymentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Payment
     */
    omit?: Prisma.PaymentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PaymentInclude<ExtArgs> | null;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput | Prisma.PaymentOrderByWithRelationInput[];
    cursor?: Prisma.PaymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PaymentScalarFieldEnum | Prisma.PaymentScalarFieldEnum[];
};
/**
 * ProcurementPlan without action
 */
export type ProcurementPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcurementPlan
     */
    select?: Prisma.ProcurementPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProcurementPlan
     */
    omit?: Prisma.ProcurementPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProcurementPlanInclude<ExtArgs> | null;
};
export {};
