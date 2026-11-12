import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Emergency
 *
 */
export type EmergencyModel = runtime.Types.Result.DefaultSelection<Prisma.$EmergencyPayload>;
export type AggregateEmergency = {
    _count: EmergencyCountAggregateOutputType | null;
    _min: EmergencyMinAggregateOutputType | null;
    _max: EmergencyMaxAggregateOutputType | null;
};
export type EmergencyMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    location: string | null;
    severity: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
};
export type EmergencyMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    location: string | null;
    severity: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
};
export type EmergencyCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    location: number;
    severity: number;
    isActive: number;
    createdAt: number;
    _all: number;
};
export type EmergencyMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    location?: true;
    severity?: true;
    isActive?: true;
    createdAt?: true;
};
export type EmergencyMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    location?: true;
    severity?: true;
    isActive?: true;
    createdAt?: true;
};
export type EmergencyCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    location?: true;
    severity?: true;
    isActive?: true;
    createdAt?: true;
    _all?: true;
};
export type EmergencyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Emergency to aggregate.
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: Prisma.EmergencyOrderByWithRelationInput | Prisma.EmergencyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.EmergencyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Emergencies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Emergencies
    **/
    _count?: true | EmergencyCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EmergencyMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EmergencyMaxAggregateInputType;
};
export type GetEmergencyAggregateType<T extends EmergencyAggregateArgs> = {
    [P in keyof T & keyof AggregateEmergency]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEmergency[P]> : Prisma.GetScalarType<T[P], AggregateEmergency[P]>;
};
export type EmergencyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmergencyWhereInput;
    orderBy?: Prisma.EmergencyOrderByWithAggregationInput | Prisma.EmergencyOrderByWithAggregationInput[];
    by: Prisma.EmergencyScalarFieldEnum[] | Prisma.EmergencyScalarFieldEnum;
    having?: Prisma.EmergencyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EmergencyCountAggregateInputType | true;
    _min?: EmergencyMinAggregateInputType;
    _max?: EmergencyMaxAggregateInputType;
};
export type EmergencyGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    location: string;
    severity: string;
    isActive: boolean;
    createdAt: Date;
    _count: EmergencyCountAggregateOutputType | null;
    _min: EmergencyMinAggregateOutputType | null;
    _max: EmergencyMaxAggregateOutputType | null;
};
type GetEmergencyGroupByPayload<T extends EmergencyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EmergencyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EmergencyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EmergencyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EmergencyGroupByOutputType[P]>;
}>>;
export type EmergencyWhereInput = {
    AND?: Prisma.EmergencyWhereInput | Prisma.EmergencyWhereInput[];
    OR?: Prisma.EmergencyWhereInput[];
    NOT?: Prisma.EmergencyWhereInput | Prisma.EmergencyWhereInput[];
    id?: Prisma.StringFilter<"Emergency"> | string;
    name?: Prisma.StringFilter<"Emergency"> | string;
    description?: Prisma.StringNullableFilter<"Emergency"> | string | null;
    location?: Prisma.StringFilter<"Emergency"> | string;
    severity?: Prisma.StringFilter<"Emergency"> | string;
    isActive?: Prisma.BoolFilter<"Emergency"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Emergency"> | Date | string;
    requests?: Prisma.ReliefRequestListRelationFilter;
    plans?: Prisma.ProcurementPlanListRelationFilter;
};
export type EmergencyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    location?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    requests?: Prisma.ReliefRequestOrderByRelationAggregateInput;
    plans?: Prisma.ProcurementPlanOrderByRelationAggregateInput;
};
export type EmergencyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.EmergencyWhereInput | Prisma.EmergencyWhereInput[];
    OR?: Prisma.EmergencyWhereInput[];
    NOT?: Prisma.EmergencyWhereInput | Prisma.EmergencyWhereInput[];
    name?: Prisma.StringFilter<"Emergency"> | string;
    description?: Prisma.StringNullableFilter<"Emergency"> | string | null;
    location?: Prisma.StringFilter<"Emergency"> | string;
    severity?: Prisma.StringFilter<"Emergency"> | string;
    isActive?: Prisma.BoolFilter<"Emergency"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Emergency"> | Date | string;
    requests?: Prisma.ReliefRequestListRelationFilter;
    plans?: Prisma.ProcurementPlanListRelationFilter;
}, "id">;
export type EmergencyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    location?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.EmergencyCountOrderByAggregateInput;
    _max?: Prisma.EmergencyMaxOrderByAggregateInput;
    _min?: Prisma.EmergencyMinOrderByAggregateInput;
};
export type EmergencyScalarWhereWithAggregatesInput = {
    AND?: Prisma.EmergencyScalarWhereWithAggregatesInput | Prisma.EmergencyScalarWhereWithAggregatesInput[];
    OR?: Prisma.EmergencyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EmergencyScalarWhereWithAggregatesInput | Prisma.EmergencyScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Emergency"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Emergency"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Emergency"> | string | null;
    location?: Prisma.StringWithAggregatesFilter<"Emergency"> | string;
    severity?: Prisma.StringWithAggregatesFilter<"Emergency"> | string;
    isActive?: Prisma.BoolWithAggregatesFilter<"Emergency"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Emergency"> | Date | string;
};
export type EmergencyCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    requests?: Prisma.ReliefRequestCreateNestedManyWithoutEmergencyInput;
    plans?: Prisma.ProcurementPlanCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    requests?: Prisma.ReliefRequestUncheckedCreateNestedManyWithoutEmergencyInput;
    plans?: Prisma.ProcurementPlanUncheckedCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    requests?: Prisma.ReliefRequestUpdateManyWithoutEmergencyNestedInput;
    plans?: Prisma.ProcurementPlanUpdateManyWithoutEmergencyNestedInput;
};
export type EmergencyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    requests?: Prisma.ReliefRequestUncheckedUpdateManyWithoutEmergencyNestedInput;
    plans?: Prisma.ProcurementPlanUncheckedUpdateManyWithoutEmergencyNestedInput;
};
export type EmergencyCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
};
export type EmergencyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmergencyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmergencyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EmergencyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EmergencyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EmergencyScalarRelationFilter = {
    is?: Prisma.EmergencyWhereInput;
    isNot?: Prisma.EmergencyWhereInput;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type EmergencyCreateNestedOneWithoutRequestsInput = {
    create?: Prisma.XOR<Prisma.EmergencyCreateWithoutRequestsInput, Prisma.EmergencyUncheckedCreateWithoutRequestsInput>;
    connectOrCreate?: Prisma.EmergencyCreateOrConnectWithoutRequestsInput;
    connect?: Prisma.EmergencyWhereUniqueInput;
};
export type EmergencyUpdateOneRequiredWithoutRequestsNestedInput = {
    create?: Prisma.XOR<Prisma.EmergencyCreateWithoutRequestsInput, Prisma.EmergencyUncheckedCreateWithoutRequestsInput>;
    connectOrCreate?: Prisma.EmergencyCreateOrConnectWithoutRequestsInput;
    upsert?: Prisma.EmergencyUpsertWithoutRequestsInput;
    connect?: Prisma.EmergencyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmergencyUpdateToOneWithWhereWithoutRequestsInput, Prisma.EmergencyUpdateWithoutRequestsInput>, Prisma.EmergencyUncheckedUpdateWithoutRequestsInput>;
};
export type EmergencyCreateNestedOneWithoutPlansInput = {
    create?: Prisma.XOR<Prisma.EmergencyCreateWithoutPlansInput, Prisma.EmergencyUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.EmergencyCreateOrConnectWithoutPlansInput;
    connect?: Prisma.EmergencyWhereUniqueInput;
};
export type EmergencyUpdateOneRequiredWithoutPlansNestedInput = {
    create?: Prisma.XOR<Prisma.EmergencyCreateWithoutPlansInput, Prisma.EmergencyUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.EmergencyCreateOrConnectWithoutPlansInput;
    upsert?: Prisma.EmergencyUpsertWithoutPlansInput;
    connect?: Prisma.EmergencyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmergencyUpdateToOneWithWhereWithoutPlansInput, Prisma.EmergencyUpdateWithoutPlansInput>, Prisma.EmergencyUncheckedUpdateWithoutPlansInput>;
};
export type EmergencyCreateWithoutRequestsInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    plans?: Prisma.ProcurementPlanCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyUncheckedCreateWithoutRequestsInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    plans?: Prisma.ProcurementPlanUncheckedCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyCreateOrConnectWithoutRequestsInput = {
    where: Prisma.EmergencyWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmergencyCreateWithoutRequestsInput, Prisma.EmergencyUncheckedCreateWithoutRequestsInput>;
};
export type EmergencyUpsertWithoutRequestsInput = {
    update: Prisma.XOR<Prisma.EmergencyUpdateWithoutRequestsInput, Prisma.EmergencyUncheckedUpdateWithoutRequestsInput>;
    create: Prisma.XOR<Prisma.EmergencyCreateWithoutRequestsInput, Prisma.EmergencyUncheckedCreateWithoutRequestsInput>;
    where?: Prisma.EmergencyWhereInput;
};
export type EmergencyUpdateToOneWithWhereWithoutRequestsInput = {
    where?: Prisma.EmergencyWhereInput;
    data: Prisma.XOR<Prisma.EmergencyUpdateWithoutRequestsInput, Prisma.EmergencyUncheckedUpdateWithoutRequestsInput>;
};
export type EmergencyUpdateWithoutRequestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    plans?: Prisma.ProcurementPlanUpdateManyWithoutEmergencyNestedInput;
};
export type EmergencyUncheckedUpdateWithoutRequestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    plans?: Prisma.ProcurementPlanUncheckedUpdateManyWithoutEmergencyNestedInput;
};
export type EmergencyCreateWithoutPlansInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    requests?: Prisma.ReliefRequestCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyUncheckedCreateWithoutPlansInput = {
    id?: string;
    name: string;
    description?: string | null;
    location: string;
    severity: string;
    isActive?: boolean;
    createdAt?: Date | string;
    requests?: Prisma.ReliefRequestUncheckedCreateNestedManyWithoutEmergencyInput;
};
export type EmergencyCreateOrConnectWithoutPlansInput = {
    where: Prisma.EmergencyWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmergencyCreateWithoutPlansInput, Prisma.EmergencyUncheckedCreateWithoutPlansInput>;
};
export type EmergencyUpsertWithoutPlansInput = {
    update: Prisma.XOR<Prisma.EmergencyUpdateWithoutPlansInput, Prisma.EmergencyUncheckedUpdateWithoutPlansInput>;
    create: Prisma.XOR<Prisma.EmergencyCreateWithoutPlansInput, Prisma.EmergencyUncheckedCreateWithoutPlansInput>;
    where?: Prisma.EmergencyWhereInput;
};
export type EmergencyUpdateToOneWithWhereWithoutPlansInput = {
    where?: Prisma.EmergencyWhereInput;
    data: Prisma.XOR<Prisma.EmergencyUpdateWithoutPlansInput, Prisma.EmergencyUncheckedUpdateWithoutPlansInput>;
};
export type EmergencyUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    requests?: Prisma.ReliefRequestUpdateManyWithoutEmergencyNestedInput;
};
export type EmergencyUncheckedUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    requests?: Prisma.ReliefRequestUncheckedUpdateManyWithoutEmergencyNestedInput;
};
/**
 * Count Type EmergencyCountOutputType
 */
export type EmergencyCountOutputType = {
    requests: number;
    plans: number;
};
export type EmergencyCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requests?: boolean | EmergencyCountOutputTypeCountRequestsArgs;
    plans?: boolean | EmergencyCountOutputTypeCountPlansArgs;
};
/**
 * EmergencyCountOutputType without action
 */
export type EmergencyCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmergencyCountOutputType
     */
    select?: Prisma.EmergencyCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * EmergencyCountOutputType without action
 */
export type EmergencyCountOutputTypeCountRequestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReliefRequestWhereInput;
};
/**
 * EmergencyCountOutputType without action
 */
export type EmergencyCountOutputTypeCountPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcurementPlanWhereInput;
};
export type EmergencySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    location?: boolean;
    severity?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    requests?: boolean | Prisma.Emergency$requestsArgs<ExtArgs>;
    plans?: boolean | Prisma.Emergency$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.EmergencyCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["emergency"]>;
export type EmergencySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    location?: boolean;
    severity?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["emergency"]>;
export type EmergencySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    location?: boolean;
    severity?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["emergency"]>;
export type EmergencySelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    location?: boolean;
    severity?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
};
export type EmergencyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "location" | "severity" | "isActive" | "createdAt", ExtArgs["result"]["emergency"]>;
export type EmergencyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requests?: boolean | Prisma.Emergency$requestsArgs<ExtArgs>;
    plans?: boolean | Prisma.Emergency$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.EmergencyCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EmergencyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type EmergencyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $EmergencyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Emergency";
    objects: {
        requests: Prisma.$ReliefRequestPayload<ExtArgs>[];
        plans: Prisma.$ProcurementPlanPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        location: string;
        severity: string;
        isActive: boolean;
        createdAt: Date;
    }, ExtArgs["result"]["emergency"]>;
    composites: {};
};
export type EmergencyGetPayload<S extends boolean | null | undefined | EmergencyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EmergencyPayload, S>;
export type EmergencyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EmergencyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EmergencyCountAggregateInputType | true;
};
export interface EmergencyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Emergency'];
        meta: {
            name: 'Emergency';
        };
    };
    /**
     * Find zero or one Emergency that matches the filter.
     * @param {EmergencyFindUniqueArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmergencyFindUniqueArgs>(args: Prisma.SelectSubset<T, EmergencyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Emergency that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmergencyFindUniqueOrThrowArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmergencyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EmergencyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Emergency that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindFirstArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmergencyFindFirstArgs>(args?: Prisma.SelectSubset<T, EmergencyFindFirstArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Emergency that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindFirstOrThrowArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmergencyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EmergencyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Emergencies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Emergencies
     * const emergencies = await prisma.emergency.findMany()
     *
     * // Get first 10 Emergencies
     * const emergencies = await prisma.emergency.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const emergencyWithIdOnly = await prisma.emergency.findMany({ select: { id: true } })
     *
     */
    findMany<T extends EmergencyFindManyArgs>(args?: Prisma.SelectSubset<T, EmergencyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Emergency.
     * @param {EmergencyCreateArgs} args - Arguments to create a Emergency.
     * @example
     * // Create one Emergency
     * const Emergency = await prisma.emergency.create({
     *   data: {
     *     // ... data to create a Emergency
     *   }
     * })
     *
     */
    create<T extends EmergencyCreateArgs>(args: Prisma.SelectSubset<T, EmergencyCreateArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Emergencies.
     * @param {EmergencyCreateManyArgs} args - Arguments to create many Emergencies.
     * @example
     * // Create many Emergencies
     * const emergency = await prisma.emergency.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends EmergencyCreateManyArgs>(args?: Prisma.SelectSubset<T, EmergencyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Emergencies and returns the data saved in the database.
     * @param {EmergencyCreateManyAndReturnArgs} args - Arguments to create many Emergencies.
     * @example
     * // Create many Emergencies
     * const emergency = await prisma.emergency.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Emergencies and only return the `id`
     * const emergencyWithIdOnly = await prisma.emergency.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends EmergencyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EmergencyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Emergency.
     * @param {EmergencyDeleteArgs} args - Arguments to delete one Emergency.
     * @example
     * // Delete one Emergency
     * const Emergency = await prisma.emergency.delete({
     *   where: {
     *     // ... filter to delete one Emergency
     *   }
     * })
     *
     */
    delete<T extends EmergencyDeleteArgs>(args: Prisma.SelectSubset<T, EmergencyDeleteArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Emergency.
     * @param {EmergencyUpdateArgs} args - Arguments to update one Emergency.
     * @example
     * // Update one Emergency
     * const emergency = await prisma.emergency.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends EmergencyUpdateArgs>(args: Prisma.SelectSubset<T, EmergencyUpdateArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Emergencies.
     * @param {EmergencyDeleteManyArgs} args - Arguments to filter Emergencies to delete.
     * @example
     * // Delete a few Emergencies
     * const { count } = await prisma.emergency.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends EmergencyDeleteManyArgs>(args?: Prisma.SelectSubset<T, EmergencyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Emergencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Emergencies
     * const emergency = await prisma.emergency.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends EmergencyUpdateManyArgs>(args: Prisma.SelectSubset<T, EmergencyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Emergencies and returns the data updated in the database.
     * @param {EmergencyUpdateManyAndReturnArgs} args - Arguments to update many Emergencies.
     * @example
     * // Update many Emergencies
     * const emergency = await prisma.emergency.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Emergencies and only return the `id`
     * const emergencyWithIdOnly = await prisma.emergency.updateManyAndReturn({
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
    updateManyAndReturn<T extends EmergencyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EmergencyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Emergency.
     * @param {EmergencyUpsertArgs} args - Arguments to update or create a Emergency.
     * @example
     * // Update or create a Emergency
     * const emergency = await prisma.emergency.upsert({
     *   create: {
     *     // ... data to create a Emergency
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Emergency we want to update
     *   }
     * })
     */
    upsert<T extends EmergencyUpsertArgs>(args: Prisma.SelectSubset<T, EmergencyUpsertArgs<ExtArgs>>): Prisma.Prisma__EmergencyClient<runtime.Types.Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Emergencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyCountArgs} args - Arguments to filter Emergencies to count.
     * @example
     * // Count the number of Emergencies
     * const count = await prisma.emergency.count({
     *   where: {
     *     // ... the filter for the Emergencies we want to count
     *   }
     * })
    **/
    count<T extends EmergencyCountArgs>(args?: Prisma.Subset<T, EmergencyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EmergencyCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Emergency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmergencyAggregateArgs>(args: Prisma.Subset<T, EmergencyAggregateArgs>): Prisma.PrismaPromise<GetEmergencyAggregateType<T>>;
    /**
     * Group by Emergency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyGroupByArgs} args - Group by arguments.
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
    groupBy<T extends EmergencyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EmergencyGroupByArgs['orderBy'];
    } : {
        orderBy?: EmergencyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EmergencyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmergencyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Emergency model
     */
    readonly fields: EmergencyFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Emergency.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__EmergencyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    requests<T extends Prisma.Emergency$requestsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Emergency$requestsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReliefRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    plans<T extends Prisma.Emergency$plansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Emergency$plansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcurementPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Emergency model
 */
export interface EmergencyFieldRefs {
    readonly id: Prisma.FieldRef<"Emergency", 'String'>;
    readonly name: Prisma.FieldRef<"Emergency", 'String'>;
    readonly description: Prisma.FieldRef<"Emergency", 'String'>;
    readonly location: Prisma.FieldRef<"Emergency", 'String'>;
    readonly severity: Prisma.FieldRef<"Emergency", 'String'>;
    readonly isActive: Prisma.FieldRef<"Emergency", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Emergency", 'DateTime'>;
}
/**
 * Emergency findUnique
 */
export type EmergencyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter, which Emergency to fetch.
     */
    where: Prisma.EmergencyWhereUniqueInput;
};
/**
 * Emergency findUniqueOrThrow
 */
export type EmergencyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter, which Emergency to fetch.
     */
    where: Prisma.EmergencyWhereUniqueInput;
};
/**
 * Emergency findFirst
 */
export type EmergencyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter, which Emergency to fetch.
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: Prisma.EmergencyOrderByWithRelationInput | Prisma.EmergencyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Emergencies.
     */
    cursor?: Prisma.EmergencyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Emergencies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Emergencies.
     */
    distinct?: Prisma.EmergencyScalarFieldEnum | Prisma.EmergencyScalarFieldEnum[];
};
/**
 * Emergency findFirstOrThrow
 */
export type EmergencyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter, which Emergency to fetch.
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: Prisma.EmergencyOrderByWithRelationInput | Prisma.EmergencyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Emergencies.
     */
    cursor?: Prisma.EmergencyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Emergencies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Emergencies.
     */
    distinct?: Prisma.EmergencyScalarFieldEnum | Prisma.EmergencyScalarFieldEnum[];
};
/**
 * Emergency findMany
 */
export type EmergencyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter, which Emergencies to fetch.
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: Prisma.EmergencyOrderByWithRelationInput | Prisma.EmergencyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Emergencies.
     */
    cursor?: Prisma.EmergencyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Emergencies.
     */
    skip?: number;
    distinct?: Prisma.EmergencyScalarFieldEnum | Prisma.EmergencyScalarFieldEnum[];
};
/**
 * Emergency create
 */
export type EmergencyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * The data needed to create a Emergency.
     */
    data: Prisma.XOR<Prisma.EmergencyCreateInput, Prisma.EmergencyUncheckedCreateInput>;
};
/**
 * Emergency createMany
 */
export type EmergencyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Emergencies.
     */
    data: Prisma.EmergencyCreateManyInput | Prisma.EmergencyCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Emergency createManyAndReturn
 */
export type EmergencyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * The data used to create many Emergencies.
     */
    data: Prisma.EmergencyCreateManyInput | Prisma.EmergencyCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Emergency update
 */
export type EmergencyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * The data needed to update a Emergency.
     */
    data: Prisma.XOR<Prisma.EmergencyUpdateInput, Prisma.EmergencyUncheckedUpdateInput>;
    /**
     * Choose, which Emergency to update.
     */
    where: Prisma.EmergencyWhereUniqueInput;
};
/**
 * Emergency updateMany
 */
export type EmergencyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Emergencies.
     */
    data: Prisma.XOR<Prisma.EmergencyUpdateManyMutationInput, Prisma.EmergencyUncheckedUpdateManyInput>;
    /**
     * Filter which Emergencies to update
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * Limit how many Emergencies to update.
     */
    limit?: number;
};
/**
 * Emergency updateManyAndReturn
 */
export type EmergencyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * The data used to update Emergencies.
     */
    data: Prisma.XOR<Prisma.EmergencyUpdateManyMutationInput, Prisma.EmergencyUncheckedUpdateManyInput>;
    /**
     * Filter which Emergencies to update
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * Limit how many Emergencies to update.
     */
    limit?: number;
};
/**
 * Emergency upsert
 */
export type EmergencyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * The filter to search for the Emergency to update in case it exists.
     */
    where: Prisma.EmergencyWhereUniqueInput;
    /**
     * In case the Emergency found by the `where` argument doesn't exist, create a new Emergency with this data.
     */
    create: Prisma.XOR<Prisma.EmergencyCreateInput, Prisma.EmergencyUncheckedCreateInput>;
    /**
     * In case the Emergency was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.EmergencyUpdateInput, Prisma.EmergencyUncheckedUpdateInput>;
};
/**
 * Emergency delete
 */
export type EmergencyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
    /**
     * Filter which Emergency to delete.
     */
    where: Prisma.EmergencyWhereUniqueInput;
};
/**
 * Emergency deleteMany
 */
export type EmergencyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Emergencies to delete
     */
    where?: Prisma.EmergencyWhereInput;
    /**
     * Limit how many Emergencies to delete.
     */
    limit?: number;
};
/**
 * Emergency.requests
 */
export type Emergency$requestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.ReliefRequestWhereInput;
    orderBy?: Prisma.ReliefRequestOrderByWithRelationInput | Prisma.ReliefRequestOrderByWithRelationInput[];
    cursor?: Prisma.ReliefRequestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReliefRequestScalarFieldEnum | Prisma.ReliefRequestScalarFieldEnum[];
};
/**
 * Emergency.plans
 */
export type Emergency$plansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.ProcurementPlanWhereInput;
    orderBy?: Prisma.ProcurementPlanOrderByWithRelationInput | Prisma.ProcurementPlanOrderByWithRelationInput[];
    cursor?: Prisma.ProcurementPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProcurementPlanScalarFieldEnum | Prisma.ProcurementPlanScalarFieldEnum[];
};
/**
 * Emergency without action
 */
export type EmergencyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: Prisma.EmergencySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Emergency
     */
    omit?: Prisma.EmergencyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmergencyInclude<ExtArgs> | null;
};
export {};
