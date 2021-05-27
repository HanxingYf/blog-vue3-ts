<template>
  <div class="filter-wrapper" :class="layout">
    <div class="filter-form-item-wrapper" v-for="(config, key) in configs" :key="key" v-show="!config.hide">
      <div class="filter-form-item-control">
        <div class="filter-form-item-label" :style="labelStyle">
          <span v-if="config.validate" style="color: #f60;font-size: 16px">*</span>
          <!-- <NBeautyLabel :text="config.label" /> -->
          {{ config.label }}
        </div>
        <div class="filter-form-item-colon">:</div>
        <div class="filter-form-item-box" :class="hasSwitch ? 'has-switch' : ''">
          <!-- text -->
          <template v-if="config.type === 'text'">
            <div class="text" :style="{ width: config.diffVal ? '50%' : '100%' }">{{ config.value }}</div>&nbsp;
            <div class="text" :style="{ width: '50%' }" v-if="config.diffVal">{{ config.diffVal }}</div>
          </template>
          <!-- input -->
          <template v-if="config.type.includes('input')">
            <!-- input -->
            <template v-if="config.type === 'input'">
              <Input @on-focus="onFocus($event, config)" v-model="config.value" :placeholder="config.placeholder" :style="{ ...config.style, ...style }" :disabled="config.disabled" />
            </template>
            <!-- input-textarea -->
            <template v-if="config.type === 'input-textarea'">
              <Input type="textarea" :autosize="true" v-model="config.value" :placeholder="config.placeholder" :style="{ ...config.style, ...style }" :disabled="config.disabled" />
            </template>
            <!-- input-range -->
            <template v-if="config.type === 'input-range'">
              <Input v-model="config.value" placeholder="min" :style="{ ...config.style, ...style }" :disabled="config.disabled" />
              &nbsp;~&nbsp;
              <Input v-model="config.value2" placeholder="max" :style="{ ...config.style, ...style }" :disabled="config.disabled" />
            </template>
            <!-- input-number -->
            <template v-if="config.type === 'input-number'">
              <InputNumber @on-focus="onFocus($event, config)" :max="config.maxNum" :min="config.minNum" v-model="config.value" :placeholder="config.placeholder" :style="{ ...config.style, ...style, width: '100%' }" :disabled="config.disabled" />
            </template>
            <!-- input + number + slider -->
            <template v-if="config.type === 'input-slider-number'">
              <Slider :style="{ ...config.style, ...style, marginLeft: '10px' }" :min="1" :max="10000" v-model="config.value"/>
              <Input type="number" number style="width: 100px;margin-left: 10px;" v-model="config.value"/>
            </template>
            <!-- input + select -->
            <template v-if="config.type === 'input-select'">
              <Input v-model="config.value" :style="{ ...config.style, ...style }" :disabled="config.disabled" >
                <Select style="width: 80px" v-model="config.value2" slot="prepend">
                  <Option
                    v-for="(option, index) in config.options"
                    v-bind:key="index"
                    :value="option.value"
                  >{{ option.label }}</Option>
                </Select>
              </Input>
            </template>
            <!-- input range + select -->
            <template v-if="config.type === 'input-range-select'">
              <Select style="width: 33%" v-model="config.value" clearable @on-clear="onClear(key)">
                <Option
                  v-for="(option, index) in config.options"
                  v-bind:key="index"
                  :value="option.value"
                >{{ option.label }}</Option>
              </Select>
              &nbsp;:&nbsp;
              <InputNumber v-model="config.value2" placeholder="min(不填为0)" :max="+config.value3 - 1" :style="{ ...config.style, ...style, width: '30%' }" :disabled="config.disabled" />
              &nbsp;~&nbsp;
              <InputNumber v-model="config.value3" placeholder="max(不填为0)" :min="+config.value2 + 1" :style="{ ...config.style, ...style, width: '30%' }" :disabled="config.disabled" />
            </template>
          </template>
          <!-- select -->
          <template v-if="config.type.includes('select')">
            <!-- select -->
            <template v-if="config.type === 'select'">
              <Select 
                v-model="config.value" 
                filterable
                @on-query-change="onSelectQueryChange($event, config)"
                :placeholder="config.placeholder" 
                :disabled="config.disabled"
                :style="{ ...config.style, ...style }">
                <Option
                  v-for="(option, index) in config.options"
                  v-bind:key="index"
                  v-if="option.label"
                  :value="option.value"
                >{{ option.label }}</Option>
                <!-- -{{ option.value }} -->
              </Select>
            </template>
            <!-- select-multi -->
            <template v-if="config.type === 'select-multi'">
              <Select 
                v-model="config.value" 
                multiple
                filterable
                :max-tag-count="1"
                :disabled="config.disabled"
                :placeholder="config.placeholder" 
                :style="{ ...config.style, ...style }"
                @on-change="handleOnSelectMulti($event, key, config)">
                <Option :value="config.value.length === config.options.length ? 'empty' : 'all'">
                  {{ config.value.length === config.options.length ? '全不选' : '全选' }}
                </Option>
                <Option
                  v-for="(option, index) in config.options"
                  v-bind:key="index"
                  v-if="option.label"
                  :value="option.value"
                >{{ option.label }}</Option>
              </Select>
            </template>
            <!-- select-img -->
            <template v-if="config.type === 'select-img'">
              <Select 
                v-model="config.value" 
                :disabled="config.disabled"
                filterable
                :placeholder="config.placeholder" 
                :style="{ ...config.style, ...style }">
                <Option
                  v-for="(option, index) in config.options"
                  v-bind:key="index"
                  :value="option.value"
                >
                <span class="option-img">
                  <img :src="getCodeImgUrl(option.value)">
                </span>
                {{ option.label }}</Option>
              </Select>
              <div v-if="config.value" class="config-img">
                <img :src="getCodeImgUrl(config.value)">
              </div>
            </template>
          </template>
          <!-- radio -->
          <template v-if="config.type.includes('radio')">
            <template v-if="config.type === 'radio-group'">
              <RadioGroup v-model="config.value" :style="{ ...config.style, ...style }">
                <Radio v-for="(item, index) in config.options" :key="index" :label='item.value' :disabled="config.disabled">{{ item.label }}</Radio>
              </RadioGroup>
            </template>
          </template>
          <!-- checkbox -->
          <template v-if="config.type.includes('checkbox')">
            <template v-if="config.type === 'checkbox-group'">
              <CheckboxGroup v-model="config.value" :style="{ ...config.style, ...style }">
                <Checkbox v-for="(item, index) in config.options" :key="index" :label='item.value' :disabled="config.disabled">{{ item.label }}</Checkbox>
              </CheckboxGroup>
            </template>
          </template>
          <!-- date -->
          <template v-if="config.type.includes('date')">
            <DatePicker 
              transfer
              v-model="config.value"
              :type="config.type" 
              :clearable="false"
              :placeholder="config.placeholder" 
              :style="{ ...config.style, ...style }"
              :disabled="config.disabled"
            />
          </template>
          <!-- button -->
          <template v-if="config.type === 'button'">
            <Button type="primary" :disabled="config.disabled" @click="config.click" :style="{ ...config.style, ...style }">{{ config.label }}</Button>
          </template>
          <div class="switch" v-if="config.disableCtl && hasSwitch">
            <i-switch size="small" :value="config.disabled" @on-change="onSwitchDisabled($event, key, config)"/>
          </div>
        </div>
      </div>
      <div class="filter-form-item-tips" 
        :style="layout === 'vertically' ? { paddingLeft: `calc(${labelStyle.width || '25%'} + 15px)` } : { paddingLeft: `calc(100% - ${config.style ? config.style.width : '150px'})`}">
        {{  state ? (!config.disabled && config.validate ? config.validate() : '') : '' }}
      </div>
      <div class="filter-form-item-slot" v-show="config.showSlot">
        <slot :name="config.slot"></slot>
      </div>
    </div>
    <div class="filter-form-item-wrapper" :style="layout === 'vertically' ? { paddingLeft: `calc(${labelStyle.width || '25%'} + 15px)` } : {}" v-if="hasSubmit || hasCancel">
      <Button v-if="hasSubmit" style="width: 100px" type="primary" :loading="loading" @click="handleOnSubmit">{{ submitText }}</Button>&nbsp;&nbsp;
      <Button v-if="hasCancel" style="width: 100px" type="default" :loading="loading" @click="handleOnCancel">{{ cancelText }}</Button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { FilterConfigI } from './types'
import NBeautyLabel from '@/components/dumb/N-beauty-label.vue'
import { getCodeImgUrl } from '@/utils'

@Component({ components: { NBeautyLabel } })
export default class NFilter extends Vue {
  @Prop({ type: Object, default: () => ({}) }) readonly configs!: { [propName: string]: FilterConfigI }
  @Prop({ type: String, default: 'horizontally' }) readonly layout!: string
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Boolean, default: true }) readonly hasSubmit!: boolean
  @Prop({ type: Boolean, default: true }) readonly hasCancel!: boolean
  @Prop({ type: String, default: '查询' }) readonly submitText!: string
  @Prop({ type: String, default: '重置' }) readonly cancelText!: string
  @Prop({ type: Boolean, default: false }) readonly hasSwitch!: boolean
  @Prop({ type: Object, default: () => ({}) }) readonly labelStyle!: {}
  state: boolean = false
  getCodeImgUrl = getCodeImgUrl

  get style() {
    if (this.layout === 'vertically') {
      return { maxWidth: `calc(100% - 15px - ${ this.hasSwitch ? '60px' : '0' })` }
    } else {
      return {}
    }
  }

  @Emit('on-submit')
  onSubmit() {
    return true
  }
  @Emit('on-get-submit')
  onGetSubmit() {
    return this.handleOnSubmit
  }
  @Emit('on-cancel')
  handleOnCancel() {
    return true
  }
  onFocus(event: any, config: FilterConfigI) {
    config.onFocus && config.onFocus()
  }

  handleOnSubmit() {
    this.state = true
    for (const key in this.configs) {
      if (this.configs.hasOwnProperty(key)) {
        const item = this.configs[key]
        const { hide, validate, disabled, value } = item
        // 非隐藏 且 校验回调失败
        if (!hide && validate && validate()) {
          this.$Message.warning(validate())
          return false
        }
      }
    }
    this.onSubmit()
    this.state = false
    return true
  }
  onSelectQueryChange(query: string, config: FilterConfigI) {
    query && config.onSelectQueryChange && config.onSelectQueryChange(query)
  }
  onSwitchDisabled(disabled: boolean, key: string, config: FilterConfigI) {
    this.configs[key].disabled = disabled
    this.$forceUpdate()
  }
  handleOnSelectMulti(selected: string[], key: string, config: FilterConfigI) {
    if (selected.includes('all')) {
      this.configs[key].value = config.options!.map((c) => c.value)
    }
    if (selected.includes('empty')) {
      this.configs[key].value = []
    }
  }
  onClear(key: string) {
    this.$set(this.configs[key], 'value', '')
  }
  mounted() {
    this.onGetSubmit()
    if (this.hasSwitch) {
      for (const key in this.configs) {
        if (this.configs.hasOwnProperty(key)) {
          if (this.configs[key].disableCtl) {
            this.configs[key].disabled = true
          }
        }
      }
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang='less'>
.filter-wrapper {
  display: flex;
  align-items: top;
  flex-wrap: wrap;
  font-size: 14px;
  &.horizontally, & {      
    .filter-form-item-wrapper {
      margin-right: 10px;
      &:last-child {
        margin-right: unset;
      }
      .filter-form-item-control {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .filter-form-item-label {
          font-size: 12px;
        }
        .filter-form-item-colon {
          width: 15px;
          text-align: center;
        }
        .filter-form-item-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          .text {
            width: 100%;
            min-height: 30px;
            line-height: 30px;
            display: inline-block;
            vertical-align: middle;
            border-radius: 3px;
            background-color: #f3f3f3;
            text-align: center;
            border: 1px solid #dcdee2;
            border-radius: 4px;
            word-break: break-all;
          }
          .option-img {
            width: 20px;
            height: 20px;
            display: inline-block;
            vertical-align: sub;
            background: #439eb4;
            border-radius: 3px;
            padding: 3px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .config-img {
            margin-left: 5px;
            width: 30px;
            height: 30px;
            border-radius: 3px;
            background: #439eb4;
            padding: 3px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
      .filter-form-item-tips {
        // height: 18px;
        margin: 5px 0;
        color: red;
        font-size: 12px;
      }
    }
  }
  &.vertically {
    padding: 10px 20px;
    flex-direction: row;
    .filter-form-item-wrapper {
      width: 100%;
      display: block;
      margin-right: unset;
      margin-bottom: 10px;
      .filter-form-item-control {
        .filter-form-item-label {
          width: 25%;
          text-align: right;
        }
        .filter-form-item-box {
          width: calc(100% - 25% - 15px);
          .switch {
            display: inline-block;
            width: 30px;
          }
          &.has-switch {
            width: calc(100% - 25% - 15px - 30px);
          }
        }
      }
      .filter-form-item-tips {
        text-align: left;
      }
    }
  }
}
</style>
