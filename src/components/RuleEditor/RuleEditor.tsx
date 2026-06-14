import { useState, useEffect } from 'react'
import { X, Clock, MousePointer, Timer, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PopupRule, TriggerType, PositionConfig } from '@/types'

interface RuleEditorProps {
  open: boolean
  onClose: () => void
  rule?: PopupRule | null
  onSave: (rule: Partial<PopupRule>) => void
}

const defaultRule: Partial<PopupRule> = {
  name: '',
  enabled: true,
  trigger: {
    type: 'page_load',
    delay: 0,
    dwellTime: 3,
    timerInterval: 10,
    clickSelector: '',
  },
  position: {
    vertical: 'center',
    horizontal: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  close: {
    button: true,
    mask: true,
    timeout: 0,
    escape: true,
  },
  style: {
    width: 400,
    height: 'auto',
    borderRadius: 8,
    animation: 'fade',
    maskColor: '#000000',
    maskOpacity: 0.5,
    maskBlur: 0,
  },
  content: {
    title: '',
    body: '',
    imageUrl: '',
    confirmText: '确定',
    cancelText: '取消',
  },
}

const triggerOptions: { value: TriggerType; label: string; icon: typeof Play }[] = [
  { value: 'page_load', label: '页面加载', icon: Play },
  { value: 'click', label: '点击触发', icon: MousePointer },
  { value: 'dwell', label: '停留触发', icon: Clock },
  { value: 'timer', label: '定时循环', icon: Timer },
]

const positionGrid: Array<{
  vertical: PositionConfig['vertical']
  horizontal: PositionConfig['horizontal']
  label: string
}> = [
  { vertical: 'top', horizontal: 'left', label: '左上' },
  { vertical: 'top', horizontal: 'center', label: '中上' },
  { vertical: 'top', horizontal: 'right', label: '右上' },
  { vertical: 'center', horizontal: 'left', label: '左中' },
  { vertical: 'center', horizontal: 'center', label: '居中' },
  { vertical: 'center', horizontal: 'right', label: '右中' },
  { vertical: 'bottom', horizontal: 'left', label: '左下' },
  { vertical: 'bottom', horizontal: 'center', label: '中下' },
  { vertical: 'bottom', horizontal: 'right', label: '右下' },
]

const animationOptions = [
  { value: 'fade', label: '淡入淡出' },
  { value: 'slide', label: '滑入滑出' },
  { value: 'scale', label: '缩放' },
  { value: 'spring', label: '弹簧' },
]

export default function RuleEditor({ open, onClose, rule, onSave }: RuleEditorProps) {
  const [formData, setFormData] = useState<Partial<PopupRule>>(defaultRule)
  const [activeTab, setActiveTab] = useState<'trigger' | 'position' | 'close' | 'content' | 'style'>('trigger')

  useEffect(() => {
    if (rule) {
      setFormData(rule)
    } else {
      setFormData(defaultRule)
    }
  }, [rule, open])

  const handleSubmit = () => {
    onSave(formData)
    onClose()
  }

  const updateField = <K extends keyof PopupRule>(key: K, value: PopupRule[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updateNested = <
    T extends 'trigger' | 'position' | 'close' | 'style' | 'content',
    K extends keyof PopupRule[T]
  >(
    section: T,
    key: K,
    value: PopupRule[T][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  if (!open) return null

  const tabs = [
    { id: 'trigger', label: '触发时机' },
    { id: 'position', label: '弹窗位置' },
    { id: 'close', label: '关闭逻辑' },
    { id: 'content', label: '弹窗内容' },
    { id: 'style', label: '样式设置' },
  ] as const

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-[500px] bg-industrial-card border-l border-industrial-border animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between h-16 px-6 border-b border-industrial-border">
          <h2 className="text-lg font-semibold">
            {rule ? '编辑规则' : '新建规则'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-industrial-text-secondary hover:text-industrial-text-primary hover:bg-industrial-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-industrial-border px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'text-accent-teal border-accent-teal'
                  : 'text-industrial-text-secondary border-transparent hover:text-industrial-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-industrial-text-primary mb-2">
              规则名称
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="输入规则名称"
              className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            />
          </div>

          {activeTab === 'trigger' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {triggerOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateNested('trigger', 'type', option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                        formData.trigger?.type === option.value
                          ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                          : 'border-industrial-border bg-industrial-bg text-industrial-text-secondary hover:border-industrial-border-light'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  延迟时间 (秒)
                </label>
                <input
                  type="number"
                  value={formData.trigger?.delay ?? 0}
                  onChange={(e) => updateNested('trigger', 'delay', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                />
              </div>

              {formData.trigger?.type === 'dwell' && (
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    停留时长 (秒)
                  </label>
                  <input
                    type="number"
                    value={formData.trigger.dwellTime ?? 3}
                    onChange={(e) => updateNested('trigger', 'dwellTime', Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
              )}

              {formData.trigger?.type === 'timer' && (
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    循环间隔 (秒)
                  </label>
                  <input
                    type="number"
                    value={formData.trigger.timerInterval ?? 10}
                    onChange={(e) => updateNested('trigger', 'timerInterval', Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
              )}

              {formData.trigger?.type === 'click' && (
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    点击选择器
                  </label>
                  <input
                    type="text"
                    value={formData.trigger.clickSelector ?? ''}
                    onChange={(e) => updateNested('trigger', 'clickSelector', e.target.value)}
                    placeholder=".btn, #trigger"
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'position' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  弹窗位置
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {positionGrid.map((pos) => (
                    <button
                      key={`${pos.vertical}-${pos.horizontal}`}
                      onClick={() => {
                        updateNested('position', 'vertical', pos.vertical)
                        updateNested('position', 'horizontal', pos.horizontal)
                      }}
                      className={cn(
                        'py-3 px-2 rounded-md border-2 text-sm font-medium transition-all',
                        formData.position?.vertical === pos.vertical &&
                        formData.position?.horizontal === pos.horizontal
                          ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                          : 'border-industrial-border bg-industrial-bg text-industrial-text-secondary hover:border-industrial-border-light'
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    水平偏移 (px)
                  </label>
                  <input
                    type="number"
                    value={formData.position?.offsetX ?? 0}
                    onChange={(e) => updateNested('position', 'offsetX', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    垂直偏移 (px)
                  </label>
                  <input
                    type="number"
                    value={formData.position?.offsetY ?? 0}
                    onChange={(e) => updateNested('position', 'offsetY', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'close' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.close?.button ?? true}
                    onChange={(e) => updateNested('close', 'button', e.target.checked)}
                    className="w-5 h-5 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                  />
                  <span className="text-sm text-industrial-text-primary">显示关闭按钮</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.close?.mask ?? true}
                    onChange={(e) => updateNested('close', 'mask', e.target.checked)}
                    className="w-5 h-5 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                  />
                  <span className="text-sm text-industrial-text-primary">点击遮罩关闭</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.close?.escape ?? true}
                    onChange={(e) => updateNested('close', 'escape', e.target.checked)}
                    className="w-5 h-5 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                  />
                  <span className="text-sm text-industrial-text-primary">ESC 键关闭</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  自动关闭时间 (秒，0为不自动关闭)
                </label>
                <input
                  type="number"
                  value={formData.close?.timeout ?? 0}
                  onChange={(e) => updateNested('close', 'timeout', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.content?.title || ''}
                  onChange={(e) => updateNested('content', 'title', e.target.value)}
                  placeholder="弹窗标题"
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  内容
                </label>
                <textarea
                  value={formData.content?.body || ''}
                  onChange={(e) => updateNested('content', 'body', e.target.value)}
                  placeholder="弹窗内容..."
                  rows={4}
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  图片 URL
                </label>
                <input
                  type="text"
                  value={formData.content?.imageUrl || ''}
                  onChange={(e) => updateNested('content', 'imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    确认按钮文字
                  </label>
                  <input
                    type="text"
                    value={formData.content?.confirmText || ''}
                    onChange={(e) => updateNested('content', 'confirmText', e.target.value)}
                    placeholder="确定"
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    取消按钮文字
                  </label>
                  <input
                    type="text"
                    value={formData.content?.cancelText || ''}
                    onChange={(e) => updateNested('content', 'cancelText', e.target.value)}
                    placeholder="取消"
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary placeholder-industrial-text-muted focus:outline-none focus:border-accent-teal transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    value={formData.style?.width ?? 400}
                    onChange={(e) => updateNested('style', 'width', Number(e.target.value))}
                    min={100}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    高度 (px)
                  </label>
                  <input
                    type="text"
                    value={formData.style?.height === 'auto' ? 'auto' : formData.style?.height ?? 'auto'}
                    onChange={(e) => {
                      const val = e.target.value
                      updateNested('style', 'height', val === 'auto' ? 'auto' : Number(val))
                    }}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  圆角 (px)
                </label>
                <input
                  type="number"
                  value={formData.style?.borderRadius ?? 8}
                  onChange={(e) => updateNested('style', 'borderRadius', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  动画效果
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {animationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateNested('style', 'animation', opt.value as PopupRule['style']['animation'])}
                      className={cn(
                        'py-2 px-3 rounded-md border-2 text-sm font-medium transition-all',
                        formData.style?.animation === opt.value
                          ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                          : 'border-industrial-border bg-industrial-bg text-industrial-text-secondary hover:border-industrial-border-light'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  遮罩颜色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.style?.maskColor || '#000000'}
                    onChange={(e) => updateNested('style', 'maskColor', e.target.value)}
                    className="w-12 h-10 rounded-md border border-industrial-border bg-industrial-bg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.style?.maskColor || '#000000'}
                    onChange={(e) => updateNested('style', 'maskColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  遮罩透明度: {formData.style?.maskOpacity ?? 0.5}
                </label>
                <input
                  type="range"
                  value={formData.style?.maskOpacity ?? 0.5}
                  onChange={(e) => updateNested('style', 'maskOpacity', Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full accent-accent-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  遮罩模糊: {formData.style?.maskBlur ?? 0}px
                </label>
                <input
                  type="range"
                  value={formData.style?.maskBlur ?? 0}
                  onChange={(e) => updateNested('style', 'maskBlur', Number(e.target.value))}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full accent-accent-teal"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-industrial-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-industrial-border text-industrial-text-primary font-medium rounded-md hover:bg-industrial-border-light transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-accent-teal text-industrial-bg font-medium rounded-md hover:bg-accent-teal-hover transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
