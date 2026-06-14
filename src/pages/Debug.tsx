import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, MousePointer, Clock, Timer, Trash2, Zap, Smartphone, Monitor, ChevronRight, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRuleStore } from '@/store/ruleStore'
import PopupRenderer from '@/components/Popup/PopupRenderer'
import type { PopupRule, TriggerType, TriggerLog } from '@/types'

interface ActivePopup {
  id: string
  rule: PopupRule
}

export default function Debug() {
  const { rules, fetchRules, showPopup, hidePopup, popup, addLog, clearLogs, logs } = useRuleStore()
  const [activePopups, setActivePopups] = useState<ActivePopup[]>([])
  const [dwellTime, setDwellTime] = useState(3)
  const [timerInterval, setTimerInterval] = useState(10)
  const [cycleRuleIds, setCycleRuleIds] = useState<string[]>([])
  const [cycleInterval, setCycleInterval] = useState(3)
  const [cycleRunning, setCycleRunning] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const cycleTimerRef = useRef<number | null>(null)
  const cycleIndexRef = useRef(0)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const triggerPopup = useCallback((rule: PopupRule, triggerType: TriggerType) => {
    const popupId = `popup-${Date.now()}-${Math.random()}`
    setActivePopups(prev => [...prev, { id: popupId, rule }])
    showPopup(rule)

    const log: TriggerLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      triggerType,
      action: 'show',
      timestamp: Date.now(),
      details: `触发弹窗显示`,
    }
    addLog(log)

    if (rule.close.timeout && rule.close.timeout > 0) {
      setTimeout(() => {
        setActivePopups(prev => prev.filter(p => p.id !== popupId))
        hidePopup()
        const closeLog: TriggerLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          triggerType,
          action: 'close',
          timestamp: Date.now(),
          details: `自动关闭弹窗`,
        }
        addLog(closeLog)
      }, rule.close.timeout * 1000)
    }
  }, [addLog, hidePopup, showPopup])

  const handlePageLoad = useCallback(() => {
    setPulseAnimation('page_load')
    setTimeout(() => setPulseAnimation(null), 500)
    
    const pageLoadRules = rules.filter(r => r.enabled && r.trigger.type === 'page_load')
    if (pageLoadRules.length === 0) {
      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'none',
        ruleName: '无匹配规则',
        triggerType: 'page_load',
        action: 'show',
        timestamp: Date.now(),
        details: '没有启用的页面加载规则',
      }
      addLog(log)
      return
    }

    pageLoadRules.forEach((rule, index) => {
      const delay = (rule.trigger.delay || 0) * 1000 + index * 100
      setTimeout(() => {
        triggerPopup(rule, 'page_load')
      }, delay)
    })
  }, [rules, triggerPopup, addLog])

  const handleClick = useCallback(() => {
    setPulseAnimation('click')
    setTimeout(() => setPulseAnimation(null), 500)
    
    const clickRules = rules.filter(r => r.enabled && r.trigger.type === 'click')
    if (clickRules.length === 0) {
      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'none',
        ruleName: '无匹配规则',
        triggerType: 'click',
        action: 'show',
        timestamp: Date.now(),
        details: '没有启用的点击触发规则',
      }
      addLog(log)
      return
    }

    clickRules.forEach((rule, index) => {
      const delay = (rule.trigger.delay || 0) * 1000 + index * 100
      setTimeout(() => {
        triggerPopup(rule, 'click')
      }, delay)
    })
  }, [rules, triggerPopup, addLog])

  const handleDwell = useCallback(() => {
    setPulseAnimation('dwell')
    setTimeout(() => setPulseAnimation(null), 500)
    
    const dwellRules = rules.filter(r => r.enabled && r.trigger.type === 'dwell')
    if (dwellRules.length === 0) {
      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'none',
        ruleName: '无匹配规则',
        triggerType: 'dwell',
        action: 'show',
        timestamp: Date.now(),
        details: '没有启用的停留触发规则',
      }
      addLog(log)
      return
    }

    const log: TriggerLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      ruleId: 'dwell-start',
      ruleName: '停留计时开始',
      triggerType: 'dwell',
      action: 'show',
      timestamp: Date.now(),
      details: `停留 ${dwellTime} 秒后触发`,
    }
    addLog(log)

    dwellRules.forEach((rule, index) => {
      const delay = dwellTime * 1000 + (rule.trigger.delay || 0) * 1000 + index * 100
      setTimeout(() => {
        triggerPopup(rule, 'dwell')
      }, delay)
    })
  }, [rules, triggerPopup, addLog, dwellTime])

  const handleTimer = useCallback(() => {
    setPulseAnimation('timer')
    setTimeout(() => setPulseAnimation(null), 500)
    
    const timerRules = rules.filter(r => r.enabled && r.trigger.type === 'timer')
    if (timerRules.length === 0) {
      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'none',
        ruleName: '无匹配规则',
        triggerType: 'timer',
        action: 'show',
        timestamp: Date.now(),
        details: '没有启用的定时触发规则',
      }
      addLog(log)
      return
    }

    timerRules.forEach((rule, index) => {
      const delay = (rule.trigger.delay || 0) * 1000 + index * 100
      setTimeout(() => {
        triggerPopup(rule, 'timer')
      }, delay)
    })
  }, [rules, triggerPopup, addLog])

  const toggleCycle = useCallback(() => {
    if (cycleRunning) {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current)
        cycleTimerRef.current = null
      }
      setCycleRunning(false)
      cycleIndexRef.current = 0
      
      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'cycle',
        ruleName: '循环测试',
        triggerType: 'timer',
        action: 'close',
        timestamp: Date.now(),
        details: '循环测试已停止',
      }
      addLog(log)
    } else {
      if (cycleRuleIds.length === 0) {
        return
      }

      setCycleRunning(true)
      cycleIndexRef.current = 0

      const log: TriggerLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        ruleId: 'cycle',
        ruleName: '循环测试',
        triggerType: 'timer',
        action: 'show',
        timestamp: Date.now(),
        details: `循环测试开始，共 ${cycleRuleIds.length} 条规则，间隔 ${cycleInterval} 秒`,
      }
      addLog(log)

      const runCycle = () => {
        const ruleId = cycleRuleIds[cycleIndexRef.current]
        const rule = rules.find(r => r.id === ruleId)
        
        if (rule) {
          triggerPopup(rule, 'timer')
        }

        cycleIndexRef.current = (cycleIndexRef.current + 1) % cycleRuleIds.length
      }

      runCycle()
      cycleTimerRef.current = window.setInterval(runCycle, cycleInterval * 1000)
    }
  }, [cycleRunning, cycleRuleIds, cycleInterval, rules, triggerPopup, addLog])

  const handleClosePopup = useCallback((popupId: string) => {
    setActivePopups(prev => prev.filter(p => p.id !== popupId))
    hidePopup()
  }, [hidePopup])

  const toggleCycleRule = (ruleId: string) => {
    setCycleRuleIds(prev => 
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    )
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour12: false })
  }

  const triggerTypeColors: Record<TriggerType, string> = {
    page_load: 'bg-accent-blue',
    click: 'bg-accent-teal',
    dwell: 'bg-accent-amber',
    timer: 'bg-purple-500',
  }

  const triggerTypeLabels: Record<TriggerType, string> = {
    page_load: '页面加载',
    click: '点击触发',
    dwell: '停留触发',
    timer: '定时触发',
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">模拟调试</h1>
          <p className="text-sm text-industrial-text-secondary mt-1">
            测试弹窗触发和展示效果
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 左侧触发模拟器 */}
        <div className="col-span-3 bg-industrial-card border border-industrial-border rounded-md p-4 flex flex-col min-h-0 overflow-hidden">
          <h2 className="text-sm font-semibold text-industrial-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-teal" />
            触发模拟器
          </h2>

          <div className="space-y-3 mb-6">
            <button
              onClick={handlePageLoad}
              className={cn(
                'w-full flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all',
                'hover:border-accent-blue/50 hover:bg-accent-blue/5',
                pulseAnimation === 'page_load' && 'animate-pulse border-accent-blue bg-accent-blue/10',
                'border-industrial-border bg-industrial-bg'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                'bg-accent-blue/20 text-accent-blue'
              )}>
                <Play className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-industrial-text-primary">
                  页面加载
                </div>
                <div className="text-xs text-industrial-text-muted mt-0.5">
                  模拟页面加载事件
                </div>
              </div>
            </button>

            <button
              onClick={handleClick}
              className={cn(
                'w-full flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all',
                'hover:border-accent-teal/50 hover:bg-accent-teal/5',
                pulseAnimation === 'click' && 'animate-pulse border-accent-teal bg-accent-teal/10',
                'border-industrial-border bg-industrial-bg'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                'bg-accent-teal/20 text-accent-teal'
              )}>
                <MousePointer className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-industrial-text-primary">
                  元素点击
                </div>
                <div className="text-xs text-industrial-text-muted mt-0.5">
                  模拟点击事件
                </div>
              </div>
            </button>

            <button
              onClick={handleDwell}
              className={cn(
                'w-full flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all',
                'hover:border-accent-amber/50 hover:bg-accent-amber/5',
                pulseAnimation === 'dwell' && 'animate-pulse border-accent-amber bg-accent-amber/10',
                'border-industrial-border bg-industrial-bg'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                'bg-accent-amber/20 text-accent-amber'
              )}>
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-industrial-text-primary">
                  停留时间
                </div>
                <div className="text-xs text-industrial-text-muted mt-0.5">
                  模拟鼠标停留
                </div>
              </div>
            </button>

            <button
              onClick={handleTimer}
              className={cn(
                'w-full flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all',
                'hover:border-purple-500/50 hover:bg-purple-500/5',
                pulseAnimation === 'timer' && 'animate-pulse border-purple-500 bg-purple-500/10',
                'border-industrial-border bg-industrial-bg'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                'bg-purple-500/20 text-purple-400'
              )}>
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-industrial-text-primary">
                  定时触发
                </div>
                <div className="text-xs text-industrial-text-muted mt-0.5">
                  模拟定时器事件
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-industrial-text-secondary mb-2">
                停留时间: {dwellTime} 秒
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={dwellTime}
                onChange={(e) => setDwellTime(Number(e.target.value))}
                className="w-full accent-accent-amber"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-industrial-text-secondary mb-2">
                定时器间隔 (秒)
              </label>
              <input
                type="number"
                min={1}
                value={timerInterval}
                onChange={(e) => setTimerInterval(Number(e.target.value))}
                className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary text-sm focus:outline-none focus:border-accent-teal transition-colors font-mono"
              />
            </div>
          </div>

          <div className="border-t border-industrial-border pt-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold text-industrial-text-primary mb-3 flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-400" />
              循环测试
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="max-h-40 overflow-y-auto space-y-1">
                {rules.filter(r => r.enabled).map((rule) => (
                  <label
                    key={rule.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-industrial-bg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={cycleRuleIds.includes(rule.id)}
                      onChange={() => toggleCycleRule(rule.id)}
                      disabled={cycleRunning}
                      className="w-4 h-4 rounded border-industrial-border bg-industrial-bg text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-sm text-industrial-text-primary truncate">
                      {rule.name}
                    </span>
                  </label>
                ))}
                {rules.filter(r => r.enabled).length === 0 && (
                  <p className="text-xs text-industrial-text-muted text-center py-4">
                    暂无启用的规则
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-industrial-text-secondary mb-1">
                  间隔时间 (秒)
                </label>
                <input
                  type="number"
                  min={1}
                  value={cycleInterval}
                  onChange={(e) => setCycleInterval(Number(e.target.value))}
                  disabled={cycleRunning}
                  className="w-full px-3 py-2 bg-industrial-bg border border-industrial-border rounded-md text-industrial-text-primary text-sm focus:outline-none focus:border-accent-teal transition-colors font-mono disabled:opacity-50"
                />
              </div>

              <button
                onClick={toggleCycle}
                disabled={!cycleRunning && cycleRuleIds.length === 0}
                className={cn(
                  'w-full px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2',
                  cycleRunning
                    ? 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'
                    : 'bg-accent-teal text-industrial-bg hover:bg-accent-teal-hover',
                  !cycleRunning && cycleRuleIds.length === 0 && 'opacity-50 cursor-not-allowed'
                )}
              >
                {cycleRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    停止循环
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    开始循环
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 中央弹窗展示区 */}
        <div className="col-span-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-industrial-text-primary flex items-center gap-2">
              <Monitor className="w-4 h-4 text-accent-teal" />
              弹窗展示区
            </h2>
            <div className="flex items-center gap-1 bg-industrial-card border border-industrial-border rounded-md p-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5',
                  deviceMode === 'desktop'
                    ? 'bg-accent-teal text-industrial-bg'
                    : 'text-industrial-text-secondary hover:text-industrial-text-primary'
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                桌面
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5',
                  deviceMode === 'mobile'
                    ? 'bg-accent-teal text-industrial-bg'
                    : 'text-industrial-text-secondary hover:text-industrial-text-primary'
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                手机
              </button>
            </div>
          </div>

          <div className="flex-1 bg-industrial-card border border-industrial-border rounded-md overflow-hidden flex flex-col">
            {/* 浏览器/手机框架 */}
            <div className="h-8 bg-industrial-bg border-b border-industrial-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-red" />
              <div className="w-3 h-3 rounded-full bg-accent-amber" />
              <div className="w-3 h-3 rounded-full bg-accent-teal" />
              <div className="flex-1 max-w-xs mx-auto h-5 bg-industrial-border/50 rounded-full" />
            </div>

            {/* 内容区 - 网格背景 */}
            <div 
              className={cn(
                'flex-1 relative overflow-hidden',
                'bg-[linear-gradient(rgba(48,54,61,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(48,54,61,0.3)_1px,transparent_1px)]',
                'bg-[size:20px_20px]'
              )}
            >
              {/* 模拟的"点击我"按钮 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={handleClick}
                  className="px-6 py-3 bg-accent-teal text-industrial-bg font-medium rounded-md hover:bg-accent-teal-hover transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <MousePointer className="w-5 h-5" />
                  点击测试
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* 弹窗叠加展示 */}
              {activePopups.map((activePopup, index) => (
                <div 
                  key={activePopup.id}
                  className="absolute inset-0"
                  style={{ zIndex: 50 + index }}
                >
                  <PopupRenderer
                    rule={activePopup.rule}
                    visible={true}
                    onClose={() => handleClosePopup(activePopup.id)}
                  />
                </div>
              ))}

              {/* 为了不影响全局 popup 状态，我们使用独立的渲染 */}
              {popup.visible && popup.rule && activePopups.length === 0 && (
                <div className="absolute inset-0" style={{ zIndex: 100 }}>
                  <PopupRenderer
                    rule={popup.rule}
                    visible={true}
                    onClose={hidePopup}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧事件日志 */}
        <div className="col-span-3 bg-industrial-card border border-industrial-border rounded-md flex flex-col min-h-0">
          <div className="flex items-center justify-between p-4 border-b border-industrial-border">
            <h2 className="text-sm font-semibold text-industrial-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-teal" />
              事件日志
            </h2>
            <button
              onClick={clearLogs}
              className="text-xs text-industrial-text-muted hover:text-industrial-text-secondary transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-industrial-text-muted">暂无日志</p>
              </div>
            ) : (
              logs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className="relative pl-4 pb-3 border-l-2 border-industrial-border last:border-transparent"
                >
                  <div className={cn(
                    'absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-industrial-card',
                    triggerTypeColors[log.triggerType] || 'bg-industrial-border'
                  )} />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-industrial-text-muted">
                        {formatTime(log.timestamp)}
                      </span>
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        log.action === 'show' ? 'bg-accent-teal' : 'bg-accent-red'
                      )} />
                    </div>
                    <div className="text-sm font-medium text-industrial-text-primary">
                      {log.ruleName}
                    </div>
                    <div className="text-xs text-industrial-text-secondary">
                      {triggerTypeLabels[log.triggerType] || log.triggerType}
                    </div>
                    {log.details && (
                      <div className="text-xs text-industrial-text-muted">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          <div className="p-3 border-t border-industrial-border">
            <p className="text-xs text-industrial-text-muted text-center">
              共 {logs.length} 条日志
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
