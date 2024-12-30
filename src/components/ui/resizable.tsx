'use client'

import { DragHandleDots2Icon } from '@radix-ui/react-icons'
import * as ResizablePrimitive from 'react-resizable-panels'

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <ResizablePrimitive.PanelResizeHandle
    className={className}
    {...props}
  >
    <DragHandleDots2Icon className="h-4 w-4" />
  </ResizablePrimitive.PanelResizeHandle>
)

const ResizableBox = ({
  children,
  defaultSize,
  minHeight,
  maxHeight,
  className,
  handle,
}: {
  children: React.ReactNode
  defaultSize: { height: string }
  minHeight?: number | string
  maxHeight?: number | string
  className?: string
  handle?: React.ReactNode
}) => {
  return (
    <div 
      className={className}
      style={{ 
        height: defaultSize.height,
        minHeight,
        maxHeight,
      }}
    >
      {children}
      {handle}
    </div>
  )
}

export { ResizablePanel, ResizableHandle, ResizableBox }
