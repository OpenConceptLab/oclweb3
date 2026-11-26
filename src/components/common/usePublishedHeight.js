import React from 'react'

// Publishes an element's height as a CSS variable on the document while it shows, and clears it after
const usePublishedHeight = (name, shown) => {
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if(!shown || !el)
      return undefined
    const root = document.documentElement.style
    const update = () => root.setProperty(name, `${el.offsetHeight}px`)
    update()
    const observer = new window.ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.removeProperty(name)
    }
  }, [name, shown])
  return ref
}

export default usePublishedHeight
