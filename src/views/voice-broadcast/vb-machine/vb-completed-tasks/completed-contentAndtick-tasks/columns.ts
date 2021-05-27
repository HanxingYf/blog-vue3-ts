export const ContentAndTickTaskListColumns = [
    {
        title: 'ID',
        key: 'id',
        align: 'center'
    },
    {
        title: '任务名称',
        key: 'task_name',
        align: 'center'
    },
    {
        title: '创建人',
        key: 'creator',
        align: 'center',
    },
    {
        title: '创建时间',
        key: 'create_time',
        align: 'center',
        slot: 'time'
    },
    {
        title: '数量',
        key: 'num',
        align: 'center'
    },
    {
        title: '操作',
        width: 250,
        key: 'action',
        align: 'center',
        slot: 'action'
    }
]
export const ContentAndTickTaskDetailColumns = [
    {
        title: 'CaseID',
        key: 'id',
        align: 'center',
    },
    {
        title: '线上版本播报',
        key: 'original_tts',
        align: 'center',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '新策略版本播报',
        key: 'new_tts',
        align: 'center',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        slot: 'action',
        width: 250
    }
]
