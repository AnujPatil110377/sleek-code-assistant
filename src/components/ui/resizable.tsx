'use client'

import * as ResizablePrimitive from 'react-resizable-panels'
import { GripVertical } from "lucide-react"

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={className}
    {...props}
  >
    <GripVertical className="h-4 w-4" />
  </div>
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