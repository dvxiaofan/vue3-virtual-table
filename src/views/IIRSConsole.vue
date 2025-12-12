<template>
  <div class="iirs-console">
    <!-- 顶部导航栏 -->
    <header class="global-header">
      <div class="gh-left">
        <div class="menu-trigger" @click="toggleMegaMenu">
          <span class="trigger-icon">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
        <div class="system-logo">
          <span class="logo-icon"></span>
          湖北省一体化智能数字资源管理系统
        </div>
      </div>
      <div class="gh-right">
        <a href="#" class="order-center-link">
          <span>📋</span> 订单中心
        </a>
        <div class="icon-btn">
          🔔
          <span class="badge-dot"></span>
        </div>
        <div class="user-profile">
          <div class="avatar">胡</div>
          <span>胡强 (省发改委)</span>
        </div>
      </div>
    </header>

    <!-- Mega Menu -->
    <div class="mega-menu-overlay" :class="{ active: megaMenuVisible }" @click="closeMegaMenu">
      <div class="mega-menu-content" @click.stop>
        <div class="mm-grid">
          <div
            v-for="item in megaMenuItems"
            :key="item.title"
            class="mm-card"
            :class="{ active: item.active }"
            @click="item.active && toggleMegaMenu()"
          >
            <div class="mm-icon">{{ item.icon }}</div>
            <div class="mm-title">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主布局 -->
    <div class="layout-container">
      <!-- 左侧边栏 -->
      <aside class="context-sidebar">
        <div class="cs-title">公共组件资源</div>
        <div
          v-for="item in sidebarItems"
          :key="item.label"
          class="cs-item"
          :class="{ active: item.active }"
        >
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="content-area">
        <div class="page">
          <!-- 面包屑 -->
          <div class="breadcrumb">
            <span>公共组件资源</span>
            <span>服务目录</span>
          </div>

          <!-- 标题卡片 -->
          <div class="header-card">
            <div class="header-card-inner">
              <div class="header-title">公共组件服务目录</div>
              <div class="header-desc">
                汇聚全省统建共享的公共能力组件，提供统一身份认证、电子印章、支付平台等标准服务接口。<br>
                通过标准化接入，避免重复建设，降低系统集成难度，实现业务应用快速上线。
              </div>
            </div>
            <div class="header-decoration"></div>
          </div>

          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="tabs">
              <div
                v-for="tab in tabs"
                :key="tab"
                class="tab-btn"
                :class="{ active: activeTab === tab }"
                @click="activeTab = tab"
              >
                {{ tab }}
              </div>
            </div>
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchKeyword"
                type="text"
                class="search-input"
                placeholder="搜索组件名称 / 服务标识"
              >
            </div>
          </div>

          <!-- 卡片网格 -->
          <div class="grid">
            <div v-for="card in filteredCards" :key="card.title" class="card">
              <div class="card-top">
                <div class="card-badge" :class="getBadgeClass(card.badgeType)">
                  {{ card.badge }}
                </div>
                <div class="comp-icon">{{ card.icon }}</div>
                <div class="card-title">{{ card.title }}</div>
                <div class="card-sub">{{ card.description }}</div>
              </div>
              <div class="card-body">
                <div class="spec-list">
                  <div class="spec-row">
                    <span class="spec-label">服务提供商</span>
                    <span class="spec-val">{{ card.provider }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">接入方式</span>
                    <span class="spec-val">{{ card.accessMethod }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">调用限制</span>
                    <span class="spec-val">{{ card.limit }}</span>
                  </div>
                </div>
                <div class="scene-tags">
                  <span v-for="tag in card.tags" :key="tag" class="scene-tag">{{ tag }}</span>
                </div>
                <div class="price-row">
                  <span class="spec-row">{{ card.priceLabel }}</span>
                  <span class="price-tag" :class="card.isFree ? 'price-free' : 'price-paid'">
                    {{ card.price }}
                  </span>
                </div>
              </div>
              <div class="card-actions">
                <button class="btn btn-sub">接入指南</button>
                <button class="btn btn-main">申请接入</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Mega Menu 状态
const megaMenuVisible = ref(false)

const toggleMegaMenu = () => {
  megaMenuVisible.value = !megaMenuVisible.value
}

const closeMegaMenu = () => {
  megaMenuVisible.value = false
}

// Mega Menu 数据
const megaMenuItems = [
  { icon: '🖥️', title: '省级系统资源', active: false },
  { icon: '🏗️', title: '省级项目资源', active: false },
  { icon: '☁️', title: '省级云资源', active: false },
  { icon: '💾', title: '省级数据资源', active: false },
  { icon: '🧩', title: '信创适配资源', active: false },
  { icon: '🧠', title: '公共AI资源', active: false },
  { icon: '🧱', title: '公共组件资源', active: true },
  { icon: '💻', title: '代码资产管理', active: false },
  { icon: '🤝', title: 'ISV资源', active: false },
  { icon: '📊', title: '一屏统览', active: false }
]

// 左侧边栏数据
const sidebarItems = [
  { icon: '📊', label: '资源概览', active: false },
  { icon: '📦', label: '资源台账', active: false },
  { icon: '🛒', label: '服务目录', active: true }
]

// Tab 数据
const tabs = ['全部', '身份认证类', '业务应用类', '数据服务类', '基础支撑类']
const activeTab = ref('全部')

// 搜索关键词
const searchKeyword = ref('')

// 卡片数据
interface ServiceCard {
  title: string
  icon: string
  badge: string
  badgeType: 'api' | 'sdk' | 'saas'
  description: string
  provider: string
  accessMethod: string
  limit: string
  tags: string[]
  priceLabel: string
  price: string
  isFree: boolean
  category: string
}

const cards = ref<ServiceCard[]>([
  {
    title: '统一身份认证平台',
    icon: '🆔',
    badge: 'API / OIDC',
    badgeType: 'api',
    description: '全省统一的自然人与法人身份认证枢纽，支持扫码登录、人脸识别。',
    provider: '省数据局',
    accessMethod: 'API / OIDC',
    limit: '默认 200 QPS',
    tags: ['单点登录', '实名核验'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '身份认证类'
  },
  {
    title: '短信平台',
    icon: '📩',
    badge: 'API',
    badgeType: 'api',
    description: '提供高并发、高可用的短信发送能力，支持验证码、通知类短信。',
    provider: '省数据局',
    accessMethod: 'HTTP Restful API',
    limit: '按配额限制',
    tags: ['验证码', '政务通知'],
    priceLabel: '计费模式',
    price: '按量计费 (0.03元/条)',
    isFree: false,
    category: '基础支撑类'
  },
  {
    title: '公共信用平台',
    icon: '🏥',
    badge: 'API / 数据',
    badgeType: 'api',
    description: '查询企业及个人的公共信用评价、红黑名单等信用数据。',
    provider: '省数据局',
    accessMethod: 'API 数据接口',
    limit: '5000 次/天',
    tags: ['行政审批', '资格审查'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '数据服务类'
  },
  {
    title: '电子签章',
    icon: '✍️',
    badge: 'SDK / API',
    badgeType: 'sdk',
    description: '提供符合国密标准的电子印章制作、签章、验章服务。',
    provider: '省数据局',
    accessMethod: 'SDK / API',
    limit: '无限制',
    tags: ['公文流转', '证照生成'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '业务应用类'
  },
  {
    title: '电子证照',
    icon: '🪪',
    badge: 'API',
    badgeType: 'api',
    description: '全省电子证照库的统一检索与调用服务，支持亮证、证照文件下载。',
    provider: '省数据局',
    accessMethod: 'API 调用',
    limit: '需申请授权',
    tags: ['免证办', '一网通办'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '业务应用类'
  },
  {
    title: '统一支付平台',
    icon: '💳',
    badge: 'API',
    badgeType: 'api',
    description: '聚合微信、支付宝、银联等多种支付渠道，提供统一收银台。',
    provider: '省数据局',
    accessMethod: 'API 收银台',
    limit: '无限制',
    tags: ['非税缴费', '公共支付'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '业务应用类'
  },
  {
    title: '统一消息服务',
    icon: '🔔',
    badge: 'API / MQ',
    badgeType: 'api',
    description: '提供站内信、邮件、钉钉等多渠道消息推送能力，支持模板管理。',
    provider: '省数据局',
    accessMethod: 'API / MQ',
    limit: '100 QPS',
    tags: ['消息触达', '多端推送'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '基础支撑类'
  },
  {
    title: '统一文件存储',
    icon: '📂',
    badge: 'API / S3',
    badgeType: 'api',
    description: '提供非结构化数据的上传、下载、存储与分发服务，兼容 S3 协议。',
    provider: '省数据局',
    accessMethod: 'S3 API / HTTP',
    limit: '带宽 100Mbps',
    tags: ['云存储', '附件托管'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '基础支撑类'
  },
  {
    title: '统一地图服务',
    icon: '🗺️',
    badge: 'API / WMTS',
    badgeType: 'api',
    description: '提供全省矢量地图、影像地图、地名地址匹配及路径规划服务。',
    provider: '省数据局',
    accessMethod: 'WMTS / API',
    limit: '50000 次/天',
    tags: ['GIS服务', '位置服务'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '数据服务类'
  },
  {
    title: '统一流程引擎',
    icon: '⚙️',
    badge: 'API / BPMN',
    badgeType: 'api',
    description: '提供符合 BPMN 2.0 标准的工作流设计、运行与管理服务。',
    provider: '省数据局',
    accessMethod: 'REST API / 嵌入',
    limit: '并发 500 实例',
    tags: ['工作流', 'BPM'],
    priceLabel: '统建共享能力',
    price: '免费接入',
    isFree: true,
    category: '业务应用类'
  }
])

// 获取徽章样式类
const getBadgeClass = (type: string) => {
  const classMap: Record<string, string> = {
    api: 'badge-api',
    sdk: 'badge-sdk',
    saas: 'badge-saas'
  }
  return classMap[type] || 'badge-api'
}

// 过滤后的卡片
const filteredCards = computed(() => {
  return cards.value.filter(card => {
    const matchTab = activeTab.value === '全部' || card.category === activeTab.value
    const matchSearch = !searchKeyword.value ||
      card.title.includes(searchKeyword.value) ||
      card.description.includes(searchKeyword.value)
    return matchTab && matchSearch
  })
})
</script>

<style scoped>
:root {
  --primary: #1677ff;
  --header-height: 60px;
  --sidebar-width: 220px;
  --bg-body: #f5f7fa;
  --border: #e8e8e8;
  --text-main: #333;
  --text-sub: #666;
}

.iirs-console {
  min-height: 100vh;
  background: var(--bg-body);
  color: var(--text-main);
}

/* ========= 1. 顶部导航栏 ========= */
.global-header {
  height: var(--header-height);
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.gh-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-trigger {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: var(--primary);
  transition: background 0.2s;
}

.menu-trigger:hover {
  background: #f0f7ff;
}

.trigger-icon {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  width: 18px;
  height: 18px;
}

.trigger-icon .dot {
  width: 4px;
  height: 4px;
  background: #1677ff;
  border-radius: 1px;
}

.system-logo {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  border-radius: 4px;
}

.gh-right {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
}

.order-center-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.order-center-link:hover {
  background: #f5f5f5;
  color: var(--primary);
}

.icon-btn {
  font-size: 18px;
  color: #555;
  cursor: pointer;
  position: relative;
}

.badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

/* ========= 2. Mega Menu ========= */
.mega-menu-overlay {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 900;
  display: none;
}

.mega-menu-overlay.active {
  display: block;
}

.mega-menu-content {
  background: #fff;
  width: 680px;
  height: 100%;
  padding: 24px;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.mm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mm-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mm-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.1);
}

.mm-card.active {
  background: #e6f7ff;
  border-color: var(--primary);
}

.mm-icon {
  font-size: 24px;
  color: #555;
}

.mm-card.active .mm-icon {
  color: var(--primary);
}

.mm-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

/* ========= 3. 布局 ========= */
.layout-container {
  display: flex;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
}

.context-sidebar {
  width: var(--sidebar-width);
  background: #fff;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  padding-top: 20px;
}

.cs-title {
  font-size: 13px;
  color: #999;
  padding: 0 20px 12px;
  font-weight: 500;
}

.cs-item {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  cursor: pointer;
  border-left: 3px solid transparent;
  font-size: 14px;
  transition: all 0.2s;
}

.cs-item:hover {
  background: #f5f7fa;
}

.cs-item.active {
  background: #1677ff;
  color: #fff;
  border-left-color: #1677ff;
  font-weight: 500;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-x: hidden;
}

/* ========= 4. 目录页样式 ========= */
.page {
  max-width: 1280px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.breadcrumb span + span::before {
  content: "›";
  margin: 0 6px;
  color: #d1d5db;
  font-size: 14px;
}

.header-card {
  background: linear-gradient(135deg, #0958d9 0%, #4096ff 100%);
  color: #fff;
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px rgba(22, 119, 255, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-card-inner {
  text-align: center;
  position: relative;
  z-index: 1;
}

.header-decoration {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  pointer-events: none;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.header-desc {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.8;
  max-width: 700px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.tabs {
  display: flex;
  gap: 12px;
}

.tab-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  color: #6b7280;
  background: transparent;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.tab-btn:hover {
  color: #2563eb;
}

.tab-btn.active {
  background: #fff;
  color: #2563eb;
  font-weight: 500;
  border: 1px solid #2563eb;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 10px 16px 10px 40px;
  border-radius: 8px;
  border: none;
  background: #374151;
  color: #fff;
  font-size: 14px;
  width: 260px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background: #1f2937;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* 卡片网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 组件卡片设计 */
.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #dbeafe;
}

.card-top {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  text-align: center;
}

.card-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
}

/* 不同类型的标签颜色 */
.badge-api {
  background: #e6f7ff;
  color: #1677ff;
  border: 1px solid #bae7ff;
}

.badge-sdk {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.badge-saas {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.comp-icon {
  width: 56px;
  height: 56px;
  background: #f8fafc;
  color: #333;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
  border: 1px solid #f0f0f0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-sub {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  min-height: 42px;
}

.card-body {
  padding: 20px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.spec-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #374151;
}

.spec-label {
  width: 72px;
  color: #9ca3af;
  flex-shrink: 0;
}

.spec-val {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.scene-tag {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 4px;
}

/* 费用行 */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.price-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 4px;
}

.price-free {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.price-paid {
  background: #fffbe6;
  color: #fa8c16;
  border: 1px solid #ffe58f;
}

.card-actions {
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  font-weight: 500;
  border: 1px solid transparent;
}

.btn-main {
  background: #1677ff;
  color: #fff;
}

.btn-main:hover {
  background: #0958d9;
}

.btn-sub {
  background: #fff;
  border-color: #d9d9d9;
  color: #374151;
}

.btn-sub:hover {
  border-color: #1677ff;
  color: #1677ff;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
