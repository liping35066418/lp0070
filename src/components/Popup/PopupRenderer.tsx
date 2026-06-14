import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PopupRule } from '@/types'

interface PopupRendererProps {
  rule: PopupRule | null
  visible: boolean
  onClose?: () => void
}

export default function PopupRenderer({ rule, visible, onClose }: PopupRendererProps) {
  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleMaskClick = useCallback(() => {
    if (rule?.close.mask) {
      handleClose()
    }
  }, [rule?.close.mask, handleClose])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && rule?.close.escape) {
        handleClose()
      }
    },
    [rule?.close.escape, handleClose]
  )

  useEffect(() => {
    if (visible && rule?.close.escape) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, rule?.close.escape, handleKeyDown])

  useEffect(() => {
    if (visible && rule?.close.timeout && rule.close.timeout > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, rule.close.timeout * 1000)
      return () => clearTimeout(timer)
    }
  }, [visible, rule?.close.timeout, handleClose])

  if (!rule || !visible) return null

  const { position, style, content, close } = rule

  const positionClasses = cn(
    'fixed z-50',
    position.vertical === 'top' && 'top-0',
    position.vertical === 'center' && 'top-1/2 -translate-y-1/2',
    position.vertical === 'bottom' && 'bottom-0',
    position.horizontal === 'left' && 'left-0',
    position.horizontal === 'center' && 'left-1/2 -translate-x-1/2',
    position.horizontal === 'right' && 'right-0'
  )

  const getAnimationClass = () => {
    switch (style.animation) {
      case 'fade':
        return 'animate-fade-in'
      case 'slide':
        if (position.horizontal === 'right') return 'animate-slide-in-right'
        if (position.horizontal === 'left') return 'animate-slide-in-left'
        if (position.vertical === 'top') return 'animate-slide-in-top'
        if (position.vertical === 'bottom') return 'animate-slide-in-bottom'
        return 'animate-fade-in'
      case 'scale':
        return 'animate-scale-in'
      case 'spring':
        return 'animate-spring-in'
      default:
        return 'animate-fade-in'
    }
  }

  const maskStyle = {
    backgroundColor: style.maskColor,
    opacity: style.maskOpacity,
    backdropFilter: `blur(${style.maskBlur}px)`,
    WebkitBackdropFilter: `blur(${style.maskBlur}px)`,
  }

  const popupStyle = {
    width: `${style.width}px`,
    height: style.height === 'auto' ? 'auto' : `${style.height}px`,
    borderRadius: `${style.borderRadius}px`,
    marginLeft: position.horizontal === 'left' ? `${position.offsetX}px` : undefined,
    marginRight: position.horizontal === 'right' ? `${position.offsetX}px` : undefined,
    marginTop: position.vertical === 'top' ? `${position.offsetY}px` : undefined,
    marginBottom: position.vertical === 'bottom' ? `${position.offsetY}px` : undefined,
  }

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 animate-fade-in"
        style={maskStyle}
        onClick={handleMaskClick}
      />

      <div className={positionClasses}>
        <div
          className={cn(
            'relative bg-industrial-card border border-industrial-border shadow-2xl',
            getAnimationClass()
          )}
          style={popupStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {close.button && (
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-md text-industrial-text-secondary hover:text-industrial-text-primary hover:bg-industrial-border/50 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-6">
            {content.title && (
              <h3 className="text-lg font-semibold text-industrial-text-primary mb-3">
                {content.title}
              </h3>
            )}

            {content.imageUrl && (
              <div className="mb-4 -mx-6 -mt-6">
                <img
                  src={content.imageUrl}
                  alt=""
                  className="w-full h-32 object-cover rounded-t-lg"
                  style={{
                    borderTopLeftRadius: `${style.borderRadius}px`,
                    borderTopRightRadius: `${style.borderRadius}px`,
                  }}
                />
              </div>
            )}

            {content.body && (
              <p className="text-sm text-industrial-text-secondary mb-4">
                {content.body}
              </p>
            )}

            <div className="flex gap-3">
              {content.confirmText && (
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-accent-teal text-industrial-bg font-medium rounded-md hover:bg-accent-teal-hover transition-colors"
                >
                  {content.confirmText}
                </button>
              )}
              {content.cancelText && (
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-industrial-border text-industrial-text-primary font-medium rounded-md hover:bg-industrial-border-light transition-colors"
                >
                  {content.cancelText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
