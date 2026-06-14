import { useState, useEffect } from 'react'
import { Plus, Edit2, Copy, Trash2, Power, CheckSquare, Square, Play, MousePointer, Clock, Timer, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRuleStore } from '@/store/ruleStore'
import RuleEditor from '@/components/RuleEditor/RuleEditor'
import type { PopupRule, TriggerType } from '@/types'

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

const triggerIcons: Record<TriggerType, typeof Play> = {
  page_load: Play,
  click: MousePointer,
  dwell: Clock,
  timer: Timer,
}

function getTriggerSummary(rule: PopupRule): string {
  const { trigger } = rule
  const typeLabel = triggerTypeLabels[trigger.type]
  
  switch (trigger.type) {
    case 'page_load':
      return trigger.delay > 0 ? `${typeLabel} · 延迟 ${trigger.delay}s` : typeLabel
    case 'click':
      return `${typeLabel} · ${trigger.clickSelector || '未设置选择器'}`
    case 'dwell':
      return `${typeLabel} · ${trigger.dwellTime || 3}s`
    case 'timer':
      return `${typeLabel} · 每 ${trigger.timerInterval || 10}s`
    default:
      return typeLabel
  }
}

export default function Rules() {
  const { rules, loading, error, fetchRules, addRule, updateRule, deleteRule, toggleRule } = useRuleStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PopupRule | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleSelectAll = () => {
    if (selectedIds.size === rules.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(rules.map(r => r.id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleCreate = () => {
    setEditingRule(null)
    setEditorOpen(true)
  }

  const handleEdit = (rule: PopupRule) => {
    setEditingRule(rule)
    setEditorOpen(true)
  }

  const handleCopy = async (rule: PopupRule) => {
    const newRule = {
      name: `${rule.name} (副本)`,
      enabled: rule.enabled,
      trigger: rule.trigger,
      position: rule.position,
      close: rule.close,
      style: rule.style,
      content: rule.content,
    }
    await addRule(newRule)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此规则吗？')) {
      await deleteRule(id)
      const newSelected = new Set(selectedIds)
      newSelected.delete(id)
      setSelectedIds(newSelected)
    }
  }

  const handleToggle = async (id: string) => {
    await toggleRule(id)
  }

  const handleSave = async (ruleData: Partial<PopupRule>) => {
    if (editingRule) {
      await updateRule(editingRule.id, ruleData)
    } else {
      await addRule(ruleData as Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>)
    }
  }

  const handleBatchEnable = async () => {
    for (const id of selectedIds) {
      const rule = rules.find(r => r.id === id)
      if (rule && !rule.enabled) {
        await toggleRule(id)
      }
    }
  }

  const handleBatchDisable = async () => {
    for (const id of selectedIds) {
      const rule = rules.find(r => r.id === id)
      if (rule && rule.enabled) {
        await toggleRule(id)
      }
    }
  }

  const handleBatchDelete = async () => {
    if (window.confirm(`确定要删除选中的 ${selectedIds.size} 条规则吗？`)) {
      for (const id of selectedIds) {
        await deleteRule(id)
      }
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">规则管理</h1>
          <p className="text-sm text-industrial-text-secondary mt-1">
            共 {rules.length} 条规则
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pr-3 border-r border-industrial-border">
              <span className="text-sm text-industrial-text-secondary">
                已选 {selectedIds.size} 项
              </span>
              <button
                onClick={handleBatchEnable}
                className="px-3 py-1.5 text-sm bg-industrial-border text-industrial-text-primary rounded-md hover:bg-industrial-border-light transition-colors flex items-center gap-1.5"
              >
                <Power className="w-4 h-4" />
                启用
              </button>
              <button
                onClick={handleBatchDisable}
                className="px-3 py-1.5 text-sm bg-industrial-border text-industrial-text-primary rounded-md hover:bg-industrial-border-light transition-colors flex items-center gap-1.5"
              >
                <Power className="w-4 h-4" />
                禁用
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1.5 text-sm bg-accent-red/10 text-accent-red rounded-md hover:bg-accent-red/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          )}
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-teal text-industrial-bg font-medium rounded-md hover:bg-accent-teal-hover transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建规则
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-accent-red/10 border border-accent-red/30 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-accent-red" />
          <span className="text-sm text-accent-red">{error}</span>
        </div>
      )}

      {loading && rules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-industrial-text-secondary">加载中...</div>
        </div>
      ) : rules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-industrial-card border border-industrial-border flex items-center justify-center">
              <Play className="w-8 h-8 text-industrial-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-industrial-text-primary mb-2">
              暂无规则
            </h3>
            <p className="text-sm text-industrial-text-secondary mb-4">
              创建您的第一条弹窗规则
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-accent-teal text-industrial-bg font-medium rounded-md hover:bg-accent-teal-hover transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新建规则
            </button>
          </div>
        </div>
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-industrial-text-secondary hover:text-industrial-text-primary transition-colors"
              >
                {selectedIds.size === rules.length ? (
                  <CheckSquare className="w-4 h-4 text-accent-teal" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                全选
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rules.map((rule) => {
                const TriggerIcon = triggerIcons[rule.trigger.type]
                const isSelected = selectedIds.has(rule.id)
                
                return (
                  <div
                    key={rule.id}
                    className={cn(
                      'relative bg-industrial-card border border-industrial-border rounded-md overflow-hidden transition-all duration-200',
                      'hover:border-accent-teal/50 hover:shadow-lg hover:shadow-accent-teal/10',
                      isSelected && 'border-accent-teal ring-2 ring-accent-teal/30'
                    )}
                  >
                    <div className={cn(
                      'absolute left-0 top-0 bottom-0 w-1',
                      triggerTypeColors[rule.trigger.type]
                    )} />

                    <div className="p-4 pl-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelect(rule.id)}
                            className="text-industrial-text-muted hover:text-industrial-text-primary transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-accent-teal" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <TriggerIcon className={cn(
                            'w-5 h-5',
                            rule.enabled ? 'text-accent-teal' : 'text-industrial-text-muted'
                          )} />
                          <h3 className={cn(
                            'font-medium',
                            rule.enabled ? 'text-industrial-text-primary' : 'text-industrial-text-muted'
                          )}>
                            {rule.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={cn(
                            'relative w-10 h-5 rounded-full transition-colors',
                            rule.enabled ? 'bg-accent-teal' : 'bg-industrial-border'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                              rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>

                      <p className="text-sm text-industrial-text-secondary mb-4 pl-6">
                        {getTriggerSummary(rule)}
                      </p>

                      <div className="flex items-center gap-2 pl-6">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="flex-1 px-3 py-1.5 text-sm bg-industrial-border text-industrial-text-primary rounded hover:bg-industrial-border-light transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit2 className="w-4 h-4" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleCopy(rule)}
                          className="flex-1 px-3 py-1.5 text-sm bg-industrial-border text-industrial-text-primary rounded hover:bg-industrial-border-light transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-4 h-4" />
                          复制
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="flex-1 px-3 py-1.5 text-sm bg-accent-red/10 text-accent-red rounded hover:bg-accent-red/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <RuleEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        rule={editingRule}
        onSave={handleSave}
      />
    </div>
  )
}
