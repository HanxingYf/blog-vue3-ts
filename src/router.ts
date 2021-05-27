import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/voice-broadcast',
      name: 'voice-broadcast',
      component: () => import('./views/voice-broadcast/Index.vue'),
      children: [
        {
          path: 'machine-recall',
          name: 'indicator/sub-indicator/machine-recall',
          component: () => import('./views/voice-broadcast/vb-indicator/MachineRecallRate.vue'),
        },
        {
          path: 'call-rates',
          alias: '/call-rates',
          name: 'indicator/sub-indicator/call-rates',
          component: () => import('./views/voice-broadcast/vb-indicator/CallRates.vue'),
        },
        {
          path: 'indicator-panel',
          name: 'indicator/indicator-panel',
          component: () => import('./views/voice-broadcast/vb-indicator/IndicatorPanel.vue'),
        },
        {
          path: 'create-task',
          name: 'machine/create-task',
          component: () => import('./views/voice-broadcast/vb-machine/vb-create-task/Index.vue'),
        },
        {
          path: 'completed-tasks',
          name: 'machine/completed-tasks',
          component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'machine/completed-tasks/task-list',
              alias: '/voice-broadcast/completed-tasks',
              component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/CompletedTaskTab.vue'),
            },
            {
              path: 'content-task-detail',
              name: 'machine/completed-tasks/content-task-detail',
              component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/completed-content-tasks/ContentTaskDetail.vue'),
            },
            {
              path: 'codediff-task-detail',
              name: 'machine/completed-tasks/codediff-task-detail',
              component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/completed-codediff-tasks/CodeDiffTaskDetail.vue'),
            },
            {
              path: 'tick-task-detail',
              name: 'machine/completed-tasks/tick-task-detail',
              component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/completed-tick-tasks/TickTaskDetail.vue'),
            },
            {
              path: 'contentandtick-task-detail',
              name: 'machine/completed-tasks/contentandtick-task-detail',
              component: () => import('./views/voice-broadcast/vb-machine/vb-completed-tasks/completed-contentAndtick-tasks/ContentAndTickDetail.vue'),
            }
          ]
        },
        {
          path: 'task-manager',
          name: 'manager/task-manager',
          component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/task-manager/task-list',
              alias: '/voice-broadcast/task-manager',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/JobManagerTab.vue')
            },
            {
              path: 'content-task-detail',
              name: 'manager/task-manager/content-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-content/content/ContentDetail.vue')
            },
            {
              path: 'content-task-statistics',
              name: 'manager/task-manager/content-task-statistics',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-content/content/ContentStatistics.vue')
            },
            {
              path: 'codediff-task-detail',
              name: 'manager/task-manager/codediff-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-content/codediff/CodeDiffDetail.vue')
            },
            {
              path: 'codediff-task-statistics',
              name: 'manager/task-manager/codediff-task-statistics',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-content/codediff/CodeDiffStatistics.vue')
            },
            {
              path: 'tick-task-detail',
              name: 'manager/task-manager/tick-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-tick/tick/TickDetail.vue')
            },
            {
              path: 'tick-task-statistics',
              name: 'manager/task-manager/tick-task-statistics',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-tick/tick/TickStatistics.vue')
            },
            {
              path: 'content-and-task-detail',
              name: 'manager/task-manager/content-and-tick-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-contentAndtick/contentAndTick/ContentAndTickDetail.vue')
            },
            {
              path: 'content-and-tick-task-statistics',
              name: 'manager/task-manager/content-and-tick-task-statistics',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-manager/vb-job-manager-contentAndtick/contentAndTick/ContentAndTickStatistics.vue')
            },
          ]
        },
        {
          path: 'task-evaluation',
          name: 'manager/task-evaluation',
          alias: '/voice-broadcast',
          component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/task-evaluation/task-list',
              alias: '/voice-broadcast/task-evaluation',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/JobEvaluationTab.vue')
            },
            {
              path: 'content-task-detail',
              name: 'manager/task-evaluation/content-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-content/content/ContentDetail.vue')
            },
            {
              path: 'codediff-task-detail',
              name: 'manager/task-evaluation/codediff-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-content/codediff/CodeDiffDetail.vue')
            },
            {
              path: 'tick-task-detail',
              name: 'manager/task-evaluation/tick-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-tick/tick/TickDetail.vue')
            },
            {
              path: 'content-and-tick-task-detail',
              name: 'manager/task-evaluation/content-and-tick-task-detail',
              component: () => import('./views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-contentAndtick/contentAndtick/ContentAndTickDetail.vue')
            }
          ]
        },
        {
          path: 'truth-manage',
          name: 'truth/truth-manage',
          component: () => import('./views/voice-broadcast/vb-truth/vb-truth-manage/Index.vue'),
          children: [
            {
              path: 'truth-list',
              name: 'truth/truth-manage/list',
              alias: '/voice-broadcast/truth-manage',
              component: () => import('./views/voice-broadcast/vb-truth/vb-truth-manage/TruthManageTab.vue'),
            },
          ]
        },
      ]
    },
    {
      path: '/basemap-evaluation',
      name: 'basemap-evaluation',
      component: () => import('./views/basemap-evaluation/Index.vue'),
      children: [
        {
          path: 'create-task',
          name: 'machine/basemap-create-task',
          component: () => import('./views/basemap-evaluation/be-machine/be-create-task/Index.vue'),
        },
        {
          path: 'completed-tasks',
          name: 'machine/basemap-completed-tasks',
          component: () => import('./views/basemap-evaluation/be-machine/be-completed-tasks/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'machine/basemap-completed-tasks/task-list',
              alias: '/basemap-evaluation/completed-tasks',
              component: () => import('./views/basemap-evaluation/be-machine/be-completed-tasks/CompletedTaskTab.vue'),
            },
            {
              path: 'basemap-task-detail',
              name: 'machine/completed-basemap-tasks/basemap-task-detail',
              component: () => import('./views/basemap-evaluation/be-machine/be-completed-tasks/completed-basemap-tasks/BasemapTaskDetail.vue'),
            }
          ]
        },
        {
          path: 'task-manager',
          name: 'manager/basemap-task-manager',
          component: () => import('./views/basemap-evaluation/be-manager/be-job-manager/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/basemap-task-manager/task-list',
              alias: '/basemap-evaluation/task-manager',
              component: () => import('./views/basemap-evaluation/be-manager/be-job-manager/JobManagerTab.vue')
            },
            {
              path: 'basemap-task-detail',
              name: 'manager/basemap-task-manager/basemap-task-detail',
              component: () => import('./views/basemap-evaluation/be-manager/be-job-manager/be-job-manager-basemap/basemap/BasemapDetail.vue')
            },
            {
              path: 'basemap-task-statistics',
              name: 'manager/basemap-task-manager/basemap-task-statistics',
              component: () => import('./views/basemap-evaluation/be-manager/be-job-manager/be-job-manager-basemap/basemap/BasemapStatistics.vue')
            }
          ]
        },
        {
          path: 'task-evaluation',
          alias: '/basemap-evaluation',
          name: 'manager/basemap-task-evaluation',
          component: () => import('./views/basemap-evaluation/be-manager/be-job-evaluation/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/basemap-task-evaluation/task-list',
              alias: '/basemap-evaluation/task-evaluation',
              component: () => import('./views/basemap-evaluation/be-manager/be-job-evaluation/JobEvaluationTab.vue')
            },
            {
              path: 'basemap-task-detail',
              name: 'manager/basemap-task-evaluation/basemap-task-detail',
              component: () => import('./views/basemap-evaluation/be-manager/be-job-evaluation/be-job-evaluation-basemap/basemap/BasemapDetail.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/laneline-evaluation',
      name: 'laneline-evaluation',
      component: () => import('./views/laneline-evaluation/Index.vue'),
      children: [
        {
          path: 'create-task',
          name: 'machine/laneline-create-task',
          component: () => import('./views/laneline-evaluation/ln-machine/ln-create-task/Index.vue'),
        },
        {
          path: 'completed-tasks',
          name: 'machine/laneline-completed-tasks',
          component: () => import('./views/laneline-evaluation/ln-machine/ln-completed-tasks/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'machine/laneline-completed-tasks/task-list',
              alias: '/laneline-evaluation/completed-tasks',
              component: () => import('./views/laneline-evaluation/ln-machine/ln-completed-tasks/TaskList.vue'),
            },
            {
              path: 'task-detail',
              name: 'machine/laneline-completed-tasks/task-detail',
              component: () => import('./views/laneline-evaluation/ln-machine/ln-completed-tasks/TaskDetail.vue'),
            }
          ]
        },
        {
          path: 'task-manager',
          name: 'manager/laneline-task-manager',
          component: () => import('./views/laneline-evaluation/ln-manager/ln-job-manager/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/laneline-task-manager/task-list',
              alias: '/laneline-evaluation/task-manager',
              component: () => import('./views/laneline-evaluation/ln-manager/ln-job-manager/TaskList.vue')
            },
            {
              path: 'task-detail',
              name: 'manager/laneline-task-manager/task-detail',
              component: () => import('./views/laneline-evaluation/ln-manager/ln-job-manager/TaskDetail.vue')
            },
            {
              path: 'task-statistics',
              name: 'manager/laneline-task-manager/task-statistics',
              component: () => import('./views/laneline-evaluation/ln-manager/ln-job-manager/TaskStatistics.vue')
            }
          ]
        },
        {
          path: 'task-evaluation',
          name: 'manager/laneline-task-evaluation',
          alias: '/laneline-evaluation',
          component: () => import('./views/laneline-evaluation/ln-manager/ln-job-evaluation/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/laneline-task-evaluation/task-list',
              alias: '/laneline-evaluation/task-evaluation',
              component: () => import('./views/laneline-evaluation/ln-manager/ln-job-evaluation/TaskList.vue')
            },
            {
              path: 'task-detail',
              name: 'manager/laneline-task-evaluation/task-detail',
              component: () => import('./views/laneline-evaluation/ln-manager/ln-job-evaluation/TaskDetail.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/vector-evaluation',
      name: 'vector-evaluation',
      component: () => import('./views/vector-evaluation/Index.vue'),
      children: [
        {
          path: 'create-task',
          name: 'machine/vector-create-task',
          component: () => import('./views/vector-evaluation/ve-machine/ve-create-task/IndexTab.vue'),
        },
        {
          path: 'completed-tasks',
          name: 'machine/vector-completed-tasks',
          component: () => import('./views/vector-evaluation/ve-machine/ve-completed-tasks/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'machine/vector-completed-tasks/task-list',
              alias: '/vector-evaluation/completed-tasks',
              component: () => import('./views/vector-evaluation/ve-machine/ve-completed-tasks/IndexTab.vue'),
            },
            {
              path: 'task-detail',
              name: 'machine/vector-completed-tasks/task-detail',
              component: () => import('./views/vector-evaluation/ve-machine/ve-completed-tasks/TaskDetail.vue'),
            }
          ]
        },
        {
          path: 'task-manager',
          name: 'manager/vector-task-manager',
          component: () => import('./views/vector-evaluation/ve-manager/ve-job-manager/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/vector-task-manager/task-list',
              alias: '/vector-evaluation/task-manager',
              component: () => import('./views/vector-evaluation/ve-manager/ve-job-manager/IndexTab.vue')
            },
            {
              path: 'task-detail',
              name: 'manager/vector-task-manager/task-detail',
              component: () => import('./views/vector-evaluation/ve-manager/ve-job-manager/TaskDetail.vue')
            },
            {
              path: 'task-statistics',
              name: 'manager/vector-task-manager/task-statistics',
              component: () => import('./views/vector-evaluation/ve-manager/ve-job-manager/TaskStatistics.vue')
            }
          ]
        },
        {
          path: 'task-evaluation',
          name: 'manager/vector-task-evaluation',
          alias: '/vector-evaluation',
          component: () => import('./views/vector-evaluation/ve-manager/ve-job-evaluation/Index.vue'),
          children: [
            {
              path: 'task-list',
              name: 'manager/vector-task-evaluation/task-list',
              alias: '/vector-evaluation/task-evaluation',
              component: () => import('./views/vector-evaluation/ve-manager/ve-job-evaluation/IndexTab.vue')
            },
            {
              path: 'task-detail',
              name: 'manager/vector-task-evaluation/task-detail',
              component: () => import('./views/vector-evaluation/ve-manager/ve-job-evaluation/TaskDetail.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/effictency-statiscs',
      name: 'effictency-statiscs',
      component: () => import('./views/effictency-statiscs/Index.vue'),
      children: [
        {
          path: 'effictency-works',
          alias: '/effictency-statiscs',
          name: 'effictency/effictency-works',
          component: () => import('./views/effictency-statiscs/EffictencyWorks.vue')
        }
      ]
    },
    {
      path: '/roadtest-manager',
      name: 'roadtest-manager',
      component: () => import('./views/roadtest-manager/Index.vue'),
      children: [
        {
          path: 'task-list',
          alias: '/roadtest-manager',
          name: 'roadtest/task-list',
          component: () => import('./views/roadtest-manager/TaskList.vue')
        }
      ]
    }
  ]
})
