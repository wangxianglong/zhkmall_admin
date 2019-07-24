import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    perms: ['GET /aaa','POST /bbb']     will control the page perms (you can set multiple perms)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/user',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'userManage',
    meta: {
      title: '用户管理',
      icon: 'peoples'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/user/user'),
        name: 'user',
        meta: {
          perms: ['GET /admin/user/list'],
          title: '会员管理',
          noCache: true
        }
      // },
      // {
      //   path: 'realName',
      //   component: () => import('@/views/user/realName'),
      //   name: 'realName',
      //   meta: {
      //     perms: ['GET /admin/realname/list', 'POST /admin/realname/audit'],
      //     title: '实名认证',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'userRecommend',
      //   component: () => import('@/views/user/userRecommend'),
      //   name: 'userRecommend',
      //   meta: {
      //     perms: ['GET /admin/userrecommend/list'],
      //     title: '推荐会员',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'address',
      //   component: () => import('@/views/user/address'),
      //   name: 'address',
      //   meta: {
      //     perms: ['GET /admin/address/list'],
      //     title: '收货地址',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'mealCoupon',
      //   component: () => import('@/views/user/mealCoupon'),
      //   name: 'mealCoupon',
      //   meta: {
      //     perms: ['GET /admin/buffetcouponuser/list', 'GET /admin/buffetcouponuser/read'],
      //     title: '用户餐券',
      //     noCache: true
      //   }
      }
    ]
  },

  {
    path: '/mall',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'mallManage',
    meta: {
      title: '产品管理',
      icon: 'chart'
    },
    children: [
      {
        path: 'productList',
        component: () => import('@/views/mall/productList'),
        name: 'productList',
        meta: {
          perms: ['GET /admin/goods/list', 'POST /admin/goods/create', 'GET /admin/goods/read', 'POST /admin/goods/update', 'POST /admin/goods/delete', 'POST /admin/goods/standUpAndDown'],
          title: '商品列表',
          noCache: true
        }
      },
      {
        path: 'addProduct',
        component: () => import('@/views/mall/addProduct'),
        name: 'addProduct',
        meta: {
          perms: ['POST /admin/goods/create', 'GET /admin/goods/read', 'POST /admin/goods/update'],
          title: '商品详情',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'category',
        component: () => import('@/views/mall/category'),
        name: 'category',
        meta: {
          perms: ['GET /admin/category/list', 'POST /admin/category/create', 'GET /admin/category/read', 'POST /admin/category/update', 'POST /admin/category/delete'],
          title: '商品分类',
          noCache: true
        }
      },
      {
        path: 'productTypes',
        component: () => import('@/views/mall/productTypes'),
        name: 'productTypes',
        meta: {
          perms: ['GET /admin/category/list', 'POST /admin/category/create', 'GET /admin/category/read', 'POST /admin/category/update', 'POST /admin/category/delete'],
          title: '商品类型',
          noCache: true
        }
      },
      {
        path: 'brandManage',
        component: () => import('@/views/mall/brandManage'),
        name: 'brandManage',
        meta: {
          perms: ['GET /admin/category/list', 'POST /admin/category/create', 'GET /admin/category/read', 'POST /admin/category/update', 'POST /admin/category/delete'],
          title: '品牌管理',
          noCache: true
        }
      }
    ]
  },

  // {
  //   path: '/restaurant',
  //   component: Layout,
  //   redirect: 'noredirect',
  //   alwaysShow: true,
  //   name: 'restaurant',
  //   meta: {
  //     title: '餐厅管理',
  //     icon: 'icon'
  //   },
  //   children: [
  //     {
  //       path: 'foodCategory',
  //       component: () => import('@/views/restaurant/foodCategory'),
  //       name: 'foodCategory',
  //       meta: {
  //         perms: ['GET /admin/suppercategory/list', 'POST /admin/suppercategory/create', 'GET /admin/suppercategory/read', 'POST /admin/suppercategory/update', 'POST /admin/suppercategory/delete'],
  //         title: '菜品类目',
  //         noCache: true
  //       }
  //     },
  //     {
  //       path: 'foodManage',
  //       component: () => import('@/views/restaurant/foodManage'),
  //       name: 'foodManage',
  //       meta: {
  //         perms: ['GET /admin/supper/list', 'POST /admin/supper/create', 'GET /admin/supper/read', 'POST /admin/supper/update', 'POST /admin/supper/delete', 'POST /admin/supper/standUpAndDown'],
  //         title: '菜品管理',
  //         noCache: true
  //       }
  //     },
  //     {
  //       path: 'buffetCoupon',
  //       component: () => import('@/views/restaurant/buffetCoupon'),
  //       name: 'buffetCoupon',
  //       meta: {
  //         perms: ['GET /admin/buffetcoupon/list', 'POST /admin/buffetcoupon/create', 'GET /admin/buffetcoupon/read', 'POST /admin/buffetcoupon/update', 'POST /admin/buffetcoupon/delete', 'POST /admin/buffetcoupon/standUpAndDown'],
  //         title: '自助餐券管理',
  //         noCache: true
  //       }
  //     }
  //   ]
  // },

  {
    path: '/business',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'businessManage',
    meta: {
      title: '业务管理',
      icon: 'excel'
    },
    children: [
      {
        path: 'mallOrder',
        component: () => import('@/views/business/mallOrder'),
        name: 'mallOrder',
        meta: {
          perms: ['GET /admin/order/list', 'GET /admin/order/read', 'POST /admin/order/designate', 'POST /admin/order/status'],
          title: '订单列表',
          noCache: true
        }
      // },
      // {
      //   path: 'ticketOrder',
      //   component: () => import('@/views/business/ticketOrder'),
      //   name: 'ticketOrder',
      //   meta: {
      //     perms: ['GET /admin/takeoutorder/list', 'GET /admin/takeoutorder/read', 'POST /admin/takeoutorder/designate', 'POST /admin/takeoutorder/status'],
      //     title: '外卖订单',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'deliveryOrder',
      //   component: () => import('@/views/business/deliveryOrder'),
      //   name: 'deliveryOrder',
      //   meta: {
      //     perms: ['GET /admin/buffetcouponorder/list', 'GET /admin/buffetcouponorder/read', 'POST /admin/buffetcouponorder/status'],
      //     title: '券订单',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'flowStatistics',
      //   component: () => import('@/views/business/flowStatistics'),
      //   name: 'flowStatistics',
      //   meta: {
      //     perms: ['GET /admin/serial/list', 'GET /admin/serial/read', 'GET /admin/serial/remark'],
      //     title: '流水统计',
      //     noCache: true
      //   }
      }
    ]
  },

  // {
  //   path: '/myBusiness',
  //   component: Layout,
  //   redirect: 'noredirect',
  //   alwaysShow: true,
  //   name: 'myBusinessManage',
  //   meta: {
  //     title: '我的业务管理',
  //     icon: 'form'
  //   },
  //   children: [
  //     {
  //       path: 'myMallOrder',
  //       component: () => import('@/views/myBusiness/mallOrder'),
  //       name: 'myMallOrder',
  //       meta: {
  //         perms: ['GET /admin/myorder/list', 'GET /admin/myorder/read', 'POST /admin/myorder/ship', 'POST /admin/myorder/delivery'],
  //         title: '商城订单',
  //         noCache: true
  //       }
  //     },
  //     {
  //       path: 'myTicketOrder',
  //       component: () => import('@/views/myBusiness/ticketOrder'),
  //       name: 'myTicketOrder',
  //       meta: {
  //         perms: ['GET /admin/mytakeoutorder/list', 'GET /admin/mytakeoutorder/read', 'POST /admin/mytakeoutorder/ship', 'POST /admin/mytakeoutorder/delivery'],
  //         title: '外卖订单',
  //         noCache: true
  //       }
  //     },
  //     {
  //       path: 'myDeliveryOrder',
  //       component: () => import('@/views/myBusiness/deliveryOrder'),
  //       name: 'myDeliveryOrder',
  //       meta: {
  //         perms: ['GET /admin/mybuffetcouponorder/list', 'GET /admin/mybuffetcouponorder/read'],
  //         title: '券订单',
  //         noCache: true
  //       }
  //     }
  //   ]
  // },

  {
    path: '/platform',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'platformManage',
    meta: {
      title: '设置',
      icon: 'nested'
    },
    children: [
      {
        path: 'basicSet',
        component: () => import('@/views/platform/basicSet'),
        name: 'basicSet',
        meta: {
          perms: ['GET /admin/store/list', 'POST /admin/store/create', 'GET /admin/store/read', 'POST /admin/store/update', 'POST /admin/store/delete'],
          title: '基础配置',
          noCache: true
        }
      },
      {
        path: 'languageSet',
        component: () => import('@/views/platform/languageSet'),
        name: 'languageSet',
        meta: {
          perms: ['GET /admin/distribution/read', 'POST /admin/distribution/create'],
          title: '语言配置',
          noCache: true
        }
      },
      {
        path: 'currencySet',
        component: () => import('@/views/platform/currencySet'),
        name: 'currencySet',
        meta: {
          perms: ['GET /admin/buffetcoupon/rule/read', 'POST /admin/buffetcoupon/rule/create'],
          title: '货币配置',
          noCache: true
        }
      },
      {
        path: 'freightSet',
        component: () => import('@/views/platform/freightSet'),
        name: 'freightSet',
        meta: {
          perms: ['GET /admin/ad/list', 'POST /admin/ad/create', 'GET /admin/ad/read', 'POST /admin/ad/update', 'POST /admin/ad/delete'],
          title: '运费配置',
          noCache: true
        }
      },
      {
        path: 'paymentSet',
        component: () => import('@/views/platform/paymentSet'),
        name: 'paymentSet',
        meta: {
          perms: ['POST /admin/link/create', 'GET /admin/link/read'],
          title: '支付配置',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/sys',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'sysManage',
    meta: {
      title: '系统管理',
      icon: 'tree'
    },
    children: [
      {
        path: 'admin',
        component: () => import('@/views/sys/admin'),
        name: 'admin',
        meta: {
          perms: ['GET /admin/admin/list', 'POST /admin/admin/create', 'GET /admin/admin/read', 'POST /admin/admin/update', 'POST /admin/admin/delete', 'POST /admin/admin/status'],
          title: '管理员',
          noCache: true
        }
      },
      {
        path: 'role',
        component: () => import('@/views/sys/role'),
        name: 'role',
        meta: {
          perms: ['GET /admin/role/list', 'POST /admin/role/create', 'GET /admin/role/read', 'POST /admin/role/update', 'POST /admin/role/delete', 'GET /admin/role/permissions', 'POST /admin/role/permissions'],
          title: '角色管理',
          noCache: true
        }
      }
      // {
      //   path: 'os',
      //   component: () => import('@/views/sys/os'),
      //   name: 'os',
      //   meta: {
      //     perms: ['GET /admin/os/list', 'POST /admin/os/delete'],
      //     title: '对象存储',
      //     noCache: true
      //   }
      // }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    children: [
      {
        path: 'password',
        component: () => import('@/views/profile/password'),
        name: 'password',
        meta: { title: '修改密码', noCache: true }
      }
    ],
    hidden: true
  },

  { path: '*', redirect: '/404', hidden: true }
]
