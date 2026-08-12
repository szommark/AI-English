import { useEffect, useState, type RefObject } from 'react'

export interface ContainerSize {
  width: number
  height: number
}

export function useContainerSize<T extends HTMLElement>(ref: RefObject<T | null>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    setSize({ width: el.clientWidth, height: el.clientHeight })

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [ref])

  return size
}
