<template>
  <div class='create-mod-task'>
    <Collapse value="base-info" style="margin-top: 10px">
      <Panel name="base-info">
        基本信息
        <div class="form-container" slot="content">
          <NFilter 
            :labelStyle="{ width: '6%' }"
            :configs="formObjBase" 
            :hasSubmit="false"
            @on-get-submit="handleOnGetSubmit($event, 0)"
            :hasCancel="false"
            layout="vertically"
          />
        </div>
      </Panel>
    </Collapse>
    <Collapse value="travel-info" style="margin-top: 10px">
      <Panel name="travel-info">
        航班 & 酒店 & 租车安排
        <div class="form-container" slot="content">
          <NFilter 
            :labelStyle="{ width: '6%' }"
            :configs="formObjTravel" 
            :hasSubmit="false"
            @on-get-submit="handleOnGetSubmit($event, 1)"
            :hasCancel="false"
            layout="vertically"
          />
        </div>
      </Panel>
    </Collapse>
    <Row style="margin-top: 10px">
      <Col span="24" style="text-align: center">
        <Button type="primary" @click="handleOnSave" :loading="loading" :disabled="justView">保存</Button>&nbsp;
        <Button @click="handleOnCancel(false)">取消</Button>
      </Col>
    </Row>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { BaseConfigI } from '@/models/distribute_config'
import { roadtesterListColumns } from './columns'
import * as roadtestManager from '@/models/manager/roadtest'
import { UserInfoI } from '@/models/common'
import moment from 'moment'

@Component({
  components: {
    NFilter
  }
})
export default class CreateTask extends Vue {
  @Prop({ type: Object, default: () => null }) readonly curRow!: roadtestManager.RoadtestTaskListI
  @Prop({ type: Boolean, default: false }) readonly justView!: boolean
  formObjBase: { [p: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: '任务ID',
      value: '',
      placeholder: '创建路测任务时不填',
      disabled: true,
      style: { width: '250px' }
    },
    title: {
      type: 'input',
      label: '路测标题',
      value: '',
      placeholder: '路测标题',
      style: { width: '250px' },
      validate: () => {
        return this.formObjBase.title.value ? '' : '请填写路测标题'
      }
    },
    city: {
      type: 'select',
      label: '路测城市',
      value: '',
      placeholder: '路测城市',
      style: { width: '250px' },
      options: this.baseConfig.city_list.map((t) => ({ label: t.label, value: t.label })),
      validate: () => {
        return this.formObjBase.city.value ? '' : '请选择路测城市'
      }
    },
    road_test_time: {
      type: 'daterange',
      label: '路测时间',
      style: { width: '250px' },
      value: [
        moment().subtract(3, 'days').format('YYYY-MM-DD'),
        moment().subtract(1, 'days').format('YYYY-MM-DD')
      ],
      placeholder: '选择路测时间范围',
      validate: () => this.formObjBase.road_test_time.value.length ? '' : '请选择路测时间范围'
    },
    target: {
      type: 'input-textarea',
      label: '路测目标',
      placeholder: '路测目标',
      value: '',
      validate: () => {
        return this.formObjBase.target.value ? '' : '请填写路测目标'
      }
    }
  }
  formObjTravel: { [p: string]: FilterConfigI } = {
    flight_info: {
      type: 'input-textarea',
      label: '航班信息',
      value: '前往城市:\n日期:\n建议航班:\n航班时间:',
      validate: () => {
        return this.formObjTravel.flight_info.value ? '' : '请填写航班信息'
      }
    },
    hotel_info: {
      type: 'input-textarea',
      label: '酒店信息',
      value: '名称:\n房型:\n详细地址:',
      validate: () => {
        return this.formObjTravel.hotel_info.value ? '' : '请填写酒店信息'
      }
    },
    car_rental_info: {
      type: 'input-textarea',
      label: '租车信息',
      value: '名称:\n航班楼接机地址:',
      validate: () => {
        return this.formObjTravel.car_rental_info.value ? '' : '请填写租车信息'
      }
    },
    car_arrange_info: {
      type: 'input-textarea',
      label: '车辆安排',
      value: '租车人:\n同行人:',
      validate: () => {
        return this.formObjTravel.car_arrange_info.value ? '' : '请填写车辆安排'
      }
    },
    tips: {
      type: 'input-textarea',
      label: '注意事项',
      value: `• 路测前需安装乘客端最新版本\n• 路测 Chat群，全程同步必要信息• 租车软件:神州租车APP，建议在出发前1天提前完成车辆的相赁;选定车辆型号与提车网点;携带租车人的身份证\n• 路测用品：硬件充电线点烟器转接UB头车载支架测试机(端产品提供);充电宝,笔记本电脑,纸笔等(自行准备）\n• APP:高德地图,百度地图,神州租车,住会,航旅纵横滴滴企业版,滴滴出行滴车主,小桔闪报等`,
      placeholder: '注意事项 换行填写'
    }
  }
  getSubmits: Array<() => boolean> = []
  loading: boolean = false

  @Emit('cancel')
  handleOnCancel(update: boolean) {
    return update
  }
  @Watch('curRow')
  onShow() {
    const {
      title = '', city = '', road_test_time = '', target = '', creator = '', update_person = '', person_ids = '',
      flight_info = '', hotel_info = '', car_rental_info = '', car_arrange_info = '', tips = '', id = ''
    } = this.curRow
    this.formObjBase.id.value = id || ''
    this.formObjBase.title.value = title || ''
    this.formObjBase.city.value = city || ''
    this.formObjBase.road_test_time.value = road_test_time && road_test_time.includes('~') ? road_test_time.split('~') : []
    this.formObjBase.target.value = target || ''
    this.formObjTravel.flight_info.value = flight_info || ''
    this.formObjTravel.hotel_info.value = hotel_info || ''
    this.formObjTravel.car_rental_info.value = car_rental_info || ''
    this.formObjTravel.car_arrange_info.value = car_arrange_info || ''
    this.formObjTravel.tips.value = tips || ''
  }
  @Watch('justView')
  onJstViewChange() {
    for (const k in { ...this.formObjBase, ...this.formObjTravel }) {
      if (this.formObjBase.hasOwnProperty(k) || this.formObjTravel.hasOwnProperty(k)) {
        if (this.formObjBase[k] && k !== 'id') {
          this.$set(this.formObjBase[k], 'disabled', this.justView)
        }
        if (this.formObjTravel[k]) {
          this.$set(this.formObjTravel[k], 'disabled', this.justView)
        }
      }
    }
  }

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }

  handleOnGetSubmit(cb: () => boolean, index: number) {
    this.getSubmits[index] = cb
  }
  async handleOnSave() {
    if (!this.getSubmits.length || !this.getSubmits.every((cb) => cb())) {
      return
    }
    const { title, city, road_test_time, target } = this.formObjBase
    const { flight_info, hotel_info, car_rental_info, car_arrange_info, tips } = this.formObjTravel
    const { creator, id } = this.curRow || { creator: '', id: '' }
    this.loading = true
    const res = await roadtestManager.createOrModTask({
      ...(id ? { id } : {}),
      title: title.value,
      city: city.value,
      road_test_time: `${moment(road_test_time.value[0]).format('YYYY-MM-DD')}~${moment(road_test_time.value[1]).format('YYYY-MM-DD')}`,
      target: target.value,
      creator: creator || this.userInfo.username,
      update_person: this.userInfo.username,
      flight_info: flight_info.value,
      hotel_info: hotel_info.value,
      car_rental_info: car_rental_info.value,
      car_arrange_info: car_arrange_info.value,
      tips: tips.value,
      person_ids: ''
    })
    this.loading = false
    const action = this.curRow ? '编辑' : '创建'
    if (res.done) {
      this.$Message.success(`${action}成功, ${res.msg}`)
      this.handleOnCancel(true)
    } else {
      this.$Message.success(`${action}失败, ${res.msg}`)
    }
  }
}
</script>

<style lang="less">
.create-mod-task {
  padding: 20px;
}
</style>
