import { useState, useEffect } from 'react'
import { Settings, Palette, Layers, Sun, Moon, Save, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRuleStore } from '@/store/ruleStore'
import type { GlobalSettings, PositionConfig } from '@/types'

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

const defaultSettings: GlobalSettings = {
  maskColor: '#000000',
  maskOpacity: 0.5,
  maskBlur: 0,
  maskCloseOnClick: true,
  defaultPosition: {
    vertical: 'center',
    horizontal: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  defaultAnimation: 'fade',
  defaultWidth: 400,
  defaultHeight: 'auto',
  defaultBorderRadius: 8,
  theme: 'dark',
  accentColor: '#00D4AA',
}

export default function SettingsPage() {
  const { settings, fetchSettings, updateSettings } = useRuleStore()
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(defaultSettings)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const updateField = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      return newSettings
    })
    setHasChanges(true)
  }

  const updatePosition = (vertical: PositionConfig['vertical'], horizontal: PositionConfig['horizontal']) => {
    setLocalSettings(prev => ({
      ...prev,
      defaultPosition: {
        ...prev.defaultPosition,
        vertical,
        horizontal,
      },
    }))
    setHasChanges(true)
  }

  const updatePositionOffset = (key: 'offsetX' | 'offsetY', value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      defaultPosition: {
        ...prev.defaultPosition,
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    await updateSettings(localSettings)
    setHasChanges(false)
  }

  const maskStyle = {
    backgroundColor: localSettings.maskColor,
    opacity: localSettings.maskOpacity,
    backdropFilter: `blur(${localSettings.maskBlur}px)`,
    WebkitBackdropFilter: `blur(${localSettings.maskBlur}px)`,
  }

  const getPositionClasses = () => {
    const { vertical, horizontal } = localSettings.defaultPosition
    return cn(
      'absolute z-10',
      vertical === 'top' && 'top-8',
      vertical === 'center' && 'top-1/2 -translate-y-1/2',
      vertical === 'bottom' && 'bottom-8',
      horizontal === 'left' && 'left-8',
      horizontal === 'center' && 'left-1/2 -translate-x-1/2',
      horizontal === 'right' && 'right-8'
    )
  }

  const getAnimationClass = () => {
    switch (localSettings.defaultAnimation) {
      case 'fade':
        return 'animate-fade-in'
      case 'slide':
        if (localSettings.defaultPosition.horizontal === 'right') return 'animate-slide-in-right'
        if (localSettings.defaultPosition.horizontal === 'left') return 'animate-slide-in-left'
        if (localSettings.defaultPosition.vertical === 'top') return 'animate-slide-in-top'
        if (localSettings.defaultPosition.vertical === 'bottom') return 'animate-slide-in-bottom'
        return 'animate-fade-in'
      case 'scale':
        return 'animate-scale-in'
      case 'spring':
        return 'animate-spring-in'
      default:
        return 'animate-fade-in'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">全局设置</h1>
          <p className="text-sm text-industrial-text-secondary mt-1">
            配置弹窗的默认参数和主题
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-accent-amber">有未保存的更改</span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={cn(
              'px-4 py-2 font-medium rounded-md transition-colors flex items-center gap-2',
              hasChanges
                ? 'bg-accent-teal text-industrial-bg hover:bg-accent-teal-hover'
                : 'bg-industrial-border text-industrial-text-muted cursor-not-allowed'
            )}
          >
            <Save className="w-5 h-5" />
            保存设置
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 左侧设置区 */}
        <div className="col-span-8 space-y-4 overflow-y-auto">
          {/* 遮罩样式 */}
          <div className="bg-industrial-card border border-industrial-border rounded-md p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-accent-blue/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-industrial-text-primary">
                  遮罩样式
                </h2>
                <p className="text-xs text-industrial-text-muted">
                  配置弹窗背景遮罩的外观
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  遮罩颜色
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={localSettings.maskColor}
                    onChange={(e) => updateField('maskColor', e.target.value)}
                    className="w-12 h-10 rounded-md border border-industrial-border bg-industrial-bg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localSettings.maskColor}
                    onChange={(e) => updateField('maskColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                  <div
                    className="w-12 h-10 rounded-md border border-industrial-border"
                    style={{ backgroundColor: localSettings.maskColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  透明度: {localSettings.maskOpacity}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={localSettings.maskOpacity}
                  onChange={(e) => updateField('maskOpacity', Number(e.target.value))}
                  className="w-full accent-accent-teal"
                />
                <div className="flex justify-between text-xs text-industrial-text-muted mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  模糊度: {localSettings.maskBlur}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={localSettings.maskBlur}
                  onChange={(e) => updateField('maskBlur', Number(e.target.value))}
                  className="w-full accent-accent-teal"
                />
                <div className="flex justify-between text-xs text-industrial-text-muted mt-1">
                  <span>0px</span>
                  <span>10px</span>
                  <span>20px</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.maskCloseOnClick}
                    onChange={(e) => updateField('maskCloseOnClick', e.target.checked)}
                    className="w-5 h-5 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm text-industrial-text-primary">
                      点击遮罩关闭
                    </span>
                    <p className="text-xs text-industrial-text-muted">
                      启用后，点击遮罩区域会关闭弹窗
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 弹窗默认值 */}
          <div className="bg-industrial-card border border-industrial-border rounded-md p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-accent-teal/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-accent-teal" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-industrial-text-primary">
                  弹窗默认值
                </h2>
                <p className="text-xs text-industrial-text-muted">
                  新建规则时的默认参数
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  默认位置
                </label>
                <div className="grid grid-cols-3 gap-2 w-48">
                  {positionGrid.map((pos) => (
                    <button
                      key={`${pos.vertical}-${pos.horizontal}`}
                      onClick={() => updatePosition(pos.vertical, pos.horizontal)}
                      className={cn(
                        'py-2 px-1 rounded border-2 text-xs font-medium transition-all',
                        localSettings.defaultPosition.vertical === pos.vertical &&
                        localSettings.defaultPosition.horizontal === pos.horizontal
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
                    value={localSettings.defaultPosition.offsetX}
                    onChange={(e) => updatePositionOffset('offsetX', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    垂直偏移 (px)
                  </label>
                  <input
                    type="number"
                    value={localSettings.defaultPosition.offsetY}
                    onChange={(e) => updatePositionOffset('offsetY', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  默认动画
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {animationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField('defaultAnimation', opt.value as GlobalSettings['defaultAnimation'])}
                      className={cn(
                        'py-2 px-3 rounded border-2 text-xs font-medium transition-all',
                        localSettings.defaultAnimation === opt.value
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
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  默认关闭方式
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="w-4 h-4 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-sm text-industrial-text-primary">显示关闭按钮</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.maskCloseOnClick}
                      onChange={(e) => updateField('maskCloseOnClick', e.target.checked)}
                      className="w-4 h-4 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-sm text-industrial-text-primary">点击遮罩关闭</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="w-4 h-4 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-sm text-industrial-text-primary">ESC 键关闭</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    默认宽度 (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={localSettings.defaultWidth}
                    onChange={(e) => updateField('defaultWidth', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    默认高度
                  </label>
                  <input
                    type="text"
                    value={localSettings.defaultHeight === 'auto' ? 'auto' : localSettings.defaultHeight}
                    onChange={(e) => {
                      const val = e.target.value
                      updateField('defaultHeight', val === 'auto' ? 'auto' : Number(val))
                    }}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                    圆角 (px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={localSettings.defaultBorderRadius}
                    onChange={(e) => updateField('defaultBorderRadius', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 主题配置 */}
          <div className="bg-industrial-card border border-industrial-border rounded-md p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-accent-amber/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent-amber" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-industrial-text-primary">
                  主题配置
                </h2>
                <p className="text-xs text-industrial-text-muted">
                  自定义界面外观
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-2">
                  主色调
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={localSettings.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="w-12 h-10 rounded-md border border-industrial-border bg-industrial-bg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localSettings.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    {['#00D4AA', '#58A6FF', '#FFAB00', '#F85149', '#A371F7'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateField('accentColor', color)}
                        className={cn(
                          'w-8 h-8 rounded-md border-2 transition-all',
                          localSettings.accentColor === color
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-text-primary mb-3">
                  主题模式
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateField('theme', 'light')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 transition-all',
                      localSettings.theme === 'light'
                        ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                        : 'border-industrial-border bg-industrial-bg text-industrial-text-secondary hover:border-industrial-border-light'
                    )}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">亮色</span>
                  </button>
                  <button
                    onClick={() => updateField('theme', 'dark')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 transition-all',
                      localSettings.theme === 'dark'
                        ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                        : 'border-industrial-border bg-industrial-bg text-industrial-text-secondary hover:border-industrial-border-light'
                    )}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">暗色</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧预览区 */}
        <div className="col-span-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-industrial-text-primary flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent-teal" />
              实时预览
            </h2>
            <button
              onClick={() => setPreviewVisible(!previewVisible)}
              className="text-xs px-3 py-1.5 bg-industrial-border text-industrial-text-primary rounded-md hover:bg-industrial-border-light transition-colors"
            >
              {previewVisible ? '隐藏' : '显示'}预览
            </button>
          </div>

          <div className="flex-1 bg-industrial-card border border-industrial-border rounded-md overflow-hidden relative">
            {/* 模拟浏览器 */}
            <div className="h-8 bg-industrial-bg border-b border-industrial-border flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-red" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-teal" />
            </div>

            {/* 预览内容区 */}
            <div 
              className="relative h-[calc(100%-32px)] overflow-hidden"
              style={{
                backgroundColor: localSettings.theme === 'dark' ? '#0D1117' : '#ffffff',
              }}
            >
              {/* 模拟内容 */}
              <div className="p-4 space-y-3">
                <div 
                  className="h-4 w-3/4 rounded"
                  style={{ backgroundColor: localSettings.theme === 'dark' ? '#30363D' : '#e5e7eb' }}
                />
                <div 
                  className="h-3 w-1/2 rounded"
                  style={{ backgroundColor: localSettings.theme === 'dark' ? '#21262d' : '#f3f4f6' }}
                />
                <div 
                  className="h-3 w-2/3 rounded"
                  style={{ backgroundColor: localSettings.theme === 'dark' ? '#21262d' : '#f3f4f6' }}
                />
                <div 
                  className="h-20 w-full rounded mt-4"
                  style={{ backgroundColor: localSettings.theme === 'dark' ? '#161B22' : '#f9fafb' }}
                />
              </div>

              {/* 预览弹窗 */}
              {previewVisible && (
                <>
                  <div
                    className="absolute inset-0 animate-fade-in"
                    style={maskStyle}
                    onClick={() => localSettings.maskCloseOnClick && setPreviewVisible(false)}
                  />
                  <div className={getPositionClasses()}>
                    <div
                      className={cn(
                        'relative shadow-2xl border',
                        getAnimationClass()
                      )}
                      style={{
                        width: `${Math.min(localSettings.defaultWidth * 0.6, 240)}px`,
                        borderRadius: `${localSettings.defaultBorderRadius}px`,
                        backgroundColor: localSettings.theme === 'dark' ? '#161B22' : '#ffffff',
                        borderColor: localSettings.theme === 'dark' ? '#30363D' : '#e5e7eb',
                      }}
                    >
                      <button
                        onClick={() => setPreviewVisible(false)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded hover:bg-industrial-border/50 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: localSettings.theme === 'dark' ? '#8B949E' : '#6b7280' }} />
                      </button>

                      <div className="p-4">
                        <h3 
                          className="text-sm font-semibold mb-2"
                          style={{ color: localSettings.theme === 'dark' ? '#E6EDF3' : '#111827' }}
                        >
                          预览弹窗
                        </h3>
                        <p 
                          className="text-xs mb-3"
                          style={{ color: localSettings.theme === 'dark' ? '#8B949E' : '#6b7280' }}
                        >
                          这是一个预览示例
                        </p>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded"
                            style={{
                              backgroundColor: localSettings.accentColor,
                              color: '#0D1117',
                            }}
                          >
                            确定
                          </button>
                          <button
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded"
                            style={{
                              backgroundColor: localSettings.theme === 'dark' ? '#30363D' : '#e5e7eb',
                              color: localSettings.theme === 'dark' ? '#E6EDF3' : '#374151',
                            }}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 提示 */}
          <div className="mt-4 p-3 bg-industrial-card border border-industrial-border rounded-md">
            <p className="text-xs text-industrial-text-muted">
              提示：点击"显示预览"按钮查看弹窗效果。调整左侧设置将实时反映在预览中。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
