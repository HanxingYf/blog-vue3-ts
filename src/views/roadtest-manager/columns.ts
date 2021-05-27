import { RoadtesterI, RoadtestTaskListI } from '@/models/manager/roadtest'

export const taskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '路测标题',
    key: 'title',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '路测时间',
    key: 'road_test_time',
    align: 'center',
  },
  {
    title: '路测城市',
    key: 'city',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建人',
    key: 'creator',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '修改人',
    key: 'update_person',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '修改时间',
    key: 'update_time',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center',
    width: 300
  },
]

export const roadtesterListColumns = [
  {
    title: '序号',
    key: 'id',
    align: 'center',
  },
  {
    title: '姓名',
    key: 'nick_name',
    align: 'center',
  },
  {
    title: '邮箱',
    key: 'name',
    align: 'center',
  },
  {
    title: '组别',
    key: 'user_group',
    align: 'center',
  },
  {
    title: '联系电话',
    key: 'phone',
    align: 'center',
  },
  {
    title: '测试手机号',
    key: 'test_phone',
    align: 'center',
  },
  {
    title: '是否首次路测',
    key: 'is_first_test',
    align: 'center',
    slot: 'is_first_test'
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center',
    width: '150px'
  }
]


export const getH5Html = (row: RoadtestTaskListI, roadtesterList: RoadtesterI[]) => {
  const {
    title, city, road_test_time, target,
    flight_info, hotel_info, car_rental_info, car_arrange_info, tips
  } = row
  const genBr = (str: string) => {
    return str.split('\n').join(`<Br>`)
  }
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
        <style>
          body {
            padding: 10px;
            font-size: 14px!important;
          }
          h4 {
            text-align: center;
          }
          .card-body {
            padding: 5px!important;
          }
          .card-header, .list-group-item {
            padding: 5px!important;
          }
          .accordion {
            margin-bottom: 10px;
          }
        </style>
        <title>欢迎参与本次路测</title>
      </head>
      <body>
        <div class="accordion" id="accordionExample1">
          <div class="card">
            <div class="card-header" id="headingOne">
              <div data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                基本信息
              </div>
            </div>
            <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample1">
              <div class="card-body">
                <ul class="list-group">
                  <li class="list-group-item">路测标题: ${title}</li>
                  <li class="list-group-item">路测城市: ${city}</li>
                  <li class="list-group-item">路测时间: ${road_test_time}</li>
                  <li class="list-group-item">
                    <div class="title">路测目标:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(target)}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="accordion" id="accordionExample2">
          <div class="card">
            <div class="card-header" id="headingTwo">
              <div data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                航班&酒店&租车安排
              </div>
            </div>
            <div id="collapseTwo" class="collapse show" aria-labelledby="headingTwo" data-parent="#accordionExample2">
              <div class="card-body">
                <ul class="list-group">
                  <li class="list-group-item">
                    <div class="title">航班信息:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(flight_info)}
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="title">酒店信息:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(hotel_info)}
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="title">租车信息:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(car_rental_info)}
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="title">车辆安排:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(car_arrange_info)}
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="title">注意事项:</div>
                    <div class="card">
                      <div class="card-body">
                        ${genBr(tips)}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="accordion" id="accordionExample3">
          <div class="card">
            <div class="card-header" id="headingThree">
              <div data-toggle="collapse" data-target="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
                路测人员
              </div>
            </div>
            <div id="collapseThree" class="collapse show" aria-labelledby="headingThree" data-parent="#accordionExample3">
              <div class="card-body table-responsive">
                <table class="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th scope="col">序号</th>
                      <th scope="col">姓名</th>
                      <th scope="col">组别</th>
                      <th scope="col">联系电话</th>
                      <th scope="col">测试手机号</th>
                      <th scope="col">是否首次路测</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      roadtesterList.reduce((acc, cur, index) => {
                        return acc + `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${cur.nick_name}</td>
                            <td>${cur.user_group}</td>
                            <td>${cur.phone}</td>
                            <td>${cur.test_phone}</td>
                            <td>${cur.is_first_test ? '是' : '否'}</td>
                          </tr>
                        `
                      }, '')
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="accordion" id="accordionExample4">
          <div class="card">
            <div class="card-header" id="headingFour">
              <div data-toggle="collapse" data-target="#collapseFour" aria-expanded="true" aria-controls="collapseFour">
                审批及报销
              </div>
            </div>
            <div id="collapseFour" class="collapse show" aria-labelledby="headingFour" data-parent="#accordionExample4">
              <div class="card-body">
                (1) 出差之前要在小桔闪报进行国内差旅申请<br>
                &nbsp;&nbsp;• 项目名称：网约车导航路<br>
                &nbsp;&nbsp;• 项目编号：PJ202006040071（如果搜不到”网约车导航路测“，找胡萌老师给加一下权限）<br>
                (2) 费&nbsp;用报销（自行报销）<br>
                &nbsp;&nbsp;• 租车费用报销类型：市场调研； 无此权限需先发邮件给小桔闪报开通<br>
                &nbsp;&nbsp;• 酒店住宿，直接用滴滴出行企业版，公司付款个人无需垫付<br>
                &nbsp;&nbsp;• 租车加油、停车过路、自行打车，通过小桔闪报报销，项目选择市场调研<br>
                &nbsp;&nbsp;• 违章代缴，联系租车门店私下处理，费用以加油票替代（保留油票）<br>
                &nbsp;&nbsp;• 餐饮补助，餐饮100X天数（无需发票）<br>
              </div>
            </div>
          </div>
        </div>
        <!-- Optional JavaScript -->
        <!-- jQuery first, then Popper.js, then Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>
      </body>
    </html>
  `
}
