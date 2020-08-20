import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Icon,
  Message,
  Header,
  Container,
  Aside,
  Main,
  MenuItem,
  Submenu,
  Menu,
  Breadcrumb,
  BreadcrumbItem,
  Row,
  Col,
  Card,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane,
  Steps,
  Step,
  CheckboxGroup,
  Checkbox,
  Upload
} from 'element-ui'

import timeline from './timeline/index.js'
import timelineItem from './timeline-item/index.js'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Icon)
Vue.use(Button)
Vue.use(Header)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(Menu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Upload)
Vue.use(timeline)
Vue.use(timelineItem)
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$message = Message
