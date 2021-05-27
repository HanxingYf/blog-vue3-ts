export const ManagerContentAndTickNormalListColumns = [
    {
        title: 'ID',
        key: 'id',
        align: 'center',
        width: 70,
    },
    {
        title: '评测名称',
        key: 'job_name',
        align: 'center',
    },
    {
        title: '创建时间',
        key: 'create_time',
        align: 'center',
        slot: 'create_time',
    },
    {
        title: '截止时间',
        key: 'deadline_time',
        align: 'center',
        slot: 'deadline_time',
    },
    {
        title: '评测描述',
        key: 'description',
        align: 'center',
    },
    {
        title: '已分发数量',
        key: 'dispatch_count',
        align: 'center',
    },
    {
        title: '总数量',
        key: 'case_count',
        align: 'center',
    },
    {
        title: '操作',
        width: 300,
        key: 'action',
        align: 'center',
        slot: 'action',
    },
];

export const DeliveryDetailListNumsColumns = [
    {
        title: '质检已分发',
        key: 'verify_dispatch',
        align: 'center',
    },
    {
        title: '评测已分发',
        key: 'mark_dispatch',
        align: 'center',
    },
    {
        title: '流转',
        key: 'circulation',
        align: 'center',
    },
    {
        title: '总量',
        key: 'total',
        align: 'center'
    }
]

export const DeliveryDetailListMarkPersonColumns = [
    {
        title: '评测人员',
        key: 'user_name',
        align: 'center',
    },
    {
        title: '数量',
        key: 'nums',
        align: 'center',
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        slot: 'action'
    },
]

export const DeliveryDetailListVerifyPersonColumns = [
    {
        title: '质检人员',
        key: 'job_name',
        align: 'center',
    },
    {
        title: '数量',
        key: 'dispatch_count',
        align: 'center',
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        slot: 'action'
    },
]

export const ManagerContentAndTickMarkedTaskListColumns = [
    {
        title: 'CaseID',
        key: 'jenkins_diff_record_id',
        align: 'center',
    },
    {
        title: '播报内容评价',
        key: 'content_tag',
        align: 'center',
    },
    {
        title: '内容错误分类',
        key: 'content_err_type',
        align: 'center',
    },
    {
        title: '内容原因分析',
        key: 'content_err_reason',
        align: 'center',
    },
    {
        title: '播报时机评价',
        key: 'pos_tag',
        align: 'center',
    },
    {
        title: '时机错误分类',
        key: 'pos_err_type',
        align: 'center',
    },
    {
        title: '时机原因分析',
        key: 'pos_err_reason',
        align: 'center',
    },
    {
        title: '评测时间',
        key: 'update_time',
        align: 'center',
    },
    {
        title: '最后操作人',
        key: 'last_operator',
        align: 'center',
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        slot: 'action'
    },
]

export const contentStatisticsColunms = [
    {
        title: '播报内容评价',
        key: 'version',
        align: 'center',
        slot: 'version'
    },
    {
        title: '数量',
        key: 'num',
        align: 'center',
    },
    {
        title: '占比',
        key: 'percent',
        align: 'center',
    },
]

export const tickStatisticsColunms = [
    {
        title: '播报时机评价',
        key: 'pos',
        align: 'center',
        slot: 'version'
    },
    {
        title: '数量',
        key: 'num',
        align: 'center',
    },
    {
        title: '占比',
        key: 'percent',
        align: 'center',
    },
]

